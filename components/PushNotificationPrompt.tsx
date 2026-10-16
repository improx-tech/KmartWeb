'use client';

import React, { useState, useEffect } from 'react';
import { Truck, X } from 'lucide-react';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendWelcomeNotification
} from '../services/pushNotification';

export const PushNotificationPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only check on client
    if (!isPushSupported()) return;

    const currentPerm = getNotificationPermission();
    if (currentPerm !== 'default') return;

    // Check if dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem('kmart_delivery_prompt_dismissed');
    if (dismissedAt) {
      const timeDiff = Date.now() - parseInt(dismissedAt, 10);
      if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Delay prompt appearance by 3.5 seconds so user first sees the site smoothly
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    setIsVisible(false);
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      await sendWelcomeNotification();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('kmart_delivery_prompt_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] sm:w-96 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E11A22] flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-sm font-bold text-gray-900 leading-tight">
            Enable Live Delivery Alerts
          </h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Get instant browser notifications when your order is packed, dispatched, and out for doorstep delivery.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleAllow}
              className="bg-[#E11A22] hover:bg-[#c8151c] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Allow Delivery Alerts
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1.5 transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
