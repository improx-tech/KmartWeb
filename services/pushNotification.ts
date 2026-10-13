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

export const sendPushNotification = async (payload: PushNotificationPayload): Promise<boolean> => {
  if (!isPushSupported()) return false;

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

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
    body: `Invoice #${invoiceNumber} (Order #${orderNumber})${
      resolvedTotal ? ` for ₹${resolvedTotal.toLocaleString('en-IN')}` : ''
    } has been placed. We are preparing it for delivery!`,
    icon: '/logo.png',
    url: orderId ? `/orders/${orderId}` : '/profile',
    tag: `order-${orderId || orderNumber}`,
  });
};

export const sendDeliveryUpdateNotification = async (
  orderOrId: string | OrderNotificationTarget,
  statusText: string
) => {
  const { orderId, orderNumber, invoiceNumber } = resolveOrderInvoiceDetails(orderOrId);

  return sendPushNotification({
    title: '🚚 Delivery Alert — K-Mart',
    body: `Invoice #${invoiceNumber} (Order #${orderNumber}): ${statusText}`,
    icon: '/logo.png',
    url: orderId ? `/orders/${orderId}` : '/profile',
    tag: `delivery-${orderId || orderNumber}`,
  });
};

export const sendWelcomeNotification = async () => {
  return sendPushNotification({
    title: '🚚 Delivery Alerts Enabled! — K-Mart',
    body: 'You will receive live updates when your orders are dispatched and out for delivery.',
    icon: '/logo.png',
    url: '/profile',
    tag: 'welcome-delivery-alert',
  });
};
