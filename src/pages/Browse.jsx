import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMovies, getGenres } from '../services/moviesService';

export default function Browse() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getGenres().then(setGenres).catch(console.error);
  }, []);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setPage(1);
        const result = await getMovies({
          page: 1,
          genreId: selectedGenre,
        });
        setMovies(result.movies);
        setTotal(result.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [selectedGenre]);

  const loadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const result = await getMovies({
        page: nextPage,
        genreId: selectedGenre,
      });
      setMovies((prev) => [...prev, ...result.movies]);
      setPage(nextPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = movies.length < total;

  return (
    <div className="bg-netflix-black min-h-screen">
      <Navbar />

      <div className="pt-24 px-8 md:px-16 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Explorar películas
          </h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedGenre === null
                  ? 'bg-white text-black font-semibold'
                  : 'bg-netflix-dark text-white hover:bg-netflix-gray'
              }`}
            >
              Todos
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedGenre === genre.id
                    ? 'bg-white text-black font-semibold'
                    : 'bg-netflix-dark text-white hover:bg-netflix-gray'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {!loading && total > 0 && (
          <p className="text-gray-400 mb-4 text-sm">
            {total.toLocaleString()} películas
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-netflix-red text-xl mb-2">Error</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((movie) => (
                <PosterCard key={movie.id} movie={movie} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-netflix-red hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded transition"
                >
                  {loadingMore ? 'Cargando...' : 'Cargar más'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PosterCard({ movie }) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="block aspect-[2/3] rounded overflow-hidden bg-netflix-dark relative group hover:ring-2 hover:ring-netflix-red transition-all"
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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