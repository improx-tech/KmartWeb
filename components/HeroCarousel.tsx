'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SlideItem {
  id: number;
  kicker: string;
  deliveryTag: string;
  offer: string;
  offerColor: string;
  headline: string;
  subtext: string;
  productTags: string[];
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
    kicker: '🪔 पूजा व उत्सव विशेष',
    deliveryTag: '⚡ १० मिनिटांत डिलिव्हरी',
    offer: '५०% पर्यंत सूट',
    offerColor: 'text-amber-400',
    headline: 'दिवाळी पूजा व उत्सव साहित्य',
    subtext: 'शुद्ध कापूर, पितळी दिवे, अगरबत्ती, धूप व संपूर्ण पूजा संच उत्तम दरात',
    productTags: ['🪔 पितळी दिवे', '🪵 भीमसेनी कापूर', '🌸 सुगंधी अगरबत्ती', '✨ पूजा संच'],
    trustText: '✓ १००% शुद्ध व सात्विक साहित्य',
    btnText: 'पूजा साहित्य खरेदी करा',
    ctaCategory: 'pooja-samagri',
    image: '/banner-diwali-3.jpg',
    alt: 'दिवाळी पूजा व उत्सव साहित्य - खास ऑफर्स',
    bgColor: 'bg-[#0A1A2F]',
    overlayGradient: 'from-[#0A1A2F] via-[#0A1A2F]/25 to-transparent',
    mobileOverlayGradient: 'from-[#0A1A2F]/85 via-[#0A1A2F]/30 to-transparent',
  },
  {
    id: 2,
    kicker: '🌾 घरगुती किराणा',
    deliveryTag: '⚡ १० मिनिटांत डिलिव्हरी',
    offer: '२५% ते ४०% सूट',
    offerColor: 'text-red-400',
    headline: 'दररोजचा किराणा व धान्य साहित्य',
    subtext: 'आशीर्वाद आटा, खाद्यतेल, बासमती तांदूळ, डाळी व स्वयंपाकघराच्या दैनंदिन गरजा',
    productTags: ['🌾 शरबती आटा', '🛢️ शुद्ध खाद्यतेल व तूप', '🍚 बासमती तांदूळ', '🥣 डाळी व मसाले'],
    trustText: '✓ जवळच्या K MART स्टोअरमधून थेट',
    btnText: 'किराणा खरेदी करा',
    ctaCategory: 'groceries',
    image: '/banner-diwali-2.jpg',
    alt: 'दररोजचा किराणा व धान्य साहित्य होलसेल दरात',
    bgColor: 'bg-[#0A2540]',
    overlayGradient: 'from-[#0A2540] via-[#0A2540]/25 to-transparent',
    mobileOverlayGradient: 'from-[#0A2540]/85 via-[#0A2540]/30 to-transparent',
  },
  {
    id: 3,
    kicker: '🍬 फराळ व मिठाई बाजार',
    deliveryTag: '⚡ १० मिनिटांत डिलिव्हरी',
    offer: 'किमान ३०% सूट',
    offerColor: 'text-yellow-300',
    headline: 'खमंग दिवाळी फराळ, मिठाई व सुकामेवा',
    subtext: 'साजूक तुपातील लाडू, काजू कतली, ड्रायफ्रूट्स व आकर्षक भेट बॉक्सेस',
    productTags: ['🎁 गिफ्ट हॅम्पर्स', '✨ काजू कतली', '🥜 बदाम व काजू', '🥨 खमंग फराळ'],
    trustText: '✓ शुद्ध साजूक तुपात ताजे तयार',
    btnText: 'फराळ व मिठाई मागवा',
    ctaCategory: 'snacks-and-beverages',
    image: '/banner-diwali-1.jpg',
    alt: 'खमंग दिवाळी फराळ, मिठाई व सुकामेवा',
    bgColor: 'bg-[#180A15]',
    overlayGradient: 'from-[#180A15] via-[#180A15]/25 to-transparent',
    mobileOverlayGradient: 'from-[#180A15]/85 via-[#180A15]/30 to-transparent',
  },
  {
    id: 4,
    kicker: '✨ दिवाळी महाधमाका',
    deliveryTag: '⚡ १० मिनिटांत डिलिव्हरी',
    offer: 'भव्य उत्सव ऑफर्स',
    offerColor: 'text-amber-400',
    headline: 'उत्सवाचा आनंद घराघरी पोहोचवूया !',
    subtext: 'दिवाळीसाठी लागणाऱ्या सर्व वस्तू एकाच ठिकाणी - किराणा, मिठाई व सजावट',
    productTags: ['🛒 दैनंदिन गरजा', '🏠 घरातील वस्तू', '🧴 घरगुती उत्पादने', '✨ दर्जेदार माल'],
    trustText: '✓ घरपोच जलद सेवा व सर्वोत्तम दर',
    btnText: 'दिवाळी खरेदी करा',
    ctaCategory: 'groceries',
    image: '/banner-diwali-4.png',
    alt: 'उत्सवाचा आनंद घराघरी पोहोचवूया ! दिवाळीसाठी लागणाऱ्या सर्व गरजेच्या वस्तू आता एकाच ठिकाणी',
    bgColor: 'bg-[#230508]',
    overlayGradient: 'from-[#230508] via-[#230508]/25 to-transparent',
    mobileOverlayGradient: 'from-[#230508]/85 via-[#230508]/30 to-transparent',
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
      className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-200/90 w-full h-[235px] xs:h-[260px] sm:h-[300px] md:h-[335px] lg:h-[360px] group select-none bg-[#0A2540]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="K MART ऑफर्स बॅनर"
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
            {/* Visual Photography Layer on Right with Low Opacity Overlay */}
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

              {/* Desktop fade with low opacity for bright imagery */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayGradient} hidden sm:block pointer-events-none`} />

              {/* Mobile vertical fade to ensure text readability */}
              <div className={`absolute inset-0 bg-gradient-to-t ${slide.mobileOverlayGradient} sm:hidden pointer-events-none`} />
            </div>

            {/* Editorial Content Column on Left in Pure Marathi */}
            <div className="relative z-10 w-full sm:w-[60%] md:w-[56%] px-4 py-3.5 sm:px-8 sm:py-6 md:px-10 flex flex-col justify-center items-start text-left">
              {/* Delivery and Kicker Badges */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span>{slide.deliveryTag}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/10 text-white/95 border border-white/15 backdrop-blur-xs">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" />
                  <span>{slide.kicker}</span>
                </span>
              </div>

              {/* Discount Offer Callout */}
              <div className="mb-0.5 sm:mb-1.5">
                <span className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none ${slide.offerColor}`}>
                  {slide.offer}
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-sm xs:text-base sm:text-xl md:text-2xl font-bold text-white tracking-tight mb-1 sm:mb-2 line-clamp-1">
                {slide.headline}
              </h2>

              {/* Subtitle */}
              <p className="text-[11px] xs:text-xs sm:text-sm md:text-base text-slate-200 font-medium max-w-sm sm:max-w-md line-clamp-2 leading-snug sm:leading-relaxed mb-2.5 sm:mb-3.5">
                {slide.subtext}
              </p>

              {/* Product Tags (hidden on tiny screens, visible on sm+) */}
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 flex-wrap mb-3 sm:mb-4">
                {slide.productTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-white/95 border border-white/10 backdrop-blur-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button & Trust Note */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCta(slide.ctaCategory);
                  }}
                  className="bg-[#E11A22] hover:bg-[#c8141b] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 sm:gap-2 shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>{slide.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </button>
                <span className="text-[11px] sm:text-xs text-slate-300 font-medium hidden xs:inline-block">
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
