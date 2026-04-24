import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getMovies } from '../services/moviesService';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setMovies([]);
      setTotal(0);
      return;
    }

    async function searchMovies() {
      try {
        setLoading(true);
        setError(null);
        const result = await getMovies({ page: 1, search: query });
        setMovies(result.movies);
        setTotal(result.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(searchMovies, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="bg-netflix-black min-h-screen">
      <Navbar />

      <div className="pt-24 px-8 md:px-16 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <SearchIcon className="w-5 h-5" />
            <span className="text-sm">Resultados de búsqueda</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            "{query}"
          </h1>
          {!loading && total > 0 && (
            <p className="text-gray-400 mt-2">
              {total.toLocaleString()} {total === 1 ? 'resultado' : 'resultados'}
            </p>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-netflix-red text-xl mb-2">Error al buscar</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && movies.length === 0 && query && (
          <div className="text-center py-20">
            <p className="text-white text-xl mb-2">
              No encontramos resultados para "{query}"
            </p>
            <p className="text-gray-400">
              Intenta con otro título o palabra clave
            </p>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-8">
            {movies.map((movie) => (
              <MovieCardPortrait key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MovieCardPortrait({ movie }) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="block aspect-[2/3] group/poster relative rounded overflow-hidden bg-netflix-dark hover:ring-2 hover:ring-netflix-red transition-all"
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs p-2 text-center">
          {movie.title}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/70 to-transparent">
        <h3 className="text-white text-xs font-semibold line-clamp-1">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] mt-0.5">
          {movie.vote_average > 0 && (
            <span className="text-green-400 font-semibold">
              {Math.round(movie.vote_average * 10)}%
            </span>
          )}
          {movie.release_year && (
            <span className="text-gray-300">{movie.release_year}</span>
          )}
        </div>
      </div>
    </Link>
  );
}