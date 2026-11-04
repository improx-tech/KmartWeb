'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SlideItem {
  id: number;
  headline: string;
  subtext: string;
  trustText: string;
  btnText: string;
  ctaCategory: string;
  image: string;
  alt: string;
  bgColor: string;
  overlayGradient: string;
  mobileOverlayGradient: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    headline: 'दीपावलीच्या हार्दिक शुभेच्छा !',
    subtext: 'प्रकाश, सुख, समृद्धी आणि मांगल्याची ही दिवाळी आपल्या आणि आपल्या कुटुंबाच्या आयुष्यात आनंद व समाधान घेऊन येवो.',
    trustText: '✓ K MART परिवारातर्फे मनःपूर्वक शुभेच्छा',
    btnText: 'दिवाळी विशेष पहा',
    ctaCategory: 'pooja-samagri',
    image: '/diwali-slide-lantern.jpg',
    alt: 'दीपावलीच्या हार्दिक शुभेच्छा - पारंपरिक पणत्या व रोषणाई',
    bgColor: 'bg-[#24080B]',
    overlayGradient: 'from-[#24080B] via-[#24080B]/80 to-transparent',
    mobileOverlayGradient: 'from-[#24080B]/90 via-[#24080B]/45 to-transparent',
  },
  {
    id: 2,
    headline: 'दिवाळी पूजा व मांगल्य साहित्य',
    subtext: 'शुद्ध भीमसेनी कापूर, पितळी दिवे, अगरबत्ती, धूप, रांगोळी व लक्ष्मी पूजनासाठी संपूर्ण पवित्र साहित्य.',
    trustText: '✓ १००% शुद्ध व सात्विक दर्जा',
    btnText: 'पूजा साहित्य खरेदी करा',
    ctaCategory: 'pooja-samagri',
    image: '/diwali-slide-pooja.webp',
    alt: 'दिवाळी लक्ष्मी पूजन व सात्विक पूजा साहित्य',
    bgColor: 'bg-[#1E0E0C]',
    overlayGradient: 'from-[#1E0E0C] via-[#1E0E0C]/80 to-transparent',
    mobileOverlayGradient: 'from-[#1E0E0C]/90 via-[#1E0E0C]/45 to-transparent',
  },
  {
    id: 3,
    headline: 'शुद्ध तुपातील मिठाई व दिवाळी फराळ',
    subtext: 'साजूक तुपातील मोतीचूर लाडू, काजू कतली, चवदार चकली, करंजी व दर्जेदार ड्रायफ्रूट्स बॉक्सेस.',
    trustText: '✓ ताजे व अस्सल चवीची हमी',
    btnText: 'फराळ व मिठाई मागवा',
    ctaCategory: 'snacks-and-beverages',
    image: '/diwali-slide-sweets-alt.jpg',
    alt: 'खमंग दिवाळी फराळ, शुद्ध साजूक तुपातील मिठाई व सुकामेवा',
    bgColor: 'bg-[#200B06]',
    overlayGradient: 'from-[#200B06] via-[#200B06]/80 to-transparent',
    mobileOverlayGradient: 'from-[#200B06]/90 via-[#200B06]/45 to-transparent',
  },
  {
    id: 4,
    headline: 'दिवाळीची संपूर्ण खरेदी आपल्या दारात',
    subtext: 'धान्य, खाद्यतेल, साखर, सुकामेवा आणि दैनंदिन घरगुती गरजा थेट आपल्या घरी जलद व सुरक्षित.',
    trustText: '✓ आपुलकी आणि विश्वासाची परंपरा',
    btnText: 'किराणा खरेदी करा',
    ctaCategory: 'groceries',
    image: '/diwali-slide-store.png',
    alt: 'दिवाळीसाठी लागणाऱ्या सर्व गरजेच्या वस्तू आता एकाच ठिकाणी - K MART',
    bgColor: 'bg-[#141C2B]',
    overlayGradient: 'from-[#141C2B] via-[#141C2B]/80 to-transparent',
    mobileOverlayGradient: 'from-[#141C2B]/90 via-[#141C2B]/45 to-transparent',
  },
];

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { setSelectedCategory } = useApp();

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const slides = SLIDES;

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
    }, 5000);
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
      className="relative rounded-2xl overflow-hidden shadow-sm border border-stone-800/20 w-full h-[235px] xs:h-[260px] sm:h-[300px] md:h-[335px] lg:h-[360px] group select-none bg-[#1A0E12]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="K MART शुभ दीपावली बॅनर"
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
            className={`w-full min-w-full basis-full shrink-0 h-full ${slide.bgColor} relative overflow-hidden flex items-center cursor-pointer`}
          >
            {/* Visual Photography Layer on Right with Soft Elegant Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-[58%] sm:w-[54%] md:w-[52%] h-full z-0 overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                unoptimized
                sizes="(max-width: 640px) 75vw, (max-width: 1024px) 55vw, 750px"
                className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                priority={i === 0}
              />

              {/* Desktop fade with warm tones for realistic image blending */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayGradient} hidden sm:block pointer-events-none`} />

              {/* Mobile vertical fade to ensure text readability */}
              <div className={`absolute inset-0 bg-gradient-to-t ${slide.mobileOverlayGradient} sm:hidden pointer-events-none`} />
            </div>

            {/* Editorial Content Column on Left in Pure Marathi */}
            <div className="relative z-10 w-full sm:w-[60%] md:w-[56%] px-4 py-3.5 sm:px-8 sm:py-6 md:px-10 flex flex-col justify-center items-start text-left">
              {/* Headline */}
              <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl font-bold text-[#FFFDF7] tracking-tight mb-1.5 sm:mb-2 line-clamp-1">
                {slide.headline}
              </h2>

              {/* Subtitle */}
              <p className="text-[11px] xs:text-xs sm:text-sm md:text-base text-stone-200/90 font-normal max-w-sm sm:max-w-md md:max-w-lg line-clamp-2 leading-snug sm:leading-relaxed mb-3 sm:mb-4">
                {slide.subtext}
              </p>

              {/* Action Button & Trust Note */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCta(slide.ctaCategory);
                  }}
                  className="bg-[#E11A22] hover:bg-[#c8141b] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 sm:gap-2 shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>{slide.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </button>
                <span className="text-[11px] sm:text-xs text-stone-300 font-normal hidden xs:inline-block">
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
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-[#E11A22] text-white shadow-md backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        aria-label="मागील बॅनर"
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
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-[#E11A22] text-white shadow-md backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        aria-label="पुढील बॅनर"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
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
                ? 'w-5 sm:w-7 bg-[#E11A22] shadow-sm'
                : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`स्लाइड ${idx + 1} वर जा`}
          />
        ))}
      </div>
    </div>
  );
};
