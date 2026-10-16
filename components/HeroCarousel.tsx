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
      tag: '🔥 MEGA FESTIVE SALE • UP TO 50% OFF',
      tagBg: 'bg-[#FDE047] text-[#7F1D1D]',
      title: 'HAPPY DUSSEHRA',
      subtitle: 'Pure Ghee, Basmati Rice, Atta & Kitchen Staples at Unbeatable Wholesale Prices!',
      btnText: 'Shop Festival Essentials',
      ctaCategory: 'groceries',
      image: '/banner-dussehra.webp',
      alt: 'Happy Dussehra Kitchen Essentials and Groceries',
      bgGradient: 'bg-gradient-to-r from-[#991B1B] via-[#C2410C] to-[#D97706]',
      titleColor: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]',
      subtitleColor: 'text-amber-100/95',
      btnBg: 'bg-[#FDE047] hover:bg-[#FACC15] text-[#7F1D1D] shadow-lg shadow-black/25',
    },
    {
      id: 2,
      tag: '🪔 DIWALI DHAMAKA • FLAT 40% OFF',
      tagBg: 'bg-gradient-to-r from-[#FDE047] to-[#FBBF24] text-[#3B0764]',
      title: 'CELEBRATE DIWALI',
      subtitle: 'Grand Gift Boxes, Dry Fruits, Traditional Diyas & Glowing Festive Decor!',
      btnText: 'Explore Diwali Deals',
      ctaCategory: 'snacks-and-beverages',
      image: '/banner-diwali.webp',
      alt: 'Celebrate Diwali Traditional Diyas and Lights',
      bgGradient: 'bg-gradient-to-r from-[#1E0638] via-[#3B0764] to-[#6B21A8]',
      titleColor: 'text-[#FDE047] drop-shadow-[0_2px_10px_rgba(250,204,21,0.45)]',
      subtitleColor: 'text-purple-100/95',
      btnBg: 'bg-gradient-to-r from-[#FDE047] to-[#FBBF24] hover:from-[#FACC15] hover:to-[#F59E0B] text-[#3B0764] shadow-lg shadow-black/35',
    },
    {
      id: 3,
      tag: '🍬 PURE GHEE SWEETS • MIN. 30% OFF',
      tagBg: 'bg-[#FEF08A] text-[#831843]',
      title: 'FESTIVAL SWEETS & SNACKS',
      subtitle: 'Melt-in-mouth Kaju Katli, Motichoor Laddus, Bhujia & Savoury Namkeen!',
      btnText: 'Order Sweets & Snacks',
      ctaCategory: 'snacks-and-beverages',
      image: '/banner-sweets.webp',
      alt: 'Traditional Festival Sweets Kaju Katli',
      bgGradient: 'bg-gradient-to-r from-[#831843] via-[#9F1239] to-[#C2410C]',
      titleColor: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]',
      subtitleColor: 'text-pink-100/95',
      btnBg: 'bg-white hover:bg-amber-50 text-[#9F1239] shadow-lg shadow-black/25',
    },
    {
      id: 4,
      tag: '🪔 POOJA & HOME SPECIAL • UP TO 50% OFF',
      tagBg: 'bg-[#FDE047] text-[#0B1536]',
      title: 'GET HOME FESTIVAL READY',
      subtitle: 'Pure Camphor, Brass Diyas, Fragrant Agarbatti & Complete Festive Home Care!',
      btnText: 'Shop Pooja & Home Deals',
      ctaCategory: 'household',
      image: '/banner-pooja-thali.webp',
      alt: 'Festive Pooja Thali and Home Essentials',
      bgGradient: 'bg-gradient-to-r from-[#0B1536] via-[#1E3A8A] to-[#2563EB]',
      titleColor: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]',
      subtitleColor: 'text-blue-100/95',
      btnBg: 'bg-[#FDE047] hover:bg-[#FACC15] text-[#0B1536] shadow-lg shadow-black/25',
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
      className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200/80 w-full min-h-[190px] xs:min-h-[205px] sm:h-[235px] md:h-[265px] lg:h-[285px] group select-none"
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
            <div className="absolute right-1/4 -bottom-12 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-yellow-400/15 blur-2xl pointer-events-none" />

            {/* Left Column Content - High-Impact Loud Festival Typography */}
            <div className="flex-1 min-w-0 pr-2 sm:pr-4 text-left z-10 flex flex-col justify-center py-1">
              {/* Loud Offer Badge Tag */}
              <div className="mb-1 sm:mb-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm ${slide.tagBg}`}>
                  {slide.tag}
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
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl border-2 border-white/80 bg-white/20 backdrop-blur-xs group/img">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
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
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
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
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        aria-label="Next banner"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/25 backdrop-blur-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
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
