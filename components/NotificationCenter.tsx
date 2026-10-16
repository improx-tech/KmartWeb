'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, CheckCircle, Truck, X, ShieldAlert, PackageCheck, Package, Clock } from 'lucide-react';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendWelcomeNotification,
} from '../services/pushNotification';
import { useApp } from '../context/AppContext';
import Link from 'next/link';

// Map order status → icon + colour
const STATUS_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'Order Confirmed': {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  'Packed': {
    icon: <Package className="w-3.5 h-3.5" />,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  'Out for Delivery': {
    icon: <Truck className="w-3.5 h-3.5" />,
    color: 'text-orange-500',
    bg: 'bg-orange-100',
  },
  'Ready for Pickup': {
    icon: <Package className="w-3.5 h-3.5" />,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  'Picked Up': {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  'Delivered': {
    icon: <PackageCheck className="w-3.5 h-3.5" />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
};

function getStatusMeta(status: string) {
  return (
    STATUS_META[status] ?? {
      icon: <Clock className="w-3.5 h-3.5" />,
      color: 'text-gray-500',
      bg: 'bg-gray-100',
    }
  );
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const NotificationCenter: React.FC = () => {
  const { orders } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSupported, setIsSupported] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supported = isPushSupported();
    setIsSupported(supported);
    if (supported) {
      const currentPerm = getNotificationPermission();
      setPermission(currentPerm);
      if (currentPerm !== 'granted') {
        setHasUnread(true);
      }
    }
  }, []);

  // Show unread dot when there are active (non-delivered) orders
  useEffect(() => {
    if (permission === 'granted') {
      const hasActive = orders.some(
        (o) => o.status !== 'Delivered' && o.status !== 'Picked Up'
      );
      setHasUnread(hasActive);
    }
  }, [orders, permission]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleEnablePush = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      setHasUnread(false);
      await sendWelcomeNotification();
    }
  };

  if (!isSupported) {
    return null;
  }

  // Show latest 5 orders, newest first
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnread(false);
        }}
        className="relative p-2 rounded-full text-gray-700 hover:text-[#0A2540] hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="Delivery Alerts"
        title="Delivery Alerts"
      >
        {permission === 'granted' ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellRing className="w-5 h-5 text-gray-700" />
        )}

        {/* Unread Indicator */}
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E11A22] ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/70 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#E11A22]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#0A2540]">Delivery Alerts</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-[440px] overflow-y-auto">
            {/* Permission Status Box */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Delivery Alerts Status
                </span>
                {permission === 'granted' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <CheckCircle className="w-3 h-3" /> Enabled
                  </span>
                ) : permission === 'denied' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/60">
                    <ShieldAlert className="w-3 h-3" /> Blocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                    Not Enabled
                  </span>
                )}
              </div>

              {permission !== 'granted' ? (
                <div>
                  <p className="text-xs text-gray-600 mb-2.5">
                    {permission === 'denied'
                      ? 'Browser notifications are blocked. Please allow notifications in your browser settings to receive order and delivery updates.'
                      : 'Enable delivery alerts to track your orders in real time from checkout to your doorstep.'}
                  </p>
                  {permission !== 'denied' && (
                    <button
                      type="button"
                      onClick={handleEnablePush}
                      className="w-full bg-[#E11A22] hover:bg-[#c8151c] text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      Allow Delivery Alerts
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  You are receiving real-time notifications for order confirmation and doorstep delivery updates.
                </p>
              )}
            </div>

            {/* Recent Orders Feed */}
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Recent Orders
              </span>

              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500">No orders yet</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Place an order and track it here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order) => {
                    const meta = getStatusMeta(order.status);
                    const isActive =
                      order.status !== 'Delivered' && order.status !== 'Picked Up';
                    return (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl border border-gray-100/80 bg-gray-50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
                      >
                        {/* Status Icon */}
                        <div
                          className={`w-7 h-7 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center shrink-0 mt-0.5`}
                        >
                          {meta.icon}
                        </div>

                        {/* Order Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-[#0A2540] truncate">
                              INV-{(order.orderNumber || order.id).replace('#', '')}
                            </p>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E11A22] shrink-0 animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-semibold text-gray-500 truncate">
                              Order #{order.orderNumber || order.id?.slice(0, 8)}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className={`text-[11px] font-semibold shrink-0 ${meta.color}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {timeAgo(order.createdAt)}
                            {' · '}
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            {' · '}₹{order.totalAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
