import { useState, useEffect } from 'react';
import { orderService } from '../../../services/orderService';
import { isDateInRange } from '../../../utils/dateUtils';
import { exportToExcel, exportToPDF, printReport } from '../../../utils/exportUtils';
import { getStatusColor } from '../../../utils/orderUtils';
import type { Order } from '../../../types/order';

interface OrderReportProps {
  searchTerm: string;
  dateFilter: string;
  startDate: string;
  endDate: string;
  statusFilter: string;
  paymentStatusFilter: string;
  exportTrigger: { type: 'excel' | 'pdf' | 'print', timestamp: number } | null;
}

export default function OrderReport({ 
  searchTerm, dateFilter, startDate, endDate, statusFilter, paymentStatusFilter, exportTrigger 
}: OrderReportProps) {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await orderService.getOrders();
        setData(orders);
      } catch (error) {
        console.error("Error fetching order report data", error);
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

    // Date Filter (by order date)
    if (!isDateInRange(item.orderDate, dateFilter, startDate, endDate)) {
      return false;
    }

    // Status Filter
    if (statusFilter !== 'all') {
      const isMatch = item.status.toLowerCase().includes(statusFilter.toLowerCase());
      if (!isMatch) return false;
    }

    // Payment Status Filter
    if (paymentStatusFilter !== 'all' && item.paymentStatus !== paymentStatusFilter) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    if (!exportTrigger) return;
    
    if (exportTrigger.type === 'print') {
      printReport();
      return;
    }

    const headers = ['Order ID', 'Customer', 'Mobile', 'Order Date', 'Delivery Date', 'Status', 'Payment Status', 'Total (₹)', 'Paid (₹)', 'Remaining (₹)'];
    const exportData = filteredData.map(o => [
      o.orderId,
      o.customerName,
      o.mobileNumber,
      new Date(o.orderDate).toLocaleDateString(),
      new Date(o.deliveryDate).toLocaleDateString(),
      o.status,
      o.paymentStatus,
      o.totalAmount,
      o.paidAmount,
      o.remainingAmount
    ]);

    if (exportTrigger.type === 'excel') {
      const excelReadyData = filteredData.map(o => ({
        'Order ID': o.orderId,
        'Customer': o.customerName,
        'Mobile': o.mobileNumber,
        'Order Date': new Date(o.orderDate).toLocaleDateString(),
        'Delivery Date': new Date(o.deliveryDate).toLocaleDateString(),
        'Status': o.status,
        'Payment Status': o.paymentStatus,
        'Total Amount': o.totalAmount,
        'Paid Amount': o.paidAmount,
        'Remaining': o.remainingAmount
      }));
      exportToExcel(excelReadyData, 'Order_Report');
    } else if (exportTrigger.type === 'pdf') {
      exportToPDF(headers, exportData, 'Order_Report', 'Order Report');
    }
  }, [exportTrigger]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading Order Report...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-white uppercase bg-black">
          <tr>
            <th className="px-6 py-4 font-medium tracking-wider">Order ID</th>
            <th className="px-6 py-4 font-medium tracking-wider">Customer</th>
            <th className="px-6 py-4 font-medium tracking-wider">Dates</th>
            <th className="px-6 py-4 font-medium tracking-wider">Statuses</th>
            <th className="px-6 py-4 font-medium tracking-wider">Financials</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No records found.</td>
            </tr>
          ) : (
            filteredData.map(o => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{o.orderId}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{o.customerName}</div>
                  <div className="text-gray-500 text-xs">{o.mobileNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900 text-xs">Ord: {new Date(o.orderDate).toLocaleDateString()}</div>
                  <div className="text-gray-600 text-xs font-medium mt-1">Del: {new Date(o.deliveryDate).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 space-y-1">
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                      o.paymentStatus === 'Fully Paid' ? 'bg-green-100 text-green-800' : 
                      o.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {o.paymentStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-500 flex justify-between"><span>Tot:</span> <span className="font-medium text-gray-900">₹ {o.totalAmount}</span></div>
                  <div className="text-xs text-gray-500 flex justify-between"><span>Paid:</span> <span className="font-medium text-green-600">₹ {o.paidAmount}</span></div>
                  <div className="text-xs text-gray-500 flex justify-between pt-1 border-t border-gray-100 mt-1">
                    <span>Rem:</span> <span className="font-medium text-orange-600">₹ {o.remainingAmount}</span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
