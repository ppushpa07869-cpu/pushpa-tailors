import type { Order } from '../types/order';
import type { Payment } from '../types/payment';
import type { 
  ReminderPriority, 
  PriorityBadgeInfo, 
  PaymentReminder, 
  PendingOrderItem,
  WeeklyPaymentSummary, 
  MonthlyPaymentSummary, 
  DashboardPaymentSummary 
} from '../types/reminder';

const SNOOZE_STORAGE_KEY = 'pushpa_payment_reminder_snoozes';

export const PRIORITY_BADGES: Record<ReminderPriority, PriorityBadgeInfo> = {
  reminder: {
    level: 'reminder',
    label: 'Reminder',
    labelTe: 'రిమైండర్',
    badgeBg: 'bg-green-100 text-green-800 border-green-200',
    badgeText: 'text-green-700',
    borderColor: 'border-green-300',
    icon: '🟢',
    daysRange: '0–7 Days',
  },
  follow_up: {
    level: 'follow_up',
    label: 'Follow Up',
    labelTe: 'ఫాలో అప్',
    badgeBg: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    badgeText: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    icon: '🟡',
    daysRange: '8–15 Days',
  },
  high_priority: {
    level: 'high_priority',
    label: 'High Priority',
    labelTe: 'హై ప్రయారిటీ',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    badgeText: 'text-orange-800',
    borderColor: 'border-orange-300',
    icon: '🟠',
    daysRange: '16–30 Days',
  },
  critical: {
    level: 'critical',
    label: 'Critical',
    labelTe: 'క్ర критиకల్ (అత్యవసరం)',
    badgeBg: 'bg-red-100 text-red-800 border-red-200',
    badgeText: 'text-red-700',
    borderColor: 'border-red-300',
    icon: '🔴',
    daysRange: '> 30 Days',
  },
};

/**
 * Calculates pending days based on the Delivery Date.
 * Example: Delivery Date: 15 Aug, Today: 20 Aug => Days Pending: 5
 */
export const calculateDaysPending = (deliveryDateStr: string, referenceDateStr?: string): number => {
  if (!deliveryDateStr) return 0;
  
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  refDate.setHours(0, 0, 0, 0);

  const deliveryDate = new Date(deliveryDateStr);
  deliveryDate.setHours(0, 0, 0, 0);

  if (isNaN(deliveryDate.getTime())) return 0;

  const diffTime = refDate.getTime() - deliveryDate.getTime();
  if (diffTime <= 0) return 0;

  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Maps days pending to Priority Level
 */
export const getPriorityLevel = (daysPending: number): ReminderPriority => {
  if (daysPending <= 7) return 'reminder';
  if (daysPending <= 15) return 'follow_up';
  if (daysPending <= 30) return 'high_priority';
  return 'critical';
};

/**
 * Get Snooze state from LocalStorage
 */
export const getSnoozedReminders = (): Record<string, string> => {
  try {
    const data = localStorage.getItem(SNOOZE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to read snooze storage', e);
    return {};
  }
};

/**
 * Check if a reminder ID is currently snoozed
 */
export const isReminderSnoozed = (reminderId: string): boolean => {
  const snoozes = getSnoozedReminders();
  const snoozeUntil = snoozes[reminderId];
  if (!snoozeUntil) return false;

  const todayStr = new Date().toISOString().split('T')[0];
  if (snoozeUntil > todayStr) {
    return true;
  }
  return false;
};

/**
 * Snooze a reminder for 1, 3, or 7 days
 */
export const snoozeReminder = (reminderId: string, days: 1 | 3 | 7): void => {
  try {
    const snoozes = getSnoozedReminders();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    snoozes[reminderId] = targetDate.toISOString().split('T')[0];
    localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(snoozes));
  } catch (e) {
    console.error('Failed to save snooze status', e);
  }
};

/**
 * Clear snooze status for a reminder
 */
export const clearSnooze = (reminderId: string): void => {
  try {
    const snoozes = getSnoozedReminders();
    delete snoozes[reminderId];
    localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(snoozes));
  } catch (e) {
    console.error('Failed to clear snooze status', e);
  }
};

/**
 * Generates pre-filled professional WhatsApp message in English or Telugu
 */
export const generateWhatsAppUrl = (
  mobileNumber: string,
  customerName: string,
  remainingAmount: number,
  language: 'te' | 'en' = 'te'
): string => {
  const cleanPhone = mobileNumber.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  let text = '';
  if (language === 'te') {
    text = `నమస్కారం ${customerName},\n\nమీ ఆర్డర్ సిద్ధంగా ఉంది.\n\nమిగిలిన చెల్లింపు ₹${remainingAmount}\n\nదయచేసి PUSHPA TAILORS కి వచ్చి మీ ఆర్డర్ తీసుకెళ్లండి.\n\nధన్యవాదాలు.`;
  } else {
    text = `Hello ${customerName},\n\nYour order is ready for collection.\n\nPending Amount: ₹${remainingAmount}\n\nPlease visit PUSHPA TAILORS at your convenience.\n\nThank you.`;
  }

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
};

