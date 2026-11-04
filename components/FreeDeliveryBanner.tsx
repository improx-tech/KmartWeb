'use client';

import React from 'react';
import { Truck, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FreeDeliveryBannerComponent: React.FC = () => {
  const { maxDeliveryRadiusKm } = useApp();
  const radius = maxDeliveryRadiusKm ?? 5;

  const handleShopNow = () => {
    const elem = document.getElementById('products-section');
    if (elem) {
      const navOffset = -110;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + navOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#180C10] via-[#241218] to-[#180C10] rounded-2xl px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 text-white shadow-sm border border-amber-500/25">
      {/* Top subtle golden-amber accent line matching festive Diwali theme */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

      {/* Left: Icon + Text in Marathi */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 relative z-10">
        
        {/* Festive Delivery Van Icon in warm K MART Red Container */}
        <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-[#E11A22] rounded-xl flex items-center justify-center shadow-md">
          <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold text-amber-200 bg-amber-500/15 border border-amber-400/30 px-2.5 py-0.5 rounded-md uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              🪔 शुभ दीपावली • K MART घरपोच सेवा
            </span>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-bold text-[#FFFDF7] leading-tight mt-1">
            दिवाळी सणाची संपूर्ण खरेदी थेट आपल्या घरी!
          </p>
          <p className="text-[11px] sm:text-xs text-stone-300 font-normal mt-0.5 truncate">
            K MART स्टोअरपासून {radius} किमी अंतरापर्यंत सुरक्षित, ताजी व जलद घरपोच डिलिव्हरी.
          </p>
        </div>
      </div>

      {/* Right: Service Details + Button in Marathi */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 relative z-10">
        <div className="hidden md:block text-right">
          <p className="text-lg sm:text-xl font-bold text-amber-100 leading-none tracking-tight">
            घरपोच सेवा
          </p>
          <p className="text-[10px] sm:text-[11px] text-stone-300 font-medium uppercase tracking-wider mt-1">
            सुरक्षित व तत्पर • ≤ {radius} किमी
          </p>
        </div>
        <button
          type="button"
          onClick={handleShopNow}
          className="bg-[#E11A22] hover:bg-[#c8141b] text-white text-xs sm:text-sm font-semibold px-4 py-2 sm:py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>दिवाळी खरेदी करा</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const FreeDeliveryBanner = React.memo(FreeDeliveryBannerComponent);
