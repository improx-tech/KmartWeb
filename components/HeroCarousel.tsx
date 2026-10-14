'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { setSelectedCategory } = useApp();

  const slides = [
    {
      id: 1,
      tag: 'STAPLES & PANTRY OFFERS',
      title: 'Save More on Atta, Rice & Dal',
      description: 'Trusted staples at special prices for your everyday kitchen.',
      btnText: 'Shop Offers',
      ctaCategory: 'groceries',
      badge: 'Up to 25% Off',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      bgColor: 'bg-[#FBF6EE]',
    },
    {
      id: 2,
      tag: 'SNACKS & BEVERAGES',
      title: 'Crunchy Munchies & Refreshing Drinks',
      description: 'Biscuits, namkeens, cold drinks, tea & coffee at up to 30% off.',
      btnText: 'Shop Snacks',
      ctaCategory: 'snacks-and-beverages',
      badge: 'Up to 30% Off',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
      bgColor: 'bg-[#F4FAF6]',
    },
    {
      id: 3,
      tag: 'HOUSEHOLD & CLEANING',
      title: 'Keep Your Home Fresh & Sparkling',
      description: 'Top brand detergents, dishwash bars, cleaners & hygiene essentials.',
      btnText: 'Shop Household',
      ctaCategory: 'household',
      badge: 'Sparkling Deals',
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
      bgColor: 'bg-[#F2F7FC]',
    },
    {
      id: 4,
      tag: 'DAILY ESSENTIALS',
      title: 'Everyday Grocery & Quality Essentials',
      description: 'Handpicked daily essentials delivered daily at unbeatable prices.',
      btnText: 'Shop Essentials',
      ctaCategory: 'groceries',
      badge: 'Best Value',
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
      bgColor: 'bg-[#FFF8F0]',
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
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

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-2xs border border-gray-200/70 min-h-[220px] xs:min-h-[240px] sm:h-[320px] md:h-[360px] lg:h-[380px] w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Sliding Track */}
      <div
        className="flex h-full w-full min-w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`w-full min-w-full basis-full shrink-0 h-full ${slide.bgColor} px-4 py-4 sm:px-8 sm:py-6 md:px-10 md:py-6 lg:px-12 lg:py-8 flex items-center justify-between gap-4 sm:gap-8 relative box-border overflow-hidden`}
          >
            {/* Left Column Content */}
            <div className="flex-1 min-w-0 max-w-lg text-left z-10 pb-6 sm:pb-8 flex flex-col justify-center">
              <span className="text-[10px] sm:text-xs font-bold text-[#0A2540] uppercase tracking-wider block mb-1 sm:mb-1.5">
                {slide.tag}
              </span>

              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-black text-[#E11A22] tracking-tight leading-[1.15] mb-1.5 sm:mb-2 line-clamp-2 sm:line-clamp-none">
                {slide.title}
              </h1>

              <p className="hidden sm:block text-xs sm:text-sm text-gray-600 font-medium max-w-md line-clamp-2 leading-relaxed mb-3 sm:mb-4">
                {slide.description}
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => handleCta(slide.ctaCategory)}
                  className="bg-[#E11A22] hover:bg-[#c8141b] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 sm:gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>{slide.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Right Column Banner Image — hidden on mobile */}
            <div
              onClick={() => handleCta(slide.ctaCategory)}
              className="hidden sm:flex relative shrink-0 w-52 sm:w-60 md:w-72 lg:w-[380px] xl:w-[420px] h-[180px] sm:h-[210px] md:h-[250px] lg:h-[270px] items-center justify-center pr-1 sm:pr-2 cursor-pointer"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border-2 border-white/80 bg-white group">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 640px) 0px, (max-width: 768px) 256px, (max-width: 1024px) 320px, 420px"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                  priority={true}
                />

                {/* Subtle soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent pointer-events-none" />

                {/* Floating Badge */}
                {slide.badge && (
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-gray-100/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E11A22] animate-pulse" />
                    <span className="text-xs font-black text-[#0A2540] tracking-wide uppercase">
                      {slide.badge}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Slide indicators at absolute bottom-left */}
      <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-8 md:left-10 lg:left-12 z-20 flex items-center gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentSlide ? 'w-5 bg-[#E11A22]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
};
