import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import {
  getRandomHeroMovie,
  getTopMovies,
  getMoviesByGenre,
} from '../services/moviesService';

const GENRE_IDS = {
  ACCION: 28,
  CIENCIA_FICCION: 878,
  COMEDIA: 35,
  TERROR: 27,
  ROMANCE: 10749,
  ANIMACION: 16,
};

export default function Home() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [rows, setRows] = useState({
    top: [],
    accion: [],
    sciFi: [],
    comedia: [],
    terror: [],
    romance: [],
    animacion: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [hero, top, accion, sciFi, comedia, terror, romance, animacion] =
          await Promise.all([
            getRandomHeroMovie(),
            getTopMovies(20),
            getMoviesByGenre(GENRE_IDS.ACCION, 20),
            getMoviesByGenre(GENRE_IDS.CIENCIA_FICCION, 20),
            getMoviesByGenre(GENRE_IDS.COMEDIA, 20),
            getMoviesByGenre(GENRE_IDS.TERROR, 20),
            getMoviesByGenre(GENRE_IDS.ROMANCE, 20),
            getMoviesByGenre(GENRE_IDS.ANIMACION, 20),
          ]);

        setHeroMovie(hero);
        setRows({ top, accion, sciFi, comedia, terror, romance, animacion });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-netflix-red mb-2">Error</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-netflix-black min-h-screen">
      <Navbar />
      <HeroBanner movie={heroMovie} />

      <div className="relative -mt-40 z-10 pb-16 space-y-2">
        <MovieRow title="Tendencias ahora" movies={rows.top} />
        <MovieRow title="Acción sin límites" movies={rows.accion} />
        <MovieRow title="Ciencia ficción" movies={rows.sciFi} />
        <MovieRow title="Para reír" movies={rows.comedia} />
        <MovieRow title="Terror" movies={rows.terror} />
        <MovieRow title="Romance" movies={rows.romance} />
        <MovieRow title="Animación" movies={rows.animacion} />
      </div>

      <footer className="bg-netflix-black border-t border-netflix-gray py-8 px-8 md:px-16 text-center text-gray-500 text-sm">
        <p>
          Esta aplicación utiliza la API de TMDB pero no está respaldada ni
          certificada por TMDB.
        </p>
        <p className="mt-2">Movies Explorer © 2026</p>
      </footer>
    </div>
  );
}