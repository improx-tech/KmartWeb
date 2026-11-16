'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Sparkles,
  Store,
  Coffee,
  CheckCircle2,
  Clock,
  PackageCheck,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SlideItem {
  id: number;
  kicker: string;
  headline: string;
  subtext: string;
  trustText: string;
  btnText: string;
  ctaCategory: string;
  gradientBg: string;
  accentColor: string;
  accentBorder: string;
  accentGlow: string;
  iconBg: string;
  chips: string[];
  mainIcon: React.ElementType;
  badge1: {
    icon: React.ElementType;
    text: string;
  };
  badge2: {
    icon: React.ElementType;
    text: string;
  };
  cardTitle: string;
  cardSubtitle: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    kicker: 'किराणा व स्वयंपाकघर',
    headline: 'दररोजचा किराणा व स्वयंपाकघराच्या गरजा',
    subtext: 'आशीर्वाद आटा, बासमती तांदूळ, डाळी, शुद्ध खाद्यतेल व दैनंदिन स्वयंपाकघराचे सर्व सामान.',
    trustText: '✓ अस्सल दर्जा व सुरक्षित पॅकिंग',
    btnText: 'किराणा खरेदी करा',
    ctaCategory: 'groceries',
    gradientBg: 'from-[#07172B] via-[#0C2442] to-[#123663]',
    accentColor: 'text-amber-400',
    accentBorder: 'border-amber-400/30',
    accentGlow: 'bg-amber-400/15',
    iconBg: 'from-amber-500 to-orange-600',
    chips: ['शरबती आटा व तांदूळ', 'शुद्ध खाद्यतेल व मसाले', 'दर्जेदार डाळी'],
    mainIcon: ShoppingBag,
    badge1: {
      icon: CheckCircle2,
      text: '१००% शुद्ध व अस्सल धान्य',
    },
    badge2: {
      icon: Layers,
      text: 'स्वयंपाकघराच्या सर्व गरजा',
    },
    cardTitle: 'दैनंदिन किराणा भांडार',
    cardSubtitle: 'सर्वोत्तम ब्रँड्स • ताजी आवक',
  },
  {
    id: 2,
    kicker: 'सुपरफास्ट सेवा',
    headline: 'सर्व गरजेच्या वस्तू थेट आपल्या दारात',
    subtext: 'धान्य, पॅकेज्ड फूड, पेये आणि घरगुती गरजा थेट आपल्या घरी जलद व सुरक्षित पोहोच.',
    trustText: '✓ आपुलकी आणि विश्वासाची सेवा',
    btnText: 'खरेदी सुरू करा',
    ctaCategory: 'groceries',
    gradientBg: 'from-[#051F19] via-[#09352B] to-[#0E4C3E]',
    accentColor: 'text-emerald-400',
    accentBorder: 'border-emerald-400/30',
    accentGlow: 'bg-emerald-400/15',
    iconBg: 'from-emerald-500 to-teal-600',
    chips: ['जलद घरपोच डिलिव्हरी', 'थेट K MART स्टोअरमधून', 'काँटॅक्टलेस सेवा'],
    mainIcon: Truck,
    badge1: {
      icon: Clock,
      text: 'वेळेवर घरपोच डिलिव्हरी',
    },
    badge2: {
      icon: Store,
      text: 'स्थानिक K MART स्टोअर',
    },
    cardTitle: 'डोअरस्टेप डिलिव्हरी',
    cardSubtitle: 'विश्वासू डिलिव्हरी पार्टनर',
  },
  {
    id: 3,
    kicker: 'अस्सल चव व ताजेपणा',
    headline: 'ताजी अस्सल मिठाई व चवदार स्नॅक्स',
    subtext: 'शुद्ध साजूक तुपातील मिठाई, काजू कतली, लाडू, चहा-कॉफी व खमंग नमकीन एकाच ठिकाणी.',
    trustText: '✓ ताजे व अस्सल चवीची हमी',
    btnText: 'स्नॅक्स व मिठाई पहा',
    ctaCategory: 'snacks-and-beverages',
    gradientBg: 'from-[#230911] via-[#380E1B] to-[#541429]',
    accentColor: 'text-rose-400',
    accentBorder: 'border-rose-400/30',
    accentGlow: 'bg-rose-400/15',
    iconBg: 'from-rose-500 to-pink-600',
    chips: ['साजूक तुपातील मिठाई', 'प्रीमियम चहा व कॉफी', 'खमंग नमकीन'],
    mainIcon: Coffee,
    badge1: {
      icon: Sparkles,
      text: 'अस्सल साजूक तूप मिठाई',
    },
    badge2: {
      icon: PackageCheck,
      text: 'हायजिनिक पॅकिंग',
    },
    cardTitle: 'मिठाई व अल्पोपहार',
    cardSubtitle: 'चवदार व नेहमी ताजे',
  },
  {
    id: 4,
    kicker: 'घरगुती काळजी',
    headline: 'घरगुती स्वच्छता व दैनंदिन काळजी',
    subtext: 'प्रीमियम डिटर्जंट्स, डिशवॉश, फ्लोअर क्लिनर्स व वैयक्तिक स्वच्छतेची दर्जेदार उत्पादने.',
    trustText: '✓ १००% अस्सल ब्रँडेड उत्पादने',
    btnText: 'घरगुती सामान पहा',
    ctaCategory: 'household',
    gradientBg: 'from-[#08182B] via-[#0E294B] to-[#163D6E]',
    accentColor: 'text-sky-400',
    accentBorder: 'border-sky-400/30',
    accentGlow: 'bg-sky-400/15',
    iconBg: 'from-sky-500 to-blue-600',
    chips: ['फ्लोर व टॉयलेट क्लिनर्स', 'टॉप ब्रँडेड डिटर्जंट्स', 'पर्सनल हायजिन'],
    mainIcon: ShieldCheck,
    badge1: {
      icon: CheckCircle2,
      text: 'विश्वासू ब्रँड्सची हमी',
    },
    badge2: {
      icon: Sparkles,
      text: 'घर स्वच्छ व निरोगी',
    },
    cardTitle: 'होम व पर्सनल केअर',
    cardSubtitle: 'स्वच्छता आणि आरोग्य',
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
      className="relative rounded-2xl overflow-hidden shadow-sm border border-stone-800/20 w-full h-[235px] xs:h-[260px] sm:h-[300px] md:h-[335px] lg:h-[360px] group select-none bg-[#07172B]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="K MART बॅनर"
    >
      {/* Sliding Track */}
      <div
        className="flex h-full w-full min-w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, i) => {
          const MainIcon = slide.mainIcon;
          const Badge1Icon = slide.badge1.icon;
          const Badge2Icon = slide.badge2.icon;

          return (
            <div
              key={slide.id}
              onClick={() => handleCta(slide.ctaCategory)}
              className={`w-full min-w-full basis-full shrink-0 h-full bg-gradient-to-br ${slide.gradientBg} relative overflow-hidden flex items-center cursor-pointer`}
            >
              {/* Background Geometric & Decorative SVG Pattern Layer */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                {/* Subtle Dot Matrix Grid */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`dot-pattern-${slide.id}`} width="28" height="28" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#FFFFFF" fillOpacity="0.3" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#dot-pattern-${slide.id})`} />
                </svg>

                {/* Atmospheric Ambient Glow Orbs */}
                <div className={`absolute -right-16 -top-16 w-80 h-80 rounded-full ${slide.accentGlow} blur-3xl`} />
                <div className={`absolute right-1/3 -bottom-20 w-72 h-72 rounded-full ${slide.accentGlow} blur-3xl`} />
              </div>

              {/* Decorative Concentric Rings in Background */}
              <div className="absolute right-[-8%] top-1/2 -translate-y-1/2 w-[380px] h-[380px] md:w-[480px] md:h-[480px] rounded-full border border-white/[0.06] pointer-events-none hidden sm:block" />
              <div className="absolute right-[-4%] top-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full border border-white/[0.08] pointer-events-none hidden sm:block" />
              <div className="absolute right-[0%] top-1/2 -translate-y-1/2 w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full border border-white/[0.1] pointer-events-none hidden sm:block" />

              {/* Content Grid: Left Editorial + Right Graphic Design Composition */}
              <div className="relative z-10 w-full h-full flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 md:px-12">
                
                {/* Left Column: Editorial Content */}
                <div className="w-full sm:w-[60%] md:w-[58%] flex flex-col justify-center items-start text-left space-y-2 sm:space-y-3">
                  
                  {/* Category Pill Kicker */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 ${slide.accentBorder} border backdrop-blur-md text-[10px] sm:text-xs font-semibold ${slide.accentColor}`}>
                    <Sparkles className="w-3 h-3" />
                    <span>{slide.kicker}</span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight line-clamp-2">
                    {slide.headline}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-white/80 font-normal max-w-sm sm:max-w-md md:max-w-lg line-clamp-2 leading-relaxed">
                    {slide.subtext}
                  </p>

                  {/* Feature Chips */}
                  <div className="hidden xs:flex items-center gap-1.5 flex-wrap pt-0.5">
                    {slide.chips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.08] text-white/90 border border-white/10 backdrop-blur-xs"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Action Button & Trust Note */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap pt-1 sm:pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCta(slide.ctaCategory);
                      }}
                      className="bg-[#E11A22] hover:bg-[#c8141b] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-black/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <span>{slide.btnText}</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                    </button>
                    <span className="text-[11px] sm:text-xs text-white/70 font-normal hidden sm:inline-block">
                      {slide.trustText}
                    </span>
                  </div>
                </div>

                {/* Right Column: Modern Graphic Design Composition (No Photos!) */}
                <div className="hidden sm:flex w-[38%] md:w-[40%] h-full items-center justify-center relative select-none pointer-events-none">
                  
                  {/* Glassmorphic Central Card */}
                  <div className="relative w-56 md:w-64 p-5 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col items-center text-center space-y-3 transform hover:scale-105 transition-transform duration-500">
                    
                    {/* Glowing Vector Icon Orb */}
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${slide.iconBg} p-0.5 shadow-lg shadow-black/30 flex items-center justify-center transform -rotate-3`}>
                      <div className="w-full h-full rounded-[14px] bg-black/20 flex items-center justify-center backdrop-blur-xs">
                        <MainIcon className="w-7 h-7 md:w-8 md:h-8 text-white drop-shadow-md" />
                      </div>
                    </div>

                    {/* Card Title & Subtitle */}
                    <div className="space-y-0.5">
                      <h3 className="text-white font-bold text-sm md:text-base tracking-tight">
                        {slide.cardTitle}
                      </h3>
                      <p className="text-white/70 text-[11px] md:text-xs">
                        {slide.cardSubtitle}
                      </p>
                    </div>

                    {/* Verified Trust Strip */}
                    <div className="w-full pt-1 border-t border-white/10 flex items-center justify-center gap-1.5 text-emerald-300 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>K MART Verified</span>
                    </div>
                  </div>

                  {/* Floating Micro Badge 1 (Top Left) */}
                  <div className="absolute -top-1 left-2 md:left-6 px-3 py-1.5 rounded-xl bg-white/[0.12] backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5 text-white text-[10px] md:text-xs font-semibold animate-pulse">
                    <Badge1Icon className={`w-3.5 h-3.5 ${slide.accentColor}`} />
                    <span>{slide.badge1.text}</span>
                  </div>

                  {/* Floating Micro Badge 2 (Bottom Right) */}
                  <div className="absolute -bottom-1 right-2 md:right-4 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 shadow-lg flex items-center gap-1.5 text-white/90 text-[10px] md:text-xs font-medium">
                    <Badge2Icon className="w-3.5 h-3.5 text-amber-300" />
                    <span>{slide.badge2.text}</span>
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Prev Navigation Arrow */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-[#E11A22] text-white shadow-md backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
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
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-[#E11A22] text-white shadow-md backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
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
