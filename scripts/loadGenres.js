import dotenv from 'dotenv';
import { supabaseAdmin } from './supabaseAdmin.js';

dotenv.config({ path: '.env.local' });

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.error('Falta TMDB_API_KEY en .env.local');
  process.exit(1);
}

async function loadGenres() {
  console.log('🎬 Cargando géneros desde TMDb...');

  try {
    // Pedir géneros a TMDb (en español)
    const url = `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=es-MX`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const genres = data.genres;

    console.log(`Recibidos ${genres.length} géneros de TMDb`);

    // Insertar en Supabase con UPSERT (si el id ya existe, lo actualiza)
    const { data: inserted, error } = await supabaseAdmin
      .from('genres')
      .upsert(genres, { onConflict: 'id' })
      .select();

    if (error) {
      throw new Error(`Error al insertar en Supabase: ${error.message}`);
    }

    console.log(`${inserted.length} géneros guardados en Supabase`);
    console.log('Muestra:', inserted.slice(0, 3));
  } catch (err) {
    console.error('Error en el ETL de géneros:', err.message);
    process.exit(1);
  }
}

loadGenres();