export type NotificationType = 
  | 'weekly_reminder'
  | 'monthly_reminder'
  | 'pending_payment'
  | 'critical_pending_payment';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export interface PushNotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    customerId?: string;
    orderId?: string;
    pendingAmount?: number;
    deliveryDate?: string;
    daysPending?: number;
  };
}

export interface PushNotificationConfig {
  enableWeeklyReminders: boolean;
  enableMonthlyReminders: boolean;
  enableCriticalAlerts: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string;   // HH:mm
}
