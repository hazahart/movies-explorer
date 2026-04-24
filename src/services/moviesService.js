// src/services/moviesService.js
// Todas las consultas relacionadas con películas van aquí.
// Los componentes NUNCA importan supabase directamente; usan estas funciones.

import { supabase } from '../lib/supabaseClient';

export const PAGE_SIZE = 20;

/**
 * Obtiene una página de películas con sus géneros.
 */
export async function getMovies({ page = 1, search = '', genreId = null } = {}) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
        .from('movies')
        .select(
            `
      id,
      title,
      overview,
      release_date,
      release_year,
      poster_path,
      backdrop_path,
      vote_average,
      vote_count,
      popularity,
      trailer_key,
      movie_genres (
        genres ( id, name )
      )
    `,
            { count: 'exact' }
        )
        .order('popularity', { ascending: false });

    if (search && search.trim() !== '') {
        query = query.ilike('title', `%${search.trim()}%`);
    }

    if (genreId) {
        const { data: movieIds } = await supabase
            .from('movie_genres')
            .select('movie_id')
            .eq('genre_id', genreId);

        const ids = movieIds?.map(row => row.movie_id) || [];
        if (ids.length === 0) {
            return { movies: [], total: 0, totalPages: 0 };
        }
        query = query.in('id', ids);
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }

    const movies = (data || []).map(movie => ({
        ...movie,
        genres: movie.movie_genres.map(mg => mg.genres),
    }));

    return {
        movies,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    };
}

/**
 * Detalle completo de UNA película por ID.
 */
export async function getMovieById(id) {
    const { data, error } = await supabase
        .from('movies')
        .select(`
      *,
      movie_genres (
        genres ( id, name )
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching movie:', error);
        throw error;
    }

    return {
        ...data,
        genres: data.movie_genres.map(mg => mg.genres),
    };
}

/**
 * Todos los géneros (para filtros).
 */
export async function getGenres() {
    const { data, error } = await supabase
        .from('genres')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching genres:', error);
        throw error;
    }

    return data || [];
}

/**
 * URL completa de un poster de TMDb.
 * Tamaños: w92, w154, w185, w342, w500, w780, original
 */
export function getPosterUrl(path, size = 'w342') {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * URL de backdrop (imagen grande de fondo).
 * Tamaños: w300, w780, w1280, original
 */
export function getBackdropUrl(path, size = 'w1280') {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * URL de YouTube embed para reproducir trailer al hover.
 */
export function getTrailerEmbedUrl(key, { autoplay = true, mute = true, controls = false } = {}) {
    if (!key) return null;
    const params = new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        mute: mute ? '1' : '0',
        controls: controls ? '1' : '0',
        modestbranding: '1',
        rel: '0',
        playsinline: '1',
    });
    return `https://www.youtube.com/embed/${key}?${params.toString()}`;
}