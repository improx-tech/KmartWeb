'use client';

import React from 'react';
import { Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FreeDeliveryBanner: React.FC = () => {
  const { maxDeliveryRadiusKm } = useApp();
  const radius = maxDeliveryRadiusKm ?? 5;

  return (
    <div className="bg-[#104A9E] rounded-xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3 sm:gap-4 text-white shadow-sm">
      {/* Left: Icon + Text */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        
        {/* Delivery Van Icon in Orange Container */}
        <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-orange-500 rounded-xl flex items-center justify-center shadow-xs">
          <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            FREE DELIVERY OFFER
          </p>
          <p className="text-sm sm:text-base md:text-lg font-bold text-white leading-tight">
            First 3 deliveries are free
          </p>
          <p className="text-[11px] text-blue-100 font-normal mt-0.5 truncate">
            Valid on first 3 orders ≤ {radius} km from K MART store.
          </p>
        </div>
      </div>

      {/* Right: Price & Distance Tag — hidden on xs, visible sm+ */}
      <div className="hidden sm:block shrink-0 text-right">
        <p className="text-xl sm:text-2xl font-black text-white leading-none">
          FREE
        </p>
        <p className="text-[11px] text-blue-100 font-semibold uppercase tracking-wider mt-1">
          FIRST 3 • ≤ {radius} KM
        </p>
      </div>
    </div>
  );
};
