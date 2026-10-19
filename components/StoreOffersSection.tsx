'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface StoreOffer {
  id: number;
  storeLabel: string;
  discountBadge: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaCategory: string;
  image: string;
}

export const StoreOffersSection: React.FC = () => {
  const { products, activeStore, setSelectedCategory } = useApp();

  const storeName = useMemo(() => {
    if (activeStore?.name) {
      return activeStore.name.replace(/\(.*?\)/g, '').trim().toUpperCase();
    }
    return 'K MART BARAMATI';
  }, [activeStore]);

  // Dynamically compute the maximum discount for each category from real products
  const personalCareDiscount = useMemo(() => {
    const items = products.filter(
      (p) => p.category === 'personal-care' && p.discountPercent > 0
    );
    if (items.length > 0) {
      return Math.max(...items.map((p) => p.discountPercent));
    }
    return 74;
  }, [products]);

  const groceriesDiscount = useMemo(() => {
    const items = products.filter(
      (p) => (p.category === 'groceries' || !p.category) && p.discountPercent > 0
    );
    if (items.length > 0) {
      return Math.max(...items.map((p) => p.discountPercent));
    }
    return 60;
  }, [products]);

  const snacksDiscount = useMemo(() => {
    const items = products.filter(
      (p) => p.category === 'snacks-and-beverages' && p.discountPercent > 0
    );
    if (items.length > 0) {
      return Math.max(...items.map((p) => p.discountPercent));
    }
    return 57;
  }, [products]);

  const storeOffers: StoreOffer[] = useMemo(() => [
    {
      id: 1,
      storeLabel: `${storeName} • PERSONAL CARE`,
      discountBadge: `${personalCareDiscount}% OFF*`,
      title: 'Daily Essentials',
      subtitle: 'Personal Care Deals',
      description: 'Oral care, soaps, shampoos and daily hygiene essentials at special prices.',
      ctaText: 'Shop Offers',
      ctaCategory: 'personal-care',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 2,
      storeLabel: `${storeName} • STORE 1`,
      discountBadge: `${groceriesDiscount}% OFF*`,
      title: 'Staples Sale',
      subtitle: 'Save More Today',
      description: 'Atta, rice, dal, premium dates and pantry essentials at special prices.',
      ctaText: 'Shop Staples',
      ctaCategory: 'groceries',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 3,
      storeLabel: 'GROCERY SAVINGS',
      discountBadge: `${snacksDiscount}% OFF*`,
      title: 'Daily Pantry',
      subtitle: 'Special Offers',
      description: 'Pasta, noodles, biscuits and daily packaged foods with great savings.',
      ctaText: 'Shop Grocery Deals',
      ctaCategory: 'snacks-and-beverages',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
    },
  ], [storeName, personalCareDiscount, groceriesDiscount, snacksDiscount]);

  const handleCta = (category: string) => {
    setSelectedCategory(category);
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
              <span className="text-[11px] font-bold text-[#E11A22] uppercase tracking-wider block">
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

              <p className="text-xs text-gray-500 line-clamp-2 max-w-[200px]">
                {offer.description}
              </p>

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
            <div className="relative shrink-0 w-28 sm:w-32 h-28 sm:h-32 flex items-center justify-center">
              {/* Circular Discount Badge */}
              <span className="absolute top-0 right-0 z-20 bg-[#E11A22] text-white text-[11px] font-black px-2 py-1 rounded-full shadow-sm">
                {offer.discountBadge}
              </span>

              {/* Product Pack Image */}
              <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-white relative">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 640px) 112px, 128px"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
