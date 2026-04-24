import { useEffect, useState } from 'react';
import { getMovies, getPosterUrl } from '../services/moviesService';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, signOut } = useAuth();
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        const result = await getMovies({ page: 1 });
        setMovies(result.movies);
        setTotal(result.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl">Cargando películas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-netflix-red mb-2">Error</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl font-bold text-netflix-red">Movies Explorer</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">
            {user?.user_metadata?.full_name || user?.email}
          </span>
          <button
            onClick={signOut}
            className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      <p className="text-gray-400 mb-8">
        Mostrando {movies.length} de {total.toLocaleString()} películas.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="bg-netflix-dark rounded overflow-hidden hover:scale-105 transition-transform cursor-pointer"
          >
            {movie.poster_path ? (
              <img
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                className="w-full h-auto"
                loading="lazy"
              />
            ) : (
              <div className="aspect-[2/3] bg-netflix-gray flex items-center justify-center text-xs text-gray-500">
                Sin poster
              </div>
            )}
            <div className="p-2">
              <h3 className="text-sm font-semibold truncate">{movie.title}</h3>
              <p className="text-xs text-gray-400">
                {movie.release_year} · {movie.vote_average?.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}