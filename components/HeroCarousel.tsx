'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { setSelectedCategory } = useApp();

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const slides = [
    {
      id: 1,
      kicker: 'DUSSEHRA UTSAV',
      kickerBg: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
      offer: 'UP TO 50% OFF',
      offerColor: 'text-amber-400',
      headline: 'Dussehra Puja & Festive Feast',
      subtext: 'Fresh Marigold Flowers, Pure Cow Ghee, Sharbati Atta & Kitchen Staples',
      trustText: '✓ Direct from nearest local store',
      btnText: 'Shop Dussehra Specials',
      ctaCategory: 'groceries',
      image: '/real-dussehra-marigold.webp',
      alt: 'Shubh Dussehra Fresh Marigold Flowers and Festive Essentials',
      bgColor: 'bg-[#180306]',
      overlayGradient: 'from-[#180306] via-[#180306]/75 to-transparent',
      mobileOverlayGradient: 'from-[#180306] via-[#180306]/85 to-transparent',
      btnBg: 'bg-amber-400 hover:bg-amber-300 text-neutral-950',
    },
    {
      id: 2,
      kicker: 'DIWALI DHAMAKA',
      kickerBg: 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30',
      offer: 'FLAT 40% - 60% OFF',
      offerColor: 'text-yellow-300',
      headline: 'Festival of Lights & Celebrations',
      subtext: 'Handcrafted Clay Diyas, Brass Deepaks, Dry Fruit Hampers & Pure Ghee Sweets',
      trustText: '✓ 100% Traditional Handcrafted Diyas',
      btnText: 'Explore Diwali Deals',
      ctaCategory: 'snacks-and-beverages',
      image: '/real-diwali-diya.webp',
      alt: 'Happy Diwali Traditional Clay Diyas with Real Golden Flames',
      bgColor: 'bg-[#0B0416]',
      overlayGradient: 'from-[#0B0416] via-[#0B0416]/75 to-transparent',
      mobileOverlayGradient: 'from-[#0B0416] via-[#0B0416]/85 to-transparent',
      btnBg: 'bg-yellow-400 hover:bg-yellow-300 text-purple-950',
    },
    {
      id: 3,
      kicker: 'MITHAI BAZAAR',
      kickerBg: 'bg-rose-400/20 text-rose-300 border border-rose-400/30',
      offer: 'MIN. 30% OFF',
      offerColor: 'text-rose-300',
      headline: 'Fresh Pure Ghee Sweets & Snacks',
      subtext: 'Silver-foil Kaju Katli, Besan Laddus, Gulab Jamun & Savoury Namkeen Hampers',
      trustText: '✓ Prepared fresh daily with pure cow ghee',
      btnText: 'Order Fresh Mithai',
      ctaCategory: 'snacks-and-beverages',
      image: '/banner-sweets.webp',
      alt: 'Real Traditional Silver Foil Kaju Katli in Festive Basket',
      bgColor: 'bg-[#1A0412]',
      overlayGradient: 'from-[#1A0412] via-[#1A0412]/75 to-transparent',
      mobileOverlayGradient: 'from-[#1A0412] via-[#1A0412]/85 to-transparent',
      btnBg: 'bg-rose-400 hover:bg-rose-300 text-neutral-950',
    },
    {
      id: 4,
      kicker: 'PUJA SAMAGRI',
      kickerBg: 'bg-sky-400/20 text-sky-300 border border-sky-400/30',
      offer: 'UP TO 45% OFF',
      offerColor: 'text-amber-300',
      headline: 'Auspicious Sacred Pooja Thali',
      subtext: 'Bhimseni Camphor, Brass Diyas, Fragrant Agarbatti, Dhoop & Complete Puja Kits',
      trustText: '✓ 100% Pure Camphor & Organic Agarbatti',
      btnText: 'Shop Pooja Samagri',
      ctaCategory: 'household',
      image: '/banner-pooja-thali.webp',
      alt: 'Real Traditional Festive Pooja Thali with Diya and Flowers',
      bgColor: 'bg-[#040C1A]',
      overlayGradient: 'from-[#040C1A] via-[#040C1A]/75 to-transparent',
      mobileOverlayGradient: 'from-[#040C1A] via-[#040C1A]/85 to-transparent',
      btnBg: 'bg-amber-400 hover:bg-amber-300 text-neutral-950',
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleCta = (cat: string) => {
    setSelectedCategory(cat);
    const elem = document.getElementById('products-section');
    if (elem) {
      const navOffset = -110;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + navOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-xl border border-amber-500/20 w-full min-h-[200px] xs:min-h-[215px] sm:h-[245px] md:h-[275px] lg:h-[295px] group select-none bg-neutral-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top subtle golden shimmer line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent z-20 pointer-events-none" />

      {/* Sliding Track */}
      <div
        className="flex h-full w-full min-w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            onClick={() => handleCta(slide.ctaCategory)}
            className={`w-full min-w-full basis-full shrink-0 h-full ${slide.bgColor} relative overflow-hidden cursor-pointer flex items-center`}
          >
            {/* Seamless Full-Bleed Photograph on the Right */}
            <div className="absolute inset-y-0 right-0 w-full sm:w-[58%] md:w-[54%] lg:w-[52%] h-full z-0">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 58vw, 650px"
                className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                priority={i === 0}
              />

              {/* Desktop horizontal fade: smoothly dissolves photo left edge into solid theme background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayGradient} hidden sm:block pointer-events-none`} />

              {/* Mobile vertical fade: ensures text remains 100% readable while showing photo at top */}
              <div className={`absolute inset-0 bg-gradient-to-t ${slide.mobileOverlayGradient} sm:hidden pointer-events-none`} />
            </div>

            {/* Content Column: Clean, Authentic Human Editorial Design */}
            <div className="relative z-10 w-full sm:w-[55%] md:w-[52%] px-5 py-4 sm:px-8 sm:py-6 md:px-10 flex flex-col justify-center items-start text-left">
              {/* Large Impactful Retail Discount Headline */}
              <div className="mb-1 sm:mb-2">
                <span className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none ${slide.offerColor}`}>
                  {slide.offer}
                </span>
              </div>

              {/* Campaign Headline */}
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-white tracking-tight mb-1 sm:mb-1.5 line-clamp-1">
                {slide.headline}
              </h2>

              {/* Real Product Subtitle */}
              <p className="text-[11px] xs:text-xs sm:text-sm text-gray-300 font-medium max-w-sm sm:max-w-md line-clamp-2 leading-snug sm:leading-relaxed mb-3 sm:mb-4">
                {slide.subtext}
              </p>

              {/* Action Button & Trust Note */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCta(slide.ctaCategory);
                  }}
                  className={`${slide.btnBg} px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
                >
                  <span>{slide.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </button>
                <span className="text-[10px] sm:text-xs text-amber-200/80 font-medium hidden xs:inline-block">
                  {slide.trustText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev Navigation Arrow */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 text-white shadow-md backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Next Navigation Arrow */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 text-white shadow-md backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        aria-label="Next banner"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/45 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(idx);
            }}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentSlide
                ? 'w-5 sm:w-7 bg-white shadow-xs'
                : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
