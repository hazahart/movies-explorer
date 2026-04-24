import dotenv from 'dotenv';
import { supabaseAdmin } from './supabaseAdmin.js';

dotenv.config({ path: '.env.local' });

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Configuración
const TOTAL_PAGES = 500;       // 500 × 20 = 10,000 películas
const PAGES_PER_CHUNK = 25;    // Procesar 25 páginas (500 películas) por chunk
const DELAY_MS = 250;          // Pausa entre requests (para no saturar las 40 solicitudes cada 10 segundos de TMBd)
const MAX_RETRIES = 3;         // Reintentos por página fallida

if (!TMDB_API_KEY) {
  console.error('Falta TMDB_API_KEY en .env.local');
  process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Pide 1 página con reintentos automáticos
async function fetchMoviesPage(page, attempt = 1) {
  const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=es-MX&page=${page}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Si TMDb devuelve un estado 429 o alguno de los 500, reintentamos
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        console.log(`  TMDb respondió ${response.status}, reintentando página ${page} (intento ${attempt + 1})...`);
        await sleep(2000 * attempt); // Backoff exponencial
        return fetchMoviesPage(page, attempt + 1);
      }
      throw new Error(`HTTP ${response.status} en página ${page}`);
    }
    return response.json();
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.log(`  Error de red, reintentando página ${page} (intento ${attempt + 1})...`);
      await sleep(2000 * attempt);
      return fetchMoviesPage(page, attempt + 1);
    }
    throw err;
  }
}

// Transforma el contenido traido de TMDB al formato de la tabla movies de Suoabase
function transformMovie(tmdbMovie) {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    original_title: tmdbMovie.original_title,
    overview: tmdbMovie.overview || null,
    release_date: tmdbMovie.release_date || null,
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path,
    vote_average: tmdbMovie.vote_average,
    vote_count: tmdbMovie.vote_count,
    popularity: tmdbMovie.popularity,
    original_language: tmdbMovie.original_language,
  };
}

// Inserta un lote en Supabase con manejo de errores
async function upsertBatch(tableName, batch, conflictColumns) {
  const { error } = await supabaseAdmin
    .from(tableName)
    .upsert(batch, { onConflict: conflictColumns });

  if (error) {
    throw new Error(`Supabase error en ${tableName}: ${error.message}`);
  }
}

// Procesa un rango de páginas y las inserta en Supabase
async function processChunk(startPage, endPage) {
  const movies = [];
  const movieGenres = [];
  const failedPages = [];

  for (let page = startPage; page <= endPage; page++) {
    try {
      const data = await fetchMoviesPage(page);
      const moviesInPage = data.results;

      movies.push(...moviesInPage.map(transformMovie));
      for (const movie of moviesInPage) {
        for (const genreId of movie.genre_ids) {
          movieGenres.push({ movie_id: movie.id, genre_id: genreId });
        }
      }

      process.stdout.write(`\r  Página ${page}/${TOTAL_PAGES}`);
      if (page < endPage) await sleep(DELAY_MS);
    } catch (err) {
      console.log(`\n  Página ${page} falló definitivamente: ${err.message}`);
      failedPages.push(page);
    }
  }
  console.log(); // salto de línea

  // Deduplicar dentro del chunk
  const uniqueMovies = Array.from(new Map(movies.map(m => [m.id, m])).values());
  const uniqueMovieGenres = Array.from(
    new Map(movieGenres.map(mg => [`${mg.movie_id}-${mg.genre_id}`, mg])).values()
  );

  // Insertar en Supabase
  if (uniqueMovies.length > 0) {
    await upsertBatch('movies', uniqueMovies, 'id');
    console.log(`  ${uniqueMovies.length} películas guardadas en Supabase`);
  }
  if (uniqueMovieGenres.length > 0) {
    await upsertBatch('movie_genres', uniqueMovieGenres, 'movie_id,genre_id');
    console.log(`  ${uniqueMovieGenres.length} relaciones guardadas`);
  }

  return { movieCount: uniqueMovies.length, relationCount: uniqueMovieGenres.length, failedPages };
}

async function loadMovies() {
  console.log(`Iniciando carga de ${TOTAL_PAGES} páginas (~${TOTAL_PAGES * 20} películas)`);
  console.log(`Procesando en chunks de ${PAGES_PER_CHUNK} páginas\n`);

  const startTime = Date.now();
  let totalMovies = 0;
  let totalRelations = 0;
  let allFailedPages = [];

  // Procesar en chunks
  for (let chunkStart = 1; chunkStart <= TOTAL_PAGES; chunkStart += PAGES_PER_CHUNK) {
    const chunkEnd = Math.min(chunkStart + PAGES_PER_CHUNK - 1, TOTAL_PAGES);
    const chunkNum = Math.ceil(chunkStart / PAGES_PER_CHUNK);
    const totalChunks = Math.ceil(TOTAL_PAGES / PAGES_PER_CHUNK);

    console.log(`\nChunk ${chunkNum}/${totalChunks} (páginas ${chunkStart}-${chunkEnd})`);

    try {
      const result = await processChunk(chunkStart, chunkEnd);
      totalMovies += result.movieCount;
      totalRelations += result.relationCount;
      allFailedPages.push(...result.failedPages);
    } catch (err) {
      console.error(`\nError crítico en chunk ${chunkNum}:`, err.message);
      console.log('Continuando con el siguiente chunk...');
    }
  }

  const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(1);

  console.log('\n' + '='.repeat(50));
  console.log('ETL COMPLETADO');
  console.log('='.repeat(50));
  console.log(`   Películas cargadas: ${totalMovies}`);
  console.log(`   Relaciones cargadas: ${totalRelations}`);
  console.log(`   Tiempo: ${elapsedMin} minutos`);
  if (allFailedPages.length > 0) {
    console.log(`   Páginas fallidas: ${allFailedPages.join(', ')}`);
    console.log(`   (Puedes volver a correr el script, los upserts no duplican)`);
  }
}

loadMovies();