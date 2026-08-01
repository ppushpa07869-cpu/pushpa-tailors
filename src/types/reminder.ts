export type ReminderPriority = 'reminder' | 'follow_up' | 'high_priority' | 'critical';

export interface PriorityBadgeInfo {
  level: ReminderPriority;
  label: string;
  labelTe: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  icon: string;
  daysRange: string;
}

export interface PendingOrderItem {
  id: string; // Firestore order document ID
  orderId: string; // Human readable Order ID e.g. PT-2026-0001
  orderType?: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  daysPending: number; // Days calculated from deliveryDate to Today
}

export interface PaymentReminder {
  id: string; // Unique ID (usually customerId or primary order ID)
  customerId: string;
  customerName: string;
  mobileNumber: string;
  totalPendingAmount: number;
  oldestDeliveryDate: string; // Earliest delivery date among customer's pending orders
  daysPending: number; // Maximum days pending calculated from delivery date
  priority: ReminderPriority;
  pendingOrders: PendingOrderItem[];
  isSnoozed?: boolean;
  snoozeUntil?: string;
}

export interface WeeklyPaymentSummary {
  pendingCustomersCount: number;
  totalPendingAmount: number;
  averagePendingDays: number;
}

export interface MonthlyPaymentSummary {
  outstandingAmount: number;
  pendingCustomersCount: number;
  breakdownByPriority: Record<ReminderPriority, { count: number; amount: number }>;
}

export interface DashboardPaymentSummary {
  todaysCollection: number;
  totalPendingAmount: number;
  pendingCustomersCount: number;
  collectionProgress: number; // 0 to 100 percentage
  totalCollected: number;
}