export const paymentReminderService = {
  /**
   * Process active orders and generate PaymentReminders
   */
  getPaymentReminders(orders: Order[], includeSnoozed = false): PaymentReminder[] {
    const snoozes = getSnoozedReminders();
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter orders with remaining balances
    const pendingOrders = orders.filter(o => o.remainingAmount > 0);

    // Group pending orders by customerId
    const customerMap = new Map<string, Order[]>();
    pendingOrders.forEach(order => {
      const existing = customerMap.get(order.customerId) || [];
      existing.push(order);
      customerMap.set(order.customerId, existing);
    });

    const reminders: PaymentReminder[] = [];

    customerMap.forEach((custOrders, customerId) => {
      const firstOrder = custOrders[0];
      const customerName = firstOrder.customerName || 'Customer';
      const mobileNumber = firstOrder.mobileNumber || '';

      let totalPendingAmount = 0;
      let oldestDeliveryDate = custOrders[0].deliveryDate || todayStr;
      let maxDaysPending = 0;

      const orderItems: PendingOrderItem[] = custOrders.map(o => {
        totalPendingAmount += o.remainingAmount;
        const days = calculateDaysPending(o.deliveryDate);
        if (days > maxDaysPending) {
          maxDaysPending = days;
        }
        if (o.deliveryDate && o.deliveryDate < oldestDeliveryDate) {
          oldestDeliveryDate = o.deliveryDate;
        }

        return {
          id: o.id,
          orderId: o.orderId,
          orderType: o.orderType,
          orderDate: o.orderDate,
          deliveryDate: o.deliveryDate,
          totalAmount: o.totalAmount,
          paidAmount: o.paidAmount,
          remainingAmount: o.remainingAmount,
          status: o.status,
          daysPending: days,
        };
      });

      const reminderId = customerId;
      const snoozeUntil = snoozes[reminderId] || snoozes[custOrders[0].id];
      const isSnoozed = !!(snoozeUntil && snoozeUntil > todayStr);

      if (!isSnoozed || includeSnoozed) {
        const priority = getPriorityLevel(maxDaysPending);

        reminders.push({
          id: reminderId,
          customerId,
          customerName,
          mobileNumber,
          totalPendingAmount,
          oldestDeliveryDate,
          daysPending: maxDaysPending,
          priority,
          pendingOrders: orderItems,
          isSnoozed,
          snoozeUntil,
        });
      }
    });

    // Sort reminders by daysPending descending (highest pending days first)
    reminders.sort((a, b) => b.daysPending - a.daysPending);

    return reminders;
  },

  /**
   * Generates Weekly Summary (for Mondays or weekly dashboard overview)
   */
  getWeeklySummary(reminders: PaymentReminder[]): WeeklyPaymentSummary {
    const activeReminders = reminders.filter(r => !r.isSnoozed);
    const count = activeReminders.length;
    if (count === 0) {
      return {
        pendingCustomersCount: 0,
        totalPendingAmount: 0,
        averagePendingDays: 0,
      };
    }

    const totalPendingAmount = activeReminders.reduce((sum, r) => sum + r.totalPendingAmount, 0);
    const totalDays = activeReminders.reduce((sum, r) => sum + r.daysPending, 0);
    const averagePendingDays = Math.round(totalDays / count);

    return {
      pendingCustomersCount: count,
      totalPendingAmount,
      averagePendingDays,
    };
  },

  /**
   * Generates Monthly Summary (for 1st of month or monthly breakdown)
   */
  getMonthlySummary(reminders: PaymentReminder[]): MonthlyPaymentSummary {
    const activeReminders = reminders.filter(r => !r.isSnoozed);
    const outstandingAmount = activeReminders.reduce((sum, r) => sum + r.totalPendingAmount, 0);

    const breakdown: Record<ReminderPriority, { count: number; amount: number }> = {
      reminder: { count: 0, amount: 0 },
      follow_up: { count: 0, amount: 0 },
      high_priority: { count: 0, amount: 0 },
      critical: { count: 0, amount: 0 },
    };

    activeReminders.forEach(r => {
      breakdown[r.priority].count += 1;
      breakdown[r.priority].amount += r.totalPendingAmount;
    });

    return {
      outstandingAmount,
      pendingCustomersCount: activeReminders.length,
      breakdownByPriority: breakdown,
    };
  },

  /**
   * Generates Dashboard Payment Summary (Today's collection, Pending Amount, Collection Progress)
   */
  getDashboardPaymentSummary(payments: Payment[], orders: Order[]): DashboardPaymentSummary {
    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate today's collection
    let todaysCollection = 0;
    let totalCollected = 0;

    payments.forEach(p => {
      if (p.paymentType !== 'Refund') {
        totalCollected += p.amountPaid;
        if (p.paymentDate === todayStr) {
          todaysCollection += p.amountPaid;
        }
      } else {
        totalCollected -= p.amountPaid;
        if (p.paymentDate === todayStr) {
          todaysCollection -= p.amountPaid;
        }
      }
    });

    // Calculate total pending amount & pending customers
    let totalPendingAmount = 0;
    const pendingCustomerSet = new Set<string>();

    orders.forEach(o => {
      if (o.remainingAmount > 0) {
        totalPendingAmount += o.remainingAmount;
        pendingCustomerSet.add(o.customerId);
      }
    });

    const pendingCustomersCount = pendingCustomerSet.size;
    const denominator = totalCollected + totalPendingAmount;
    const collectionProgress = denominator > 0 ? Math.round((totalCollected / denominator) * 100) : 100;

    return {
      todaysCollection,
      totalPendingAmount,
      pendingCustomersCount,
      collectionProgress,
      totalCollected,
    };
  }
};
