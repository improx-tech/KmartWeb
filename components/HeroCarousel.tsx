'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
      tag: '🔥 DUSSEHRA UTSAV • UP TO 50% OFF',
      tagBg: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-red-950 font-black shadow-md border border-yellow-200/50',
      title: 'SHUBH DUSSEHRA',
      subtitle: 'Fresh Marigold Flowers, Pure Desi Ghee, Sharbati Atta & Festive Essentials at Wholesale Rates!',
      btnText: 'Shop Dussehra Specials',
      ctaCategory: 'groceries',
      image: '/real-dussehra-marigold.webp',
      alt: 'Shubh Dussehra Fresh Marigold Flowers and Festive Essentials',
      bgGradient: 'bg-gradient-to-r from-[#7B1113] via-[#991B1B] to-[#C2410C]',
      titleColor: 'text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]',
      subtitleColor: 'text-orange-100/90',
      badgeOverlay: '🌼 Fresh Marigold Toran & Pooja',
      btnBg: 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-red-950 shadow-lg shadow-black/25',
    },
    {
      id: 2,
      tag: '🪔 DIWALI DHAMAKA • UP TO 60% OFF',
      tagBg: 'bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-purple-950 font-black shadow-md border border-yellow-200/50',
      title: 'FESTIVAL OF LIGHTS',
      subtitle: 'Handcrafted Clay Diyas, Premium Dry Fruit Gift Boxes, Pure Mithai & Festive Home Lights in 10 Mins!',
      btnText: 'Explore Diwali Deals',
      ctaCategory: 'snacks-and-beverages',
      image: '/real-diwali-diya.webp',
      alt: 'Happy Diwali Traditional Clay Diyas with Real Golden Flames',
      bgGradient: 'bg-gradient-to-r from-[#140026] via-[#2A0845] to-[#4C1D95]',
      titleColor: 'text-yellow-300 drop-shadow-[0_2px_12px_rgba(253,224,71,0.5)]',
      subtitleColor: 'text-purple-100/90',
      badgeOverlay: '🪔 Earthen Diyas & Brass Pooja',
      btnBg: 'bg-gradient-to-r from-yellow-400 to-amber-300 hover:from-yellow-300 hover:to-amber-200 text-purple-950 shadow-lg shadow-black/35',
    },
    {
      id: 3,
      tag: '🍬 MITHAI BAZAAR • MIN. 30% OFF',
      tagBg: 'bg-gradient-to-r from-pink-300 to-rose-200 text-rose-950 font-black shadow-md border border-pink-200/50',
      title: 'FESTIVAL MITHAI & SNACKS',
      subtitle: 'Melt-in-mouth Kaju Katli, Besan Laddus, Gulab Jamun & Crisp Festive Namkeen Hampers!',
      btnText: 'Order Fresh Mithai',
      ctaCategory: 'snacks-and-beverages',
      image: '/banner-sweets.webp',
      alt: 'Real Traditional Silver Foil Kaju Katli in Festive Basket',
      bgGradient: 'bg-gradient-to-r from-[#5B0E2D] via-[#881337] to-[#BE123C]',
      titleColor: 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]',
      subtitleColor: 'text-rose-100/90',
      badgeOverlay: '✨ Pure Ghee & Kaju Katli',
      btnBg: 'bg-gradient-to-r from-amber-300 to-yellow-200 hover:from-amber-200 hover:to-yellow-100 text-rose-950 shadow-lg shadow-black/25',
    },
    {
      id: 4,
      tag: '🙏 POOJA SAMAGRI • UP TO 50% OFF',
      tagBg: 'bg-gradient-to-r from-amber-300 to-yellow-200 text-blue-950 font-black shadow-md border border-amber-200/50',
      title: 'AUSPICIOUS POOJA THALI',
      subtitle: 'Pure Bhimseni Camphor, Brass Diyas, Fragrant Agarbatti & Premium Festive Home Care!',
      btnText: 'Shop Pooja Samagri',
      ctaCategory: 'household',
      image: '/banner-pooja-thali.webp',
      alt: 'Real Traditional Festive Pooja Thali with Diya and Flowers',
      bgGradient: 'bg-gradient-to-r from-[#06152B] via-[#0F2B5C] to-[#1E40AF]',
      titleColor: 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]',
      subtitleColor: 'text-sky-100/90',
      badgeOverlay: '🙏 100% Pure Camphor & Puja Kit',
      btnBg: 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-blue-950 shadow-lg shadow-black/25',
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
      className="relative rounded-2xl overflow-hidden shadow-xl border border-white/20 w-full min-h-[190px] xs:min-h-[205px] sm:h-[235px] md:h-[265px] lg:h-[285px] group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding Track */}
      <div
        className="flex h-full w-full min-w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            onClick={() => handleCta(slide.ctaCategory)}
            className={`w-full min-w-full basis-full shrink-0 h-full ${slide.bgGradient} px-4 py-3 sm:px-8 sm:py-5 md:px-10 md:py-6 lg:px-12 lg:py-6 flex items-center justify-between gap-3 sm:gap-6 md:gap-8 relative box-border overflow-hidden cursor-pointer`}
          >
            {/* Ambient Background Glow Effect */}
            <div className="absolute -left-12 -top-12 w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute right-1/4 -bottom-12 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-yellow-400/20 blur-2xl pointer-events-none" />

            {/* Left Column Content - High-Impact Loud Festival Typography */}
            <div className="flex-1 min-w-0 pr-2 sm:pr-4 text-left z-10 flex flex-col justify-center py-1">
              {/* Loud Offer Badge Tag */}
              <div className="mb-1 sm:mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ${slide.tagBg}`}>
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>{slide.tag}</span>
                </span>
              </div>

              {/* Punchy Title */}
              <h1 className={`text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-[34px] font-black tracking-tight leading-[1.1] mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-none ${slide.titleColor}`}>
                {slide.title}
              </h1>

              {/* Subtitle / Value Prop */}
              <p className={`text-[11px] xs:text-xs sm:text-sm md:text-base font-semibold max-w-lg line-clamp-2 leading-snug sm:leading-relaxed mb-2.5 sm:mb-3.5 ${slide.subtitleColor}`}>
                {slide.subtitle}
              </p>

              {/* CTA Button */}
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCta(slide.ctaCategory);
                  }}
                  className={`${slide.btnBg} px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm inline-flex items-center gap-1.5 sm:gap-2 uppercase tracking-wide transition-all transform hover:scale-[1.03] active:scale-[0.97] cursor-pointer`}
                >
                  <span>{slide.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Right Column Festive Art — 100% Real High-Resolution Photography */}
            <div className="relative shrink-0 w-[44%] xs:w-[46%] sm:w-[48%] md:w-[48%] lg:w-[48%] max-w-[500px] h-[155px] xs:h-[170px] sm:h-[200px] md:h-[230px] lg:h-[250px] flex items-center justify-center pr-1 sm:pr-2">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/70 bg-white/10 backdrop-blur-xs group/img">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 500px"
                  className="object-cover object-center transform group-hover/img:scale-105 transition-transform duration-700"
                  priority={i === 0}
                />

                {/* Subtle soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                {/* Floating Real-Asset Pill Tag */}
                {slide.badgeOverlay && (
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md text-[9px] sm:text-xs font-semibold text-white/95 border border-white/20 shadow-md truncate max-w-full">
                      {slide.badgeOverlay}
                    </span>
                  </div>
                )}
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
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white shadow-md backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
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
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white shadow-md backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        aria-label="Next banner"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/35 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
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
                : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
