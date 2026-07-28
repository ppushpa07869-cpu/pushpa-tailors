import { useState, useEffect } from 'react';
import { customerService } from '../../../services/customerService';
import { orderService } from '../../../services/orderService';
import { isDateInRange } from '../../../utils/dateUtils';
import { exportToExcel, exportToPDF, printReport } from '../../../utils/exportUtils';
import type { Customer } from '../../../types/customer';


interface CustomerReportProps {
  searchTerm: string;
  dateFilter: string;
  startDate: string;
  endDate: string;
  exportTrigger: { type: 'excel' | 'pdf' | 'print', timestamp: number } | null;
}

interface CustomerStats extends Customer {
  totalOrders: number;
  totalPaid: number;
  pendingAmount: number;
  lastOrderDate: string;
}

export default function CustomerReport({ searchTerm, dateFilter, startDate, endDate, exportTrigger }: CustomerReportProps) {
  const [data, setData] = useState<CustomerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customers, orders] = await Promise.all([
          customerService.getCustomers(),
          orderService.getOrders()
        ]);

        const statsMap: Record<string, CustomerStats> = {};

        customers.forEach((c: Customer) => {
          if (c.id) {
            statsMap[c.id] = {
              ...c,
              totalOrders: 0,
              totalPaid: 0,
              pendingAmount: 0,
              lastOrderDate: 'N/A'
            };
          }
        });

        orders.forEach((o: any) => {
          if (statsMap[o.customerId]) {
            const stat = statsMap[o.customerId];
            stat.totalOrders += 1;
            stat.totalPaid += (o.paidAmount || 0);
            if (o.status !== 'Cancelled (రద్దు)') {
              stat.pendingAmount += (o.remainingAmount || 0);
            }
            if (stat.lastOrderDate === 'N/A' || o.orderDate > stat.lastOrderDate) {
              stat.lastOrderDate = o.orderDate;
            }
          }
        });

        setData(Object.values(statsMap));
      } catch (error) {
        console.error("Error fetching report data", error);
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
      item.customerName.toLowerCase().includes(searchLower) ||
      item.mobileNumber.includes(searchLower);

    if (!matchesSearch) return false;

    // Date (filter by registration date if we have it, else last order date)
    // Actually we only have createdAt which is timestamp, so let's filter by lastOrderDate for customers if they ordered.
    if (item.lastOrderDate !== 'N/A' && !isDateInRange(item.lastOrderDate, dateFilter, startDate, endDate)) {
       return false;
    } else if (item.lastOrderDate === 'N/A' && dateFilter !== 'all') {
       return false; // Skip if strict date filter applied and no orders
    }

    return true;
  });

  useEffect(() => {
    if (!exportTrigger) return;
    
    if (exportTrigger.type === 'print') {
      printReport();
      return;
    }

    const headers = ['Name', 'Mobile', 'Total Orders', 'Total Paid (₹)', 'Pending (₹)', 'Last Order Date'];
    const exportData = filteredData.map(c => [
      c.customerName,
      c.mobileNumber,
      c.totalOrders,
      c.totalPaid,
      c.pendingAmount,
      c.lastOrderDate !== 'N/A' ? new Date(c.lastOrderDate).toLocaleDateString() : 'N/A'
    ]);

    if (exportTrigger.type === 'excel') {
      const excelReadyData = filteredData.map(c => ({
        Name: c.customerName,
        Mobile: c.mobileNumber,
        'Total Orders': c.totalOrders,
        'Total Paid': c.totalPaid,
        'Pending Amount': c.pendingAmount,
        'Last Order Date': c.lastOrderDate !== 'N/A' ? new Date(c.lastOrderDate).toLocaleDateString() : 'N/A'
      }));
      exportToExcel(excelReadyData, 'Customer_Report');
    } else if (exportTrigger.type === 'pdf') {
      exportToPDF(headers, exportData, 'Customer_Report', 'Customer Report');
    }
  }, [exportTrigger]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading Customer Report...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-white uppercase bg-black">
          <tr>
            <th className="px-6 py-4 font-medium tracking-wider">Customer Details</th>
            <th className="px-6 py-4 font-medium tracking-wider">Total Orders</th>
            <th className="px-6 py-4 font-medium tracking-wider">Total Paid</th>
            <th className="px-6 py-4 font-medium tracking-wider">Pending Amount</th>
            <th className="px-6 py-4 font-medium tracking-wider">Last Order Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No records found.</td>
            </tr>
          ) : (
            filteredData.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{c.customerName}</div>
                  <div className="text-gray-500 text-xs">{c.mobileNumber}</div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{c.totalOrders}</td>
                <td className="px-6 py-4 font-medium text-green-600">₹ {c.totalPaid}</td>
                <td className="px-6 py-4 font-medium text-orange-600">₹ {c.pendingAmount}</td>
                <td className="px-6 py-4 text-gray-900">
                  {c.lastOrderDate !== 'N/A' ? new Date(c.lastOrderDate).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
