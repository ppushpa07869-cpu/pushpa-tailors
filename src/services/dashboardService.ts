import { orderService } from './orderService';
import { paymentService } from './paymentService';
import { customerService } from './customerService';

export interface DashboardData {
  stats: {
    totalCustomers: number;
    totalOrders: number;
    todaysCollection: number;
    monthlyCollection: number;
    pendingCollection: number;
    ordersDueToday: number;
    overdueOrders: number;
    fullyPaidOrders: number;
    ordersInProgress: number; // New, Cutting, Stitching
    monthlyRevenue: number;
  };
  charts: {
    monthlyRevenueData: { month: string; revenue: number }[];
    ordersByStatusData: { name: string; value: number }[];
    paymentMethodsData: { name: string; value: number }[];
    ordersPerMonthData: { month: string; orders: number }[];
  };
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const [orders, payments, customers] = await Promise.all([
      orderService.getOrders(),
      paymentService.getAllPayments(),
      customerService.getCustomers(),
    ]);

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    // Initialize stats
    let todaysCollection = 0;
    let monthlyCollection = 0;
    let pendingCollection = 0;
    let ordersDueToday = 0;
    let overdueOrders = 0;
    let fullyPaidOrders = 0;
    let ordersInProgress = 0;
    
    // Chart aggregations
    const monthlyRevMap: Record<string, number> = {};
    const ordersPerMonthMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};
    const paymentMethodMap: Record<string, number> = {};

    payments.forEach(payment => {
      if (payment.paymentType !== 'Refund') {
        if (payment.paymentDate === today) {
          todaysCollection += payment.amountPaid;
        }
        if (payment.paymentDate.startsWith(currentMonth)) {
          monthlyCollection += payment.amountPaid;
        }
        
        const monthKey = payment.paymentDate.substring(0, 7);
        monthlyRevMap[monthKey] = (monthlyRevMap[monthKey] || 0) + payment.amountPaid;
        
        const method = payment.paymentMethod.split(' (')[0];
        paymentMethodMap[method] = (paymentMethodMap[method] || 0) + payment.amountPaid;
      } else {
        // Handle refunds by subtracting
        const monthKey = payment.paymentDate.substring(0, 7);
        monthlyRevMap[monthKey] = (monthlyRevMap[monthKey] || 0) - payment.amountPaid;
        const method = payment.paymentMethod.split(' (')[0];
        paymentMethodMap[method] = (paymentMethodMap[method] || 0) - payment.amountPaid;
      }
    });

    orders.forEach(order => {
      if (order.status !== 'Cancelled (రద్దు)') {
        pendingCollection += order.remainingAmount || 0;
        
        if (order.paymentStatus === 'Fully Paid') {
          fullyPaidOrders++;
        }

        if (order.deliveryDate === today && order.status !== 'Delivered (డెలివరీ అయింది)') {
          ordersDueToday++;
        }
        
        if (order.deliveryDate < today && order.status !== 'Delivered (డెలివరీ అయింది)') {
          overdueOrders++;
        }

        if (['New (కొత్తది)', 'Cutting (కట్టింగ్)', 'Stitching (కుట్టడం)'].includes(order.status)) {
          ordersInProgress++;
        }
      }

      const statusKey = order.status.split(' (')[0];
      statusMap[statusKey] = (statusMap[statusKey] || 0) + 1;

      const monthKey = order.orderDate.substring(0, 7);
      ordersPerMonthMap[monthKey] = (ordersPerMonthMap[monthKey] || 0) + 1;
    });

    // Format chart data (sort by month key ascending)
    const sortedMonths = Array.from(new Set([...Object.keys(monthlyRevMap), ...Object.keys(ordersPerMonthMap)])).sort();
    
    // Take last 6 months for trend charts
    const last6Months = sortedMonths.slice(-6);

    const formatMonth = (yyyyMM: string) => {
      const d = new Date(`${yyyyMM}-01`);
      return d.toLocaleString('default', { month: 'short', year: '2-digit' });
    };

    return {
      stats: {
        totalCustomers: customers.length,
        totalOrders: orders.length,
        todaysCollection,
        monthlyCollection,
        pendingCollection,
        ordersDueToday,
        overdueOrders,
        fullyPaidOrders,
        ordersInProgress,
        monthlyRevenue: monthlyRevMap[currentMonth] || 0
      },
      charts: {
        monthlyRevenueData: last6Months.map(m => ({ month: formatMonth(m), revenue: monthlyRevMap[m] || 0 })),
        ordersPerMonthData: last6Months.map(m => ({ month: formatMonth(m), orders: ordersPerMonthMap[m] || 0 })),
        ordersByStatusData: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
        paymentMethodsData: Object.entries(paymentMethodMap).filter(([_, val]) => val > 0).map(([name, value]) => ({ name, value }))
      }
    };
  }
};
