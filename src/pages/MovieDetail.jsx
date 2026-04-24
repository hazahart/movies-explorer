import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import {
  getMovieById,
  getBackdropUrl,
  getPosterUrl,
  getTrailerEmbedUrl,
} from '../services/moviesService';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playTrailer, setPlayTrailer] = useState(false);

  useEffect(() => {
    async function loadMovie() {
      try {
        setLoading(true);
        const data = await getMovieById(parseInt(id));
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-netflix-red mb-2">
            {error || 'Película no encontrada'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-netflix-red hover:bg-red-700 text-white px-6 py-2 rounded"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path, 'original');
  const posterUrl = getPosterUrl(movie.poster_path, 'w500');
  const trailerUrl = getTrailerEmbedUrl(movie.trailer_key, {
    autoplay: true,
    mute: false,
    controls: true,
  });

  return (
    <div className="bg-netflix-black min-h-screen">
      <Navbar />

      <div className="relative h-[70vh]">
        <div className="absolute inset-0">
          {playTrailer && trailerUrl ? (
            <iframe
              src={trailerUrl}
              title={movie.title}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <>
              {backdropUrl && (
                <img
                  src={backdropUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </>
          )}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-8 z-10 flex items-center gap-2 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>

      <div className="relative -mt-40 z-10 px-8 md:px-16 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-64 h-auto rounded shadow-2xl flex-shrink-0"
            />
          )}

          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
              {movie.release_year && <span>{movie.release_year}</span>}
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {movie.vote_count > 0 && (
                <span>{movie.vote_count.toLocaleString()} votos</span>
              )}
              {movie.original_language && (
                <span className="uppercase border border-gray-500 px-2 py-0.5 text-xs rounded">
                  {movie.original_language}
                </span>
              )}
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-netflix-gray text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && (
              <p className="text-lg text-gray-200 mb-8 leading-relaxed max-w-3xl">
                {movie.overview}
              </p>
            )}

            <div className="flex gap-4">
              {movie.trailer_key && !playTrailer && (
                <button
                  onClick={() => setPlayTrailer(true)}
                  className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded hover:bg-gray-200 transition font-semibold"
                >
                  <Play className="w-6 h-6" fill="currentColor" />
                  Ver trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {movie.original_title && movie.original_title !== movie.title && (
          <div className="mt-12 text-gray-400">
            <p>
              <span className="font-semibold">Título original:</span>{' '}
              {movie.original_title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}