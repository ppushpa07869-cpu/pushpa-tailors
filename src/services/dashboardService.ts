import { orderService } from './orderService';
import { paymentService } from './paymentService';
import type { Order } from '../types/order';

export interface DashboardData {
  stats: {
    todaysCollection: number;
    newOrdersCount: number;
    deliveriesTodayCount: number;
    pendingCollection: number;
  };
  collectionSummary: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
  };
  statusCounts: Record<string, number>;
  recentOrders: Order[];
  pendingPayments: Order[];
  todaysDeliveries: Order[];
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const [orders, payments] = await Promise.all([
      orderService.getOrders(),
      paymentService.getAllPayments(),
    ]);

    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);
    const currentMonth = todayStr.substring(0, 7);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // Stats
    let todaysCollection = 0;
    let thisWeekCollection = 0;
    let monthlyCollection = 0;
    let pendingCollection = 0;
    
    let newOrdersCount = 0;
    let deliveriesTodayCount = 0;

    const statusCounts: Record<string, number> = {
      'New': 0,
      'Cutting': 0,
      'Stitching': 0,
      'Ready': 0,
      'Delivered': 0,
      'Cancelled': 0
    };

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

    const recentOrders = [...orders].sort((a, b) => b.orderDate.localeCompare(a.orderDate)).slice(0, 10);
    const pendingPayments: Order[] = [];
    const todaysDeliveries: Order[] = [];

    orders.forEach(order => {
      const isDelivered = order.status === 'Delivered (డెలివరీ అయింది)';
      const isCancelled = order.status === 'Cancelled (రద్దు)';

      if (!isCancelled) {
        pendingCollection += order.remainingAmount || 0;
        
        if (order.status.startsWith('New')) newOrdersCount++;

        if (!isDelivered) {
          if (order.deliveryDate <= todayStr) {
            deliveriesTodayCount++;
            todaysDeliveries.push(order);
          }
        }
      }

      const statusKey = order.status.split(' (')[0];
      if (statusCounts[statusKey] !== undefined) {
        statusCounts[statusKey]++;
      }

      if (order.remainingAmount > 0 && !isCancelled) {
        pendingPayments.push(order);
      }
    });

    // Sort pending payments by remaining amount (desc) or delivery date
    pendingPayments.sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
    todaysDeliveries.sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));

    return {
      stats: {
        todaysCollection,
        newOrdersCount,
        deliveriesTodayCount,
        pendingCollection
      },
      collectionSummary: {
        today: todaysCollection,
        thisWeek: thisWeekCollection,
        thisMonth: monthlyCollection,
        pending: pendingCollection
      },
      statusCounts,
      recentOrders,
      pendingPayments: pendingPayments.slice(0, 10), // Take top 10 for dashboard
      todaysDeliveries: todaysDeliveries.slice(0, 10)
    };
  }
};
