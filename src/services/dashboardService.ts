import { orderService } from './orderService';
import { customerService } from './customerService';
import { paymentService } from './paymentService';
import type { Order } from '../types/order';
import type { Payment } from '../types/payment';

export interface AppNotification {
  id: string;
  type: 'overdue' | 'today' | 'tomorrow' | 'pending_payment' | 'ready';
  customerId: string;
  orderId: string;
  customerName: string;
  mobileNumber: string;
  deliveryDate: string;
  remainingAmount: number;
  message: string;
  icon: string;
  priority: number; // lower = higher priority
}

export interface DashboardData {
  stats: {
    totalCustomers: number;
    activeOrders: number;
    readyOrders: number;
    pendingPayments: number;
  };
  collectionSummary: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
  };
  notifications: AppNotification[];
  recentOrders: Order[];
  pendingPaymentOrders: Order[];
  allOrders: Order[];
  allPayments: Payment[];
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const [orders, customers, payments] = await Promise.all([
      orderService.getOrders(),
      customerService.getCustomers(),
      paymentService.getAllPayments(),
    ]);

    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);
    const currentMonth = todayStr.substring(0, 7);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    // Collection stats from payments
    let todaysCollection = 0;
    let thisWeekCollection = 0;
    let monthlyCollection = 0;
    let pendingCollection = 0;

    payments.forEach(payment => {
      if (payment.paymentType !== 'Refund') {
        if (payment.paymentDate === todayStr) todaysCollection += payment.amountPaid;
        if (payment.paymentDate >= weekAgoStr && payment.paymentDate <= todayStr) thisWeekCollection += payment.amountPaid;
        if (payment.paymentDate.startsWith(currentMonth)) monthlyCollection += payment.amountPaid;
      } else {
        if (payment.paymentDate === todayStr) todaysCollection -= payment.amountPaid;
        if (payment.paymentDate >= weekAgoStr && payment.paymentDate <= todayStr) thisWeekCollection -= payment.amountPaid;
        if (payment.paymentDate.startsWith(currentMonth)) monthlyCollection -= payment.amountPaid;
      }
    });

    // Dashboard stats
    let activeOrders = 0;
    let readyOrders = 0;
    let pendingPaymentsCount = 0;
    const pendingPaymentOrders: Order[] = [];
    const notifications: AppNotification[] = [];

    orders.forEach(order => {
      const isDelivered = order.status === 'Delivered';

      if (!isDelivered) {
        activeOrders++;
        if (order.status === 'Ready') readyOrders++;
      }

      if (order.remainingAmount > 0 && !isDelivered) {
        pendingPaymentsCount++;
        pendingCollection += order.remainingAmount;
        pendingPaymentOrders.push(order);
      }

      // Generate notifications
      if (!isDelivered) {
        const dDate = order.deliveryDate;

        if (dDate < todayStr) {
          // Overdue
          notifications.push({
            id: `overdue-${order.id}`,
            type: 'overdue',
            customerId: order.customerId,
            orderId: order.id,
            customerName: order.customerName,
            mobileNumber: order.mobileNumber,
            deliveryDate: dDate,
            remainingAmount: order.remainingAmount,
            message: `${order.customerName} – Overdue delivery`,
            icon: '🔴',
            priority: 1,
          });
        } else if (dDate === todayStr) {
          // Due today
          notifications.push({
            id: `today-${order.id}`,
            type: 'today',
            customerId: order.customerId,
            orderId: order.id,
            customerName: order.customerName,
            mobileNumber: order.mobileNumber,
            deliveryDate: dDate,
            remainingAmount: order.remainingAmount,
            message: `${order.customerName} – Delivery today`,
            icon: '🟠',
            priority: 2,
          });
        } else if (dDate === tomorrowStr) {
          // Due tomorrow
          notifications.push({
            id: `tomorrow-${order.id}`,
            type: 'tomorrow',
            customerId: order.customerId,
            orderId: order.id,
            customerName: order.customerName,
            mobileNumber: order.mobileNumber,
            deliveryDate: dDate,
            remainingAmount: order.remainingAmount,
            message: `${order.customerName} – Delivery tomorrow`,
            icon: '🟡',
            priority: 3,
          });
        }

        if (order.status === 'Ready') {
          // Ready but not delivered
          notifications.push({
            id: `ready-${order.id}`,
            type: 'ready',
            customerId: order.customerId,
            orderId: order.id,
            customerName: order.customerName,
            mobileNumber: order.mobileNumber,
            deliveryDate: dDate,
            remainingAmount: order.remainingAmount,
            message: `${order.customerName} – Order ready for pickup`,
            icon: '🟢',
            priority: 4,
          });
        }
      }

      if (order.remainingAmount > 0) {
        // Pending payment notification (for delivered orders too)
        if (isDelivered) {
          notifications.push({
            id: `payment-${order.id}`,
            type: 'pending_payment',
            customerId: order.customerId,
            orderId: order.id,
            customerName: order.customerName,
            mobileNumber: order.mobileNumber,
            deliveryDate: order.deliveryDate,
            remainingAmount: order.remainingAmount,
            message: `${order.customerName} – ₹${order.remainingAmount} pending`,
            icon: '💰',
            priority: 2,
          });
        }
      }
    });

    // Sort notifications by priority then by delivery date
    notifications.sort((a, b) => a.priority - b.priority || a.deliveryDate.localeCompare(b.deliveryDate));

    const recentOrders = [...orders].sort((a, b) => b.orderDate.localeCompare(a.orderDate)).slice(0, 10);
    pendingPaymentOrders.sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));

    return {
      stats: {
        totalCustomers: customers.length,
        activeOrders,
        readyOrders,
        pendingPayments: pendingPaymentsCount,
      },
      collectionSummary: {
        today: todaysCollection,
        thisWeek: thisWeekCollection,
        thisMonth: monthlyCollection,
        pending: pendingCollection,
      },
      notifications: notifications.slice(0, 20),
      recentOrders,
      pendingPaymentOrders: pendingPaymentOrders.slice(0, 10),
      allOrders: orders,
      allPayments: payments,
    };
  }
};
