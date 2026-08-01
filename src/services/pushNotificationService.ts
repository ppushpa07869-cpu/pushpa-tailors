import type { 
  NotificationType, 
  PushNotificationPayload, 
  NotificationPermissionStatus,
  PushNotificationConfig 
} from '../types/pwaNotification';
import type { PaymentReminder } from '../types/reminder';

const CONFIG_STORAGE_KEY = 'pushpa_pwa_notification_config';

export const pushNotificationService = {
  /**
   * Check if browser supports Web Notifications and Service Workers
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  },

  /**
   * Get current browser notification permission state
   */
  getPermissionState(): NotificationPermissionStatus {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as NotificationPermissionStatus;
  },

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermissionStatus> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission as NotificationPermissionStatus;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  },

  /**
   * Register service worker for push notification handling (architecture stub)
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return null;
    try {
      const registration = await navigator.serviceWorker.register('/sw-push.js', {
        scope: '/',
      });
      console.log('Push Notification Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.warn('Service Worker registration skipped or unavailable:', error);
      return null;
    }
  },

  /**
   * Get user notification preferences
   */
  getConfig(): PushNotificationConfig {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading notification config:', e);
    }
    return {
      enableWeeklyReminders: true,
      enableMonthlyReminders: true,
      enableCriticalAlerts: true,
    };
  },

  /**
   * Save user notification preferences
   */
  saveConfig(config: PushNotificationConfig): void {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving notification config:', e);
    }
  },

  /**
   * Send a local notification (for testing & architecture verification)
   */
  async sendLocalNotification(payload: PushNotificationPayload): Promise<boolean> {
    if (this.getPermissionState() !== 'granted') {
      console.log('[PWA Push Prepared] Notification skipped (Permission not granted):', payload);
      return false;
    }

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/favicon.ico',
            badge: payload.badge || '/favicon.ico',
            tag: payload.tag || payload.id,
            data: payload.data,
          });
          return true;
        }
      }

      // Fallback to standard Notification API
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        tag: payload.tag || payload.id,
      });
      return true;
    } catch (error) {
      console.error('Error triggering local notification:', error);
      return false;
    }
  },

  /**
   * Generates Notification Payload for specific event types
   */
  createPayload(
    type: NotificationType,
    data: {
      customerName?: string;
      pendingAmount?: number;
      count?: number;
      daysPending?: number;
      customerId?: string;
      orderId?: string;
    }
  ): PushNotificationPayload {
    const id = `notif-${Date.now()}`;

    switch (type) {
      case 'weekly_reminder':
        return {
          id,
          type: 'weekly_reminder',
          title: '🗓️ Pushpa Tailors – Weekly Payment Summary',
          body: `You have ${data.count || 0} customers with ₹${data.pendingAmount || 0} total pending payments this week.`,
          tag: 'weekly_summary',
          data: { url: '/admin/dashboard?tab=reminders' },
        };

      case 'monthly_reminder':
        return {
          id,
          type: 'monthly_reminder',
          title: '📊 Pushpa Tailors – Monthly Outstanding Summary',
          body: `Monthly outstanding balance is ₹${data.pendingAmount || 0} across ${data.count || 0} customers.`,
          tag: 'monthly_summary',
          data: { url: '/admin/dashboard?tab=reminders' },
        };

      case 'pending_payment':
        return {
          id,
          type: 'pending_payment',
          title: '💰 Payment Reminder',
          body: `${data.customerName || 'Customer'} has a pending balance of ₹${data.pendingAmount || 0}.`,
          tag: `payment-${data.customerId}`,
          data: { customerId: data.customerId, orderId: data.orderId, pendingAmount: data.pendingAmount },
        };

      case 'critical_pending_payment':
        return {
          id,
          type: 'critical_pending_payment',
          title: '🔴 Critical Overdue Payment!',
          body: `URGENT: ${data.customerName || 'Customer'} payment (₹${data.pendingAmount || 0}) is ${data.daysPending || 30}+ days overdue.`,
          tag: `critical-${data.customerId}`,
          data: { customerId: data.customerId, orderId: data.orderId, pendingAmount: data.pendingAmount },
        };

      default:
        return {
          id,
          type,
          title: 'Notification – Pushpa Tailors',
          body: 'You have a new payment update.',
        };
    }
  },

  /**
   * Architecture trigger helper for generating notification from a PaymentReminder object
   */
  dispatchReminderNotification(reminder: PaymentReminder): Promise<boolean> {
    const isCritical = reminder.priority === 'critical';
    const type: NotificationType = isCritical ? 'critical_pending_payment' : 'pending_payment';
    
    const payload = this.createPayload(type, {
      customerName: reminder.customerName,
      pendingAmount: reminder.totalPendingAmount,
      daysPending: reminder.daysPending,
      customerId: reminder.customerId,
      orderId: reminder.pendingOrders[0]?.id,
    });

    return this.sendLocalNotification(payload);
  }
};
