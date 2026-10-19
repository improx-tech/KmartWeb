'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface StoreOffer {
  id: string | number;
  storeLabel: string;
  discountBadge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaCategory: string;
  image: string;
}

const CATEGORY_DEFAULTS = [
  {
    slug: 'personal-care',
    name: 'Personal Care',
    subtitle: 'Daily Hygiene Deals',
    ctaText: 'Shop Personal Care',
    fallbackDiscount: 74,
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
  },
  {
    slug: 'groceries',
    name: 'Groceries & Staples',
    subtitle: 'Save More Today',
    ctaText: 'Shop Staples',
    fallbackDiscount: 60,
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
  },
  {
    slug: 'snacks-and-beverages',
    name: 'Snacks & Beverages',
    subtitle: 'Special Offers',
    ctaText: 'Shop Snacks Deals',
    fallbackDiscount: 57,
    image:
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
  },
];

const OfferCardImage: React.FC<{
  src: string;
  alt: string;
  discountBadge: string;
}> = ({ src, alt, discountBadge }) => {
  const [imgSrc, setImgSrc] = useState(src);

  React.useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <div className="relative shrink-0 w-28 sm:w-32 h-28 sm:h-32 flex items-center justify-center">
      {/* Circular Discount Badge */}
      <span className="absolute top-0 right-0 z-20 bg-[#E11A22] text-white text-[11px] font-black px-2 py-1 rounded-full shadow-sm">
        {discountBadge}
      </span>

      {/* Product Image */}
      <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-white relative">
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes="(max-width: 640px) 112px, 128px"
          className="object-cover transform group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={() => {
            setImgSrc(
              'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80'
            );
          }}
        />
      </div>
    </div>
  );
};

export const StoreOffersSection: React.FC = () => {
  const { products, activeStore, setSelectedCategory } = useApp();

  const storeName = useMemo(() => {
    if (activeStore?.name) {
      return activeStore.name.replace(/\(.*?\)/g, '').trim();
    }
    return 'K MART BARAMATI';
  }, [activeStore]);

  // Compute category-wise offers dynamically according to product discounts
  const storeOffers: StoreOffer[] = useMemo(() => {
    return CATEGORY_DEFAULTS.map((cat) => {
      const catProducts = (products || []).filter(
        (p) => (p.category || '').toLowerCase() === cat.slug.toLowerCase()
      );

      const discounts = catProducts
        .filter((p) => p.discountPercent > 0 && p.originalPrice > p.price)
        .map((p) => p.discountPercent);

      const maxDiscount =
        discounts.length > 0 ? Math.max(...discounts) : cat.fallbackDiscount;

      const topProduct = catProducts
        .filter((p) => p.discountPercent > 0 && p.image)
        .sort((a, b) => b.discountPercent - a.discountPercent)[0];

      const image = topProduct?.image || cat.image;

      return {
        id: cat.slug,
        storeLabel: `${storeName.toUpperCase()} • ${cat.name.toUpperCase()}`,
        discountBadge: `${maxDiscount}% OFF*`,
        title: cat.name,
        subtitle: cat.subtitle,
        ctaText: cat.ctaText,
        ctaCategory: cat.slug,
        image,
      };
    });
  }, [products, storeName]);

  const handleCta = (category: string) => {
    setSelectedCategory(category);
    const el = document.getElementById('products-section');
    if (el) {
      const navOffset = -110;
      const y = el.getBoundingClientRect().top + window.pageYOffset + navOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <p className="text-xs font-bold text-[#E11A22] uppercase tracking-wider mb-0.5">
            K MART STORES
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A2540] tracking-tight">
            Offers from your nearby stores
          </h2>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {storeOffers.map((offer) => (
          <div
            key={offer.id}
            className="h-full bg-white rounded-2xl border border-gray-200/90 p-5 flex items-center justify-between gap-4 shadow-2xs hover:shadow-sm transition-shadow relative overflow-hidden group"
          >
            {/* Left Content */}
            <div className="flex-1 min-w-0 space-y-2 text-left z-10">
              <span className="text-[11px] font-bold text-[#E11A22] uppercase tracking-wider block truncate">
                {offer.storeLabel}
              </span>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  {offer.title}
                </h3>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  {offer.subtitle}
                </h4>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleCta(offer.ctaCategory)}
                  className="bg-[#E11A22] hover:bg-[#c8141b] text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{offer.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Product Image with circular discount badge */}
            <OfferCardImage
              src={offer.image}
              alt={offer.title}
              discountBadge={offer.discountBadge}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
