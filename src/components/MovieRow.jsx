import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [movies]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.85;
    const offset = direction === 'left' ? -scrollAmount : scrollAmount;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(updateScrollState, 400);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="mb-12 group/row">
      <h2 className="text-xl md:text-2xl mb-3 px-8 md:px-16 text-white font-bold">
        {title}
      </h2>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 md:w-16 bg-gradient-to-r from-black/90 via-black/70 to-transparent flex items-center justify-start pl-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 cursor-pointer"
            aria-label="Scroll izquierda"
          >
            <div className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center transition-all hover:scale-110">
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-2 md:gap-3 overflow-x-auto px-8 md:px-16 py-20 -my-20 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-16 bg-gradient-to-l from-black/90 via-black/70 to-transparent flex items-center justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 cursor-pointer"
            aria-label="Scroll derecha"
          >
            <div className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center transition-all hover:scale-110">
              <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </button>
        )}
      </div>
    </section>
  );
}