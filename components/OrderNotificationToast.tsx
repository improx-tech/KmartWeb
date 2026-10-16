'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle2, Clock, X, ChevronRight, Bell } from 'lucide-react';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  status?: string;
  orderNumber?: string;
  orderId?: string;
  url?: string;
  timestamp: number;
}

// Gentle pleasant synthesized chime using Web Audio API
const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second tone (higher chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch {
    // Ignore audio autoplay restrictions gracefully
  }
};

export const OrderNotificationToast: React.FC = () => {
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);

  useEffect(() => {
    const handleNotification = (event: CustomEvent<InAppNotification>) => {
      const data = event.detail;
      if (!data) return;

      setActiveToast({
        ...data,
        id: data.id || `toast-${Date.now()}`,
        timestamp: Date.now(),
      });

      // Play soft chime
      playNotificationChime();
    };

    window.addEventListener('kmart-order-notification' as any, handleNotification);

    return () => {
      window.removeEventListener('kmart-order-notification' as any, handleNotification);
    };
  }, []);

  // Auto-dismiss after 7 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  const status = (activeToast.status || '').toUpperCase().replace(/[\s-]+/g, '_');
  
  let IconComponent = Bell;
  let borderColor = 'border-blue-500';
  let badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
  let iconBg = 'bg-blue-600 text-white';

  if (status.includes('PACKED')) {
    IconComponent = Package;
    borderColor = 'border-indigo-500';
    badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    iconBg = 'bg-indigo-600 text-white';
  } else if (status.includes('OUT_FOR_DELIVERY') || status.includes('DELIVERY')) {
    IconComponent = Truck;
    borderColor = 'border-orange-500';
    badgeBg = 'bg-orange-50 text-orange-700 border-orange-200';
    iconBg = 'bg-orange-500 text-white';
  } else if (status.includes('DELIVERED') || status.includes('PICKED_UP')) {
    IconComponent = CheckCircle2;
    borderColor = 'border-emerald-500';
    badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    iconBg = 'bg-emerald-600 text-white';
  } else if (status.includes('PREPARING') || status.includes('CONFIRMED')) {
    IconComponent = Clock;
    borderColor = 'border-amber-500';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    iconBg = 'bg-amber-500 text-white';
  }

  const destinationUrl = activeToast.url || (activeToast.orderId ? `/orders/${activeToast.orderId}` : '/orders');

  return (
    <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-[120] max-w-sm sm:max-w-md w-[calc(100%-2rem)] animate-slide-in-right">
      <div className={`bg-white rounded-2xl shadow-2xl border-2 ${borderColor} p-4 sm:p-4.5 relative overflow-hidden backdrop-blur-md`}>
        {/* Subtle accent glow at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E11A22] via-orange-500 to-emerald-500" />

        <div className="flex items-start gap-3.5">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-md animate-bounce`}>
            <IconComponent className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeBg}`}>
                {activeToast.status ? activeToast.status.replace(/_/g, ' ') : 'Live Update'}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Just now</span>
            </div>

            <h4 className="text-sm font-black text-gray-900 leading-snug">
              {activeToast.title}
            </h4>

            <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
              {activeToast.body}
            </p>

            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
              <Link
                href={destinationUrl}
                onClick={() => setActiveToast(null)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#E11A22] hover:text-[#c8141b] transition-colors"
              >
                <span>Track Live Order</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setActiveToast(null)}
                className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setActiveToast(null)}
            className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
