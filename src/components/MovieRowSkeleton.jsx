export default function MovieRowSkeleton() {
  return (
    <section className="mb-12">
      <div className="px-8 md:px-16 mb-3">
        <div className="h-7 w-64 bg-netflix-dark rounded animate-pulse" />
      </div>
      <div className="flex gap-3 overflow-hidden px-8 md:px-16">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[240px] md:w-[280px] lg:w-[320px] aspect-video bg-netflix-dark rounded animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}