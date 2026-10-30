'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

import { useApp } from '../context/AppContext';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { TrustBadges } from '../components/TrustBadges';
import { StoreOffersSection } from '../components/StoreOffersSection';
import { FreeDeliveryBanner } from '../components/FreeDeliveryBanner';
import { TopDealsSection } from '../components/TopDealsSection';
import { ScrollToTop } from '../components/ScrollToTop';
import { ChevronDown, X, Loader2, ArrowUp } from 'lucide-react';

const PRODUCTS_PER_SESSION = 15;
const POOJA_REGEX = /(?:pooja|puja|agarbatti|dhoop|camphor|kapoor|diya|samagri|havan|kumkum|rangoli|chandan|akhand vat|devpooja|khapus)/i;

export default function HomePage() {
  const { 
    products, 
    categories,
    selectedCategory, 
    setSelectedCategory, 
    searchQuery,
    isLoadingProducts
  } = useApp();

  const [sortBy, setSortBy] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_SESSION);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset pagination when category, search, or sort changes
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_SESSION);
  }, [selectedCategory, searchQuery, sortBy]);

  const activeCategoryObj = useMemo(() => {
    return categories.find(c => c.slug === selectedCategory);
  }, [categories, selectedCategory]);

  const activeCategoryName = activeCategoryObj?.name || selectedCategory.replace(/-/g, ' ').toUpperCase();

  const filteredProducts = useMemo(() => {
    const queryLower = searchQuery.trim().toLowerCase();
    const selCatLower = selectedCategory.toLowerCase();
    const isPoojaCategory = selectedCategory === 'pooja-samagri';

    const result = products.filter(p => {
      const matchesCat = selectedCategory === 'all' || 
        p.category?.toLowerCase() === selCatLower ||
        (isPoojaCategory && (
          p.category === 'pooja-samagri' ||
          POOJA_REGEX.test(p.name)
        ));
      
      if (!matchesCat) return false;

      const matchesQuery = !queryLower || 
        p.name.toLowerCase().includes(queryLower) || 
        p.brand.toLowerCase().includes(queryLower);

      return matchesQuery;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => b.discountPercent - a.discountPercent);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Infinite scroll / lazy load next session on reaching bottom
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadingMore(true);
          // Small debounce/stagger for smooth rendering animation
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + PRODUCTS_PER_SESSION, filteredProducts.length));
            setIsLoadingMore(false);
          }, 200);
        }
      },
      { rootMargin: '450px' }
    );

    const currentElem = loadMoreRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, [hasMore, filteredProducts.length]);

  return (
    <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">

      {/* 1. Hero Banner Carousel */}
      <HeroCarousel />

      {/* 3. Offers from Nearby Stores */}
      <StoreOffersSection />

      {/* 4. Free Delivery Banner */}
      <FreeDeliveryBanner />

      {/* 5. Today's Top Deals — horizontal scroll */}
      <TopDealsSection />

      {/* 6. Shop by Category (circular avatars) */}
      <CategoryPills />

      {/* 7. Popular Products */}
      <section id="products-section" className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0A2540] tracking-tight">
              {selectedCategory === 'all' 
                ? 'Popular Products' 
                : activeCategoryName}
            </h2>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-[#E11A22] hover:bg-red-100 border border-red-200 transition-all cursor-pointer shadow-2xs"
                title="Clear category filter"
              >
                <span>Clear Filter</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                aria-label="Sort products by"
                name="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-xs text-gray-700 py-1.5 pl-3 pr-7 rounded-lg font-medium cursor-pointer focus:outline-none focus:border-gray-400"
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid (5 columns on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 min-h-[300px]">
          {isLoadingProducts && products.length === 0 ? (
            Array.from({ length: 15 }).map((_, idx) => (
              <ProductCardSkeleton key={`init-skeleton-${idx}`} />
            ))
          ) : (
            <>
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {isLoadingMore && (
                Array.from({ length: 5 }).map((_, idx) => (
                  <ProductCardSkeleton key={`more-skeleton-${idx}`} />
                ))
              )}
            </>
          )}

          {filteredProducts.length === 0 && !isLoadingProducts && (
            <div className="col-span-full bg-white rounded-xl p-10 text-center border border-gray-200">
              <p className="text-base font-bold text-gray-700">No products found</p>
              <p className="text-xs text-gray-400 mt-1">Try selecting another category or clearing your search.</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-4 bg-[#E11A22] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
              >
                View All Products
              </button>
            </div>
          )}
        </div>

        {/* ── Automatic Session-by-Session Infinite Scroll Indicator ── */}
        {filteredProducts.length > PRODUCTS_PER_SESSION && (
          <div className="mt-8 flex flex-col items-center justify-center space-y-3">
            {/* Automatic Infinite Scroll Sentinel & Loader */}
            {hasMore ? (
              <div ref={loadMoreRef} className="py-6 flex flex-col items-center justify-center w-full">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-gray-200/80 shadow-xs text-xs font-bold text-gray-700">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E11A22]" />
                  <span>Loading more products...</span>
                </div>
              </div>
            ) : (
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span>✓ All {filteredProducts.length} products loaded</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    const elem = document.getElementById('products-section');
                    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[#E11A22] hover:underline inline-flex items-center gap-0.5 cursor-pointer font-bold"
                >
                  <span>Back to top</span>
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 8. Trust Badges */}
      <TrustBadges />

      {/* 9. Move To Top Arrow Popup */}
      <ScrollToTop />

    </main>
  );
}
