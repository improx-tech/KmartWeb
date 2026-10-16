import { ProductCardSkeleton } from '../components/ProductCardSkeleton';

export default function Loading() {
  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Hero skeleton */}
      <div className="min-h-[220px] xs:min-h-[240px] sm:h-[320px] md:h-[360px] lg:h-[380px] bg-gray-100 rounded-3xl w-full animate-shimmer" />
      
      {/* Category pills skeleton */}
      <div className="flex gap-4 overflow-hidden py-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full animate-shimmer" />
            <div className="w-12 h-3 bg-gray-100 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Products grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

