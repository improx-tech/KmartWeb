/**
 * K-Mart Web Push Notification Service
 * Handles browser notification permissions, service worker registration,
 * and dispatching push & local notifications.
 */

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
}

export const isPushSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!isPushSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
      localStorage.setItem('kmart_push_permission', 'granted');
    } else {
      localStorage.setItem('kmart_push_permission', permission);
    }
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
};

/**
 * Dispatch an in-app toast notification via CustomEvent.
 * Works independently of browser notification permission.
 */
const dispatchInAppNotification = (payload: PushNotificationPayload & { status?: string; orderId?: string; orderNumber?: string }) => {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent('kmart-order-notification', {
        detail: {
          id: `toast-${Date.now()}`,
          title: payload.title,
          body: payload.body,
          status: payload.status,
          orderNumber: payload.orderNumber,
          orderId: payload.orderId,
          url: payload.url,
          timestamp: Date.now(),
        },
      })
    );
  } catch {}
};

export const sendPushNotification = async (payload: PushNotificationPayload & { status?: string; orderId?: string; orderNumber?: string }): Promise<boolean> => {
  if (!isPushSupported()) return false;

  // ── Always fire in-app toast regardless of browser permission ──
  dispatchInAppNotification(payload);

  if (Notification.permission !== 'granted') return false;

  const options: NotificationOptions & { [key: string]: any } = {
    body: payload.body,
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/logo.png',
    image: payload.image,
    tag: payload.tag || 'kmart-alert',
    data: {
      url: payload.url || '/',
      timestamp: Date.now(),
    },
    // Vibration pattern for supported devices
    ...(navigator.userAgent.includes('Mobile') ? { vibrate: [200, 100, 200] } : {}),
  };

  try {
    // Try sending through active service worker first
    const registration = await navigator.serviceWorker.ready;
    if (registration && registration.showNotification) {
      await registration.showNotification(payload.title, options);
      return true;
    }
  } catch {
    // Fallback to standard Notification API if service worker is not yet ready
    try {
      const notification = new Notification(payload.title, options);
      notification.onclick = () => {
        window.focus();
        if (payload.url) {
          window.location.href = payload.url;
        }
        notification.close();
      };
      return true;
    } catch (e) {
      console.error('Direct notification dispatch error:', e);
    }
  }

  return false;
};

// ── Pre-configured Notification Triggers ──────────────────────────

export interface OrderNotificationTarget {
  id?: string;
  orderNumber?: string;
  invoiceNumber?: string;
  totalAmount?: number;
}

export const formatInvoiceNumber = (orderNumberOrId?: string | null): string => {
  if (!orderNumberOrId) return 'INV-KM';
  const clean = orderNumberOrId.replace(/^INV-/, '').replace(/^#/, '').trim();
  return `INV-${clean}`;
};

export const resolveOrderInvoiceDetails = (
  input: string | OrderNotificationTarget
): {
  orderId: string;
  orderNumber: string;
  invoiceNumber: string;
  totalAmount?: number;
} => {
  if (typeof input === 'object' && input !== null) {
    const rawId = input.id || '';
    const rawNum =
      input.orderNumber ||
      (rawId && !rawId.includes('-')
        ? rawId
        : rawId
        ? `KM-${rawId.replace(/-/g, '').slice(0, 6).toUpperCase()}`
        : 'KM-ORDER');
    const cleanNum = rawNum.replace(/^INV-/, '').replace(/^#/, '');
    const invoiceNumber = input.invoiceNumber || formatInvoiceNumber(cleanNum);
    return {
      orderId: rawId || cleanNum,
      orderNumber: cleanNum,
      invoiceNumber,
      totalAmount: input.totalAmount,
    };
  }

  const str = String(input || '').trim();
  if (str.startsWith('INV-')) {
    const cleanNum = str.replace(/^INV-/, '').replace(/^#/, '');
    return {
      orderId: cleanNum,
      orderNumber: cleanNum,
      invoiceNumber: str,
    };
  }

  // If it is a full UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    const fallbackNum = `KM-${str.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
    return {
      orderId: str,
      orderNumber: fallbackNum,
      invoiceNumber: `INV-${fallbackNum}`,
    };
  }

  const cleanNum = str.replace(/^#/, '');
  return {
    orderId: cleanNum,
    orderNumber: cleanNum,
    invoiceNumber: formatInvoiceNumber(cleanNum),
  };
};

export const sendOrderConfirmedNotification = async (
  orderOrId: string | OrderNotificationTarget,
  totalAmount?: number
) => {
  const { orderId, orderNumber, invoiceNumber, totalAmount: targetAmount } =
    resolveOrderInvoiceDetails(orderOrId);
  const resolvedTotal = targetAmount !== undefined ? targetAmount : totalAmount;

  return sendPushNotification({
    title: '🎉 Order Confirmed! — K-Mart',
    body: `Order #${orderNumber}${
      resolvedTotal ? ` for ₹${resolvedTotal.toLocaleString('en-IN')}` : ''
    } has been placed. We are preparing it for you!`,
    icon: '/logo.png',
    url: orderId ? `/orders/${orderId}` : '/profile',
    tag: `order-${orderId || orderNumber}`,
    status: 'CONFIRMED',
    orderId,
    orderNumber,
  });
};

export const sendDeliveryUpdateNotification = async (
  orderOrId: string | OrderNotificationTarget,
  statusText: string
) => {
  const { orderId, orderNumber, invoiceNumber } = resolveOrderInvoiceDetails(orderOrId);

  // Extract a clean status keyword from the statusText for icon purposes
  const rawStatus = statusText.toUpperCase().replace(/STATUS UPDATED TO\s*/i, '').trim();

  const STATUS_MESSAGES: Record<string, string> = {
    'PACKED':             '📦 Your order is packed and ready!',
    'OUT_FOR_DELIVERY':   '🚚 Your order is out for delivery!',
    'DELIVERED':          '✅ Your order has been delivered. Enjoy!',
    'PICKED_UP':          '✅ Order collected successfully!',
    'PREPARING':          '👨‍🍳 Your order is being prepared.',
    'CONFIRMED':          '✔️ Your order is confirmed by K-Mart.',
    'READY_FOR_PICKUP':   '🏪 Your order is ready for store pickup.',
    'DELIVERY_ASSIGNED':  '🛵 A delivery partner has been assigned.',
  };

  const friendlyMsg = STATUS_MESSAGES[rawStatus] || `Status: ${rawStatus.replace(/_/g, ' ')}`;

  return sendPushNotification({
    title: '📲 Order Update — K-Mart',
    body: `Order #${orderNumber}: ${friendlyMsg}`,
    icon: '/logo.png',
    url: orderId ? `/orders/${orderId}` : '/profile',
    tag: `delivery-${orderId || orderNumber}`,
    status: rawStatus,
    orderId,
    orderNumber,
  });
};

export const sendWelcomeNotification = async () => {
  return sendPushNotification({
    title: '🚚 Delivery Alerts Enabled! — K-Mart',
    body: 'You will now receive live updates when your orders are packed, dispatched and delivered.',
    icon: '/logo.png',
    url: '/profile',
    tag: 'welcome-delivery-alert',
    status: 'CONFIRMED',
  });
};
