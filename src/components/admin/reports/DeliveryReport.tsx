import { useState, useEffect } from 'react';
import { orderService } from '../../../services/orderService';
import { isDateInRange } from '../../../utils/dateUtils';
import { exportToExcel, exportToPDF, printReport } from '../../../utils/exportUtils';
import { getStatusColor } from '../../../utils/orderUtils';
import type { Order } from '../../../types/order';

interface DeliveryReportProps {
  searchTerm: string;
  dateFilter: string;
  startDate: string;
  endDate: string;
  statusFilter: string;
  exportTrigger: { type: 'excel' | 'pdf' | 'print', timestamp: number } | null;
}

export default function DeliveryReport({ 
  searchTerm, dateFilter, startDate, endDate, statusFilter, exportTrigger 
}: DeliveryReportProps) {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await orderService.getOrders();
        setData(orders);
      } catch (error) {
        console.error("Error fetching delivery report data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter(item => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.orderId.toLowerCase().includes(searchLower) ||
      item.customerName.toLowerCase().includes(searchLower) ||
      item.mobileNumber.includes(searchLower);

    if (!matchesSearch) return false;

    // Date Filter (by delivery date)
    if (!isDateInRange(item.deliveryDate, dateFilter, startDate, endDate)) {
      return false;
    }

    // Delivery Status Filter
    if (statusFilter !== 'all') {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayDate = new Date(todayStr);
      const tomorrowDate = new Date(todayDate);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

      const isDelivered = item.status === 'Delivered';

      if (statusFilter === 'due_today') {
        if (item.deliveryDate !== todayStr || isDelivered) return false;
      } else if (statusFilter === 'due_tomorrow') {
        if (item.deliveryDate !== tomorrowStr || isDelivered) return false;
      } else if (statusFilter === 'overdue') {
        if (item.deliveryDate >= todayStr || isDelivered) return false;
      } else if (statusFilter === 'delivered') {
        if (!isDelivered) return false;
      }
    }

    return true;
  });

  useEffect(() => {
    if (!exportTrigger) return;
    
    if (exportTrigger.type === 'print') {
      printReport();
      return;
    }

    const headers = ['Order ID', 'Customer', 'Mobile', 'Order Date', 'Delivery Date', 'Status', 'Payment Status'];
    const exportData = filteredData.map(o => [
      o.orderId,
      o.customerName,
      o.mobileNumber,
      new Date(o.orderDate).toLocaleDateString(),
      new Date(o.deliveryDate).toLocaleDateString(),
      o.status,
      o.paymentStatus
    ]);

    if (exportTrigger.type === 'excel') {
      const excelReadyData = filteredData.map(o => ({
        'Order ID': o.orderId,
        'Customer': o.customerName,
        'Mobile': o.mobileNumber,
        'Order Date': new Date(o.orderDate).toLocaleDateString(),
        'Delivery Date': new Date(o.deliveryDate).toLocaleDateString(),
        'Status': o.status,
        'Payment Status': o.paymentStatus
      }));
      exportToExcel(excelReadyData, 'Delivery_Report');
    } else if (exportTrigger.type === 'pdf') {
      exportToPDF(headers, exportData, 'Delivery_Report', 'Delivery Report');
    }
  }, [exportTrigger]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading Delivery Report...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-white uppercase bg-black">
          <tr>
            <th className="px-6 py-4 font-medium tracking-wider">Order ID</th>
            <th className="px-6 py-4 font-medium tracking-wider">Customer</th>
            <th className="px-6 py-4 font-medium tracking-wider">Dates</th>
            <th className="px-6 py-4 font-medium tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No records found.</td>
            </tr>
          ) : (
            filteredData.map(o => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isOverdue = o.deliveryDate < todayStr && o.status !== 'Delivered';
              
              return (
                <tr key={o.id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50/50' : ''}`}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {o.orderId}
                    {isOverdue && <div className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-wider">Overdue</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{o.customerName}</div>
                    <div className="text-gray-500 text-xs">{o.mobileNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-500 text-xs">Ord: {new Date(o.orderDate).toLocaleDateString()}</div>
                    <div className={`text-xs font-bold mt-1 ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      Del: {new Date(o.deliveryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
