'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

interface StoreOffer {
  id: string | number;
  product?: Product;
  storeLabel: string;
  discountBadge: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  savings: number;
  description: string;
  ctaText: string;
  ctaCategory: string;
  image: string;
}

const OfferCardImage: React.FC<{
  src: string;
  alt: string;
  discountBadge: string;
}> = ({ src, alt, discountBadge }) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(src);
    setIsLoaded(false);
  }, [src]);

  return (
    <div className="relative shrink-0 w-28 sm:w-32 h-28 sm:h-32 flex items-center justify-center">
      {/* Discount Badge */}
      <span className="absolute top-0 right-0 z-20 bg-[#E11A22] text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
        {discountBadge}
      </span>

      {/* Product Image Container */}
      <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 relative border border-gray-100">
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes="(max-width: 640px) 112px, 128px"
          className={`object-cover transform group-hover:scale-105 transition-all duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setImgSrc(
              'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80'
            );
            setIsLoaded(true);
          }}
        />
      </div>
    </div>
  );
};

export const StoreOffersSection: React.FC = () => {
  const {
    products,
    activeStore,
    setSelectedCategory,
    setActiveProductModal,
  } = useApp();

  const storeName = useMemo(() => {
    if (activeStore?.name) {
      return activeStore.name.replace(/\(.*?\)/g, '').trim();
    }
    return 'K MART BARAMATI';
  }, [activeStore]);

  // Filter products that have an actual discount (mrp > price and discountPercent > 0)
  const discountedProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.discountPercent > 0 && p.originalPrice > p.price)
      .sort((a, b) => b.discountPercent - a.discountPercent);
  }, [products]);

  // Highest discount percentage across the store's products
  const maxDiscount = useMemo(() => {
    if (discountedProducts.length > 0) {
      return discountedProducts[0].discountPercent;
    }
    return 74;
  }, [discountedProducts]);

  // Dynamically compute the top 3 offers based on actual product discounts
  const storeOffers: StoreOffer[] = useMemo(() => {
    if (discountedProducts.length === 0) {
      // High-fidelity fallback based on real store catalog items while products load
      return [
        {
          id: 'fallback-1',
          storeLabel: `${storeName.toUpperCase()} • TOP DEAL`,
          discountBadge: '74% OFF',
          title: 'COLGATE SUPER SHINE BRUSH',
          subtitle: 'Now ₹22 (MRP ₹85)',
          price: 22,
          originalPrice: 85,
          savings: 63,
          description:
            'Oral care & personal essentials at deep discounts from your nearby K MART.',
          ctaText: 'Shop Deal',
          ctaCategory: 'groceries',
          image:
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'fallback-2',
          storeLabel: `${storeName.toUpperCase()} • DRY FRUITS & DATES`,
          discountBadge: '60% OFF',
          title: 'BLACK DATES 500GM',
          subtitle: 'Now ₹120 (MRP ₹300)',
          price: 120,
          originalPrice: 300,
          savings: 180,
          description:
            'Premium black dates and nutritious pantry staples at special store pricing.',
          ctaText: 'Shop Deal',
          ctaCategory: 'groceries',
          image:
            'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'fallback-3',
          storeLabel: `${storeName.toUpperCase()} • PANTRY ESSENTIALS`,
          discountBadge: '57% OFF',
          title: 'PANZANI PASTA MACARONI RIGATE',
          subtitle: 'Now ₹69 (MRP ₹159)',
          price: 69,
          originalPrice: 159,
          savings: 90,
          description:
            'Delicious branded pasta, noodles and grocery staples at direct store savings.',
          ctaText: 'Shop Deal',
          ctaCategory: 'groceries',
          image:
            'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
        },
      ];
    }

    // Pick 3 diverse products with the highest discounts
    const selected: Product[] = [];
    const seenKeywords = new Set<string>();

    for (const prod of discountedProducts) {
      const clean = prod.name.replace(/^[\s.•·]+/, '').trim().toLowerCase();
      const keyword = clean.split(' ')[0];
      if (!seenKeywords.has(keyword)) {
        seenKeywords.add(keyword);
        selected.push(prod);
        if (selected.length === 3) break;
      }
    }

    // If fewer than 3 diverse keywords found, fill with remaining top discounted items
    if (selected.length < 3) {
      for (const prod of discountedProducts) {
        if (!selected.some((s) => s.id === prod.id)) {
          selected.push(prod);
          if (selected.length === 3) break;
        }
      }
    }

    const badgeLabels = ['MEGA DEAL', 'SUPER SAVINGS', 'DAILY ESSENTIAL'];

    return selected.map((prod, index) => {
      const savings = Math.max(0, prod.originalPrice - prod.price);
      const badge = badgeLabels[index] || 'SPECIAL OFFER';

      return {
        id: prod.id,
        product: prod,
        storeLabel: `${storeName.toUpperCase()} • ${badge}`,
        discountBadge: `${prod.discountPercent}% OFF`,
        title: prod.name,
        subtitle: `Now ₹${prod.price} (MRP ₹${prod.originalPrice})`,
        price: prod.price,
        originalPrice: prod.originalPrice,
        savings,
        description:
          prod.description && prod.description.length > 20
            ? prod.description
            : `Save ₹${savings} on ${prod.name} with instant delivery from your nearby ${storeName}.`,
        ctaText: 'Shop Deal',
        ctaCategory: prod.category || 'groceries',
        image: prod.image,
      };
    });
  }, [discountedProducts, storeName]);

  const handleCta = (offer: StoreOffer) => {
    if (offer.product) {
      setActiveProductModal(offer.product);
    } else if (offer.ctaCategory) {
      setSelectedCategory(offer.ctaCategory);
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3 sm:mb-4">
        <div>
          <p className="text-xs font-bold text-[#E11A22] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{storeName.toUpperCase()}</span>
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A2540] tracking-tight">
            Offers from your nearby stores
          </h2>
        </div>

        {maxDiscount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#E11A22] bg-red-50 border border-red-200/80 px-3 py-1 rounded-full w-fit">
            <span>🔥 Up to {maxDiscount}% OFF on store products</span>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {storeOffers.map((offer) => (
          <div
            key={offer.id}
            className="h-full bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group"
          >
            {/* Left Content */}
            <div className="flex-1 min-w-0 space-y-1.5 text-left z-10">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#E11A22] uppercase tracking-wider block truncate">
                {offer.storeLabel}
              </span>

              <div>
                {offer.product ? (
                  <Link
                    href={`/product/${offer.product.id}`}
                    className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-1 hover:text-[#E11A22] transition-colors block"
                    title={offer.title}
                  >
                    {offer.title}
                  </Link>
                ) : (
                  <h3
                    className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-1"
                    title={offer.title}
                  >
                    {offer.title}
                  </h3>
                )}

                {/* Price and Savings Row */}
                <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-sm sm:text-base font-black text-[#0A2540]">
                    ₹{offer.price}
                  </span>
                  {offer.originalPrice > offer.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{offer.originalPrice}
                    </span>
                  )}
                  {offer.savings > 0 && (
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Save ₹{offer.savings}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 max-w-[210px] leading-relaxed">
                {offer.description}
              </p>

              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCta(offer)}
                  className="bg-[#E11A22] hover:bg-[#c8141b] text-white text-xs font-bold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>{offer.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Product Image with circular discount badge */}
            {offer.product ? (
              <Link
                href={`/product/${offer.product.id}`}
                className="cursor-pointer shrink-0"
              >
                <OfferCardImage
                  src={offer.image}
                  alt={offer.title}
                  discountBadge={offer.discountBadge}
                />
              </Link>
            ) : (
              <div className="shrink-0">
                <OfferCardImage
                  src={offer.image}
                  alt={offer.title}
                  discountBadge={offer.discountBadge}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
