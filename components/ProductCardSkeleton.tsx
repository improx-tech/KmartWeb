'use client';

import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between p-3 relative animate-fadeInSmooth">
      {/* Top right wishlist placeholder */}
      <div className="flex items-center justify-end mb-1">
        <div className="w-6 h-6 rounded-full bg-gray-100 animate-shimmer" />
      </div>

      {/* Image container skeleton */}
      <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden relative mb-2 animate-shimmer" />

      {/* Product details skeleton */}
      <div className="text-left space-y-2 mt-1">
        {/* Store & Category tag */}
        <div className="h-2.5 w-24 bg-gray-200/80 rounded animate-shimmer" />

        {/* Product title */}
        <div className="h-3.5 w-5/6 bg-gray-200 rounded animate-shimmer" />

        {/* Weight */}
        <div className="h-2.5 w-14 bg-gray-100 rounded animate-shimmer" />

        {/* Rating & Stock */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className="h-3 w-10 bg-amber-100/80 rounded animate-shimmer" />
          <div className="h-3 w-14 bg-emerald-100/80 rounded animate-shimmer" />
        </div>

        {/* Price Row */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-4 w-14 bg-gray-200 rounded animate-shimmer" />
          <div className="h-3 w-10 bg-gray-100 rounded animate-shimmer" />
          <div className="h-3.5 w-12 bg-red-100 rounded animate-shimmer" />
        </div>
      </div>

      {/* Purchase Limit & ADD button */}
      <div className="mt-3 pt-2 border-t border-gray-100 space-y-2">
        <div className="h-2.5 w-32 bg-gray-100 rounded mx-auto animate-shimmer" />
        <div className="w-full h-8 bg-gray-100 rounded-lg animate-shimmer" />
      </div>
    </div>
  );
};

export const DealCardSkeleton: React.FC = () => {
  return (
    <div className="shrink-0 w-44 sm:w-48 bg-white rounded-xl border border-gray-200 flex flex-col justify-between p-3 relative animate-fadeInSmooth">
      {/* Discount badge placeholder */}
      <div className="w-12 h-4 bg-red-100 rounded-sm mb-1 animate-shimmer" />

      {/* Image skeleton */}
      <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden my-1 animate-shimmer" />

      {/* Details */}
      <div className="space-y-2 text-left mt-2">
        <div className="h-2.5 w-20 bg-gray-200/80 rounded animate-shimmer" />
        <div className="h-3.5 w-32 bg-gray-200 rounded animate-shimmer" />
        <div className="h-2.5 w-12 bg-gray-100 rounded animate-shimmer" />
        <div className="h-4 w-16 bg-gray-200 rounded animate-shimmer" />
      </div>

      {/* Button */}
      <div className="mt-3">
        <div className="w-full h-8 bg-gray-100 rounded-lg animate-shimmer" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={`product-skeleton-${idx}`} />
      ))}
    </>
  );
};
