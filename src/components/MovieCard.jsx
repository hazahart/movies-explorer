import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ThumbsUp, ChevronDown, VolumeX, Volume2 } from 'lucide-react';
import {
    getPosterUrl,
    getBackdropUrl,
    getTrailerEmbedUrl,
} from '../services/moviesService';

export default function MovieCard({ movie }) {
    const navigate = useNavigate();
    const [showTrailer, setShowTrailer] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [cardPosition, setCardPosition] = useState('middle');
    const cardRef = useRef(null);
    const hoverTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        };
    }, []);

    const handleMouseEnter = () => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            if (rect.left < 100) setCardPosition('left');
            else if (rect.right > viewportWidth - 100) setCardPosition('right');
            else setCardPosition('middle');
        }

        setIsHovering(true);
        if (movie.trailer_key) {
            hoverTimerRef.current = setTimeout(() => {
                setShowTrailer(true);
            }, 1000);
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setShowTrailer(false);
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    };

    const handleClick = (e) => {
        if (e.target.closest('.card-action-button')) return;
        navigate(`/movies/${movie.id}`);
    };

    const backdropUrl = getBackdropUrl(movie.backdrop_path, 'w780');
    const posterUrl = getPosterUrl(movie.poster_path, 'w342');
    const trailerUrl = getTrailerEmbedUrl(movie.trailer_key, {
        autoplay: true,
        mute: isMuted,
        controls: false,
    });

    const originClass =
        cardPosition === 'left'
            ? 'origin-left'
            : cardPosition === 'right'
                ? 'origin-right'
                : 'origin-center';

    return (
        <div
            ref={cardRef}
            className="relative flex-shrink-0 w-[240px] md:w-[280px] lg:w-[320px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ aspectRatio: '16/9' }}
        >
            <div className="absolute inset-0">
                <div
                    className={`absolute inset-0 rounded-md overflow-hidden bg-netflix-dark transition-all duration-300 ease-out cursor-pointer ${originClass} ${isHovering
                            ? 'scale-[1.5] z-50 shadow-2xl shadow-black'
                            : 'scale-100 z-0'
                        }`}
                    onClick={handleClick}
                >
                    <div className="relative w-full aspect-video overflow-hidden bg-black">
                        {showTrailer && trailerUrl ? (
                            <div className="absolute inset-0 pointer-events-none">
                                <iframe
                                    src={trailerUrl}
                                    title={movie.title}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77vh] h-[56.25vw] min-w-full min-h-full"
                                    allow="autoplay; encrypted-media"
                                    frameBorder="0"
                                />
                            </div>
                        ) : backdropUrl ? (
                            <img
                                src={backdropUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : posterUrl ? (
                            <img
                                src={posterUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm px-2 text-center">
                                {movie.title}
                            </div>
                        )}

                        <div
                            className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/70 to-transparent transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'
                                }`}
                        >
                            <h3 className="text-white text-sm font-semibold line-clamp-1 drop-shadow-lg">
                                {movie.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] mt-0.5">
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

                        {showTrailer && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMuted(!isMuted);
                                }}
                                className="card-action-button absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 border border-white/40 flex items-center justify-center z-10"
                            >
                                {isMuted ? (
                                    <VolumeX className="w-4 h-4 text-white" />
                                ) : (
                                    <Volume2 className="w-4 h-4 text-white" />
                                )}
                            </button>
                        )}
                    </div>

                    <div
                        className={`bg-netflix-dark transition-all duration-300 overflow-hidden ${isHovering ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="p-3">
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/movies/${movie.id}`);
                                    }}
                                    className="card-action-button w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition"
                                >
                                    <Play className="w-3.5 h-3.5 text-black" fill="currentColor" />
                                </button>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="card-action-button w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center hover:border-white hover:bg-white/10 transition"
                                >
                                    <Plus className="w-3.5 h-3.5 text-white" />
                                </button>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="card-action-button w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center hover:border-white hover:bg-white/10 transition"
                                >
                                    <ThumbsUp className="w-3.5 h-3.5 text-white" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/movies/${movie.id}`);
                                    }}
                                    className="card-action-button ml-auto w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center hover:border-white hover:bg-white/10 transition"
                                >
                                    <ChevronDown className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>

                            <h3 className="text-white text-xs font-bold mb-1 truncate">
                                {movie.title}
                            </h3>

                            <div className="flex items-center gap-2 mb-1 text-[10px]">
                                {movie.vote_average > 0 && (
                                    <span className="text-green-400 font-bold">
                                        {Math.round(movie.vote_average * 10)}% Coincidencia
                                    </span>
                                )}
                                {movie.release_year && (
                                    <span className="text-gray-300">{movie.release_year}</span>
                                )}
                            </div>

                            {movie.genres && movie.genres.length > 0 && (
                                <div className="text-[10px] text-gray-400 truncate">
                                    {movie.genres
                                        .slice(0, 3)
                                        .map((g) => g.name)
                                        .join(' • ')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}