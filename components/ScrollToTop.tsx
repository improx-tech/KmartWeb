'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past 350px
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[4.75rem] right-4 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <button
        type="button"
        onClick={scrollToTop}
        className="group flex items-center gap-2 bg-[#0A2540] hover:bg-[#E11A22] text-white p-3 sm:px-4 sm:py-2.5 rounded-full shadow-[0_8px_25px_rgba(10,37,64,0.3)] hover:shadow-[0_10px_30px_rgba(225,26,34,0.35)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E11A22] focus:ring-offset-2"
        aria-label="Scroll back to top"
        title="Back to Top"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <ArrowUp className="w-4 h-4 text-white transition-transform duration-300 group-hover:-translate-y-0.5" />
        </div>
        <span className="hidden sm:inline-block text-xs font-bold tracking-wide pr-0.5">
          Top
        </span>
      </button>
    </div>
  );
};
