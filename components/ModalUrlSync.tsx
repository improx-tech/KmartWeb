'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../context/AppContext';

function ModalSyncInner() {
  const searchParams = useSearchParams();
  const { 
    setIsCartOpen, 
    setIsCheckoutOpen, 
    setIsLocationOpen, 
    setIsOrdersModalOpen, 
    setIsAuthOpen 
  } = useApp();

  useEffect(() => {
    const open = searchParams.get('open');
    if (open === 'cart') {
      setIsCartOpen(true);
    } else if (open === 'checkout') {
      setIsCheckoutOpen(true);
    } else if (open === 'location') {
      setIsLocationOpen(true);
    } else if (open === 'orders') {
      setIsOrdersModalOpen(true);
    } else if (open === 'auth' || open === 'login') {
      setIsAuthOpen(true);
    }
  }, [searchParams, setIsCartOpen, setIsCheckoutOpen, setIsLocationOpen, setIsOrdersModalOpen, setIsAuthOpen]);

  return null;
}

export function ModalUrlSync() {
  return (
    <Suspense fallback={null}>
      <ModalSyncInner />
    </Suspense>
  );
}
