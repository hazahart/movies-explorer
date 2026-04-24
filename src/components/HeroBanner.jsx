import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { getBackdropUrl } from '../services/moviesService';

export default function HeroBanner({ movie }) {
  const navigate = useNavigate();

  if (!movie) {
    return <div className="h-screen bg-netflix-black" />;
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path, 'original');

  return (
    <div className="relative h-screen">
      <div className="absolute inset-0">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="relative h-full flex items-center px-8 md:px-16">
        <div className="max-w-2xl">
          {movie.genres && movie.genres.length > 0 && (
            <p className="text-netflix-red font-semibold mb-2 uppercase tracking-wider text-sm">
              {movie.genres.slice(0, 3).map(g => g.name).join(' • ')}
            </p>
          )}
          <h1 className="text-5xl md:text-7xl mb-4 text-white font-bold">
            {movie.title}
          </h1>
          {movie.overview && (
            <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3">
              {movie.overview}
            </p>
          )}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/movies/${movie.id}`)}
              className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded hover:bg-gray-200 transition font-semibold"
            >
              <Play className="w-6 h-6" fill="currentColor" />
              Reproducir
            </button>
            <button
              onClick={() => navigate(`/movies/${movie.id}`)}
              className="flex items-center gap-2 bg-gray-500/70 text-white px-8 py-3 rounded hover:bg-gray-500/90 transition font-semibold"
            >
              <Info className="w-6 h-6" />
              Más información
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}