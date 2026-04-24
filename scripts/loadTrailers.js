import dotenv from 'dotenv';
import { supabaseAdmin } from './supabaseAdmin.js';

dotenv.config({ path: '.env.local' });

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Configuración
const BATCH_SIZE = 500;        // Cuántas películas procesar por batch (para logs/progreso)
const DELAY_MS = 150;          // Pausa entre requests a TMDb (~6-7 req/s, seguro)
const MAX_RETRIES = 3;         // Reintentos por película
const SKIP_EXISTING = true;    // Si true, omite películas que ya tienen trailer_key

if (!TMDB_API_KEY) {
  console.error('Falta TMDB_API_KEY en .env.local');
  process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Elige el "mejor" trailer de la lista que devuelve TMDb.
 * Prioridades (en orden):
 *   1. Tipo "Trailer" en YouTube, oficial, en español
 *   2. Tipo "Trailer" en YouTube, oficial, en inglés
 *   3. Tipo "Trailer" en YouTube (cualquier idioma)
 *   4. Tipo "Teaser" en YouTube
 *   5. Cualquier video en YouTube
 */
function pickBestTrailer(videos) {
  if (!videos || videos.length === 0) return null;

  const youtubeVideos = videos.filter(v => v.site === 'YouTube');
  if (youtubeVideos.length === 0) return null;

  // Filtros en orden de prioridad
  const priorities = [
    v => v.type === 'Trailer' && v.official && v.iso_639_1 === 'es',
    v => v.type === 'Trailer' && v.official && v.iso_639_1 === 'en',
    v => v.type === 'Trailer' && v.iso_639_1 === 'es',
    v => v.type === 'Trailer' && v.iso_639_1 === 'en',
    v => v.type === 'Trailer',
    v => v.type === 'Teaser',
    v => true, // fallback: cualquier video
  ];

  for (const predicate of priorities) {
    const match = youtubeVideos.find(predicate);
    if (match) return match.key;
  }

  return null;
}

/**
 * Pide los videos de UNA película con reintentos.
 */
async function fetchMovieVideos(movieId, attempt = 1) {
  // Pedimos en es-MX y en-US para maximizar la probabilidad de encontrar trailer
  const url = `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=es-MX&include_video_language=es,en,null`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        await sleep(2000 * attempt);
        return fetchMovieVideos(movieId, attempt + 1);
      }
      return null; // 404 u otros errores no retryables → sin trailer
    }

    const data = await response.json();
    return data.results || [];
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await sleep(2000 * attempt);
      return fetchMovieVideos(movieId, attempt + 1);
    }
    return null;
  }
}

async function loadTrailers() {
  // 1. Cargar IDs de películas desde Supabase (paginado para evitar límites)
  console.log('Obteniendo lista de películas desde Supabase...');
  const allMovies = [];
  const FETCH_PAGE = 1000;
  let from = 0;

  while (true) {
    let query = supabaseAdmin
      .from('movies')
      .select('id, title, trailer_key')
      .order('popularity', { ascending: false })
      .range(from, from + FETCH_PAGE - 1);

    const { data, error } = await query;
    if (error) {
      console.error('Error al obtener películas:', error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;

    allMovies.push(...data);
    from += FETCH_PAGE;
    if (data.length < FETCH_PAGE) break;
  }

  const toProcess = SKIP_EXISTING
    ? allMovies.filter(m => !m.trailer_key)
    : allMovies;

  console.log(`Total películas en DB: ${allMovies.length}`);
  console.log(`A procesar ahora: ${toProcess.length} ${SKIP_EXISTING ? '(omitiendo las que ya tienen trailer)' : ''}`);

  if (toProcess.length === 0) {
    console.log('Todas las películas ya tienen trailer_key. Nada que hacer.');
    return;
  }

  const startTime = Date.now();
  let processed = 0;
  let trailersFound = 0;
  let trailersNotFound = 0;
  let errors = 0;
  let updatesBuffer = [];

  // 2. Procesar película por película
  for (const movie of toProcess) {
    processed++;

    try {
      const videos = await fetchMovieVideos(movie.id);

      if (videos === null) {
        errors++;
      } else {
        const trailerKey = pickBestTrailer(videos);
        updatesBuffer.push({ id: movie.id, trailer_key: trailerKey });

        if (trailerKey) trailersFound++;
        else trailersNotFound++;
      }

      // Actualizar progreso en pantalla cada película
      if (processed % 25 === 0 || processed === toProcess.length) {
        const pct = ((processed / toProcess.length) * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
        const eta = ((Date.now() - startTime) / processed * (toProcess.length - processed) / 60000).toFixed(1);
        process.stdout.write(
          `\r  ${processed}/${toProcess.length} (${pct}%) · ${trailersFound} trailers · ${trailersNotFound} sin trailer · ${elapsed}m / ETA ${eta}m  `
        );
      }

      // Flush al DB cada BATCH_SIZE para persistir progreso
      if (updatesBuffer.length >= BATCH_SIZE) {
        await flushUpdates(updatesBuffer);
        updatesBuffer = [];
      }

      await sleep(DELAY_MS);
    } catch (err) {
      errors++;
      console.error(`\n  Error en película ${movie.id} (${movie.title}):`, err.message);
    }
  }

  // Flush final
  if (updatesBuffer.length > 0) {
    await flushUpdates(updatesBuffer);
  }

  const totalMinutes = ((Date.now() - startTime) / 60000).toFixed(1);

  console.log('\n\n' + '='.repeat(60));
  console.log('ETL DE TRAILERS COMPLETADO');
  console.log('='.repeat(60));
  console.log(`   Películas procesadas: ${processed}`);
  console.log(`   Con trailer encontrado: ${trailersFound}`);
  console.log(`   Sin trailer disponible: ${trailersNotFound}`);
  console.log(`   Errores: ${errors}`);
  console.log(`   Tiempo total: ${totalMinutes} minutos`);
  console.log(`   Cobertura: ${((trailersFound / processed) * 100).toFixed(1)}%`);
}

/**
 * Hace UPDATE a Supabase con los trailers encontrados.
 * Usamos update uno por uno porque upsert requería tener todas las columnas.
 */
async function flushUpdates(updates) {
  for (const update of updates) {
    const { error } = await supabaseAdmin
      .from('movies')
      .update({ trailer_key: update.trailer_key })
      .eq('id', update.id);

    if (error) {
      console.error(`\nError al actualizar ${update.id}:`, error.message);
    }
  }
}

loadTrailers();