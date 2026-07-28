import { useState, useEffect } from 'react';
import { paymentService } from '../../../services/paymentService';
import { isDateInRange } from '../../../utils/dateUtils';
import { exportToExcel, exportToPDF, printReport } from '../../../utils/exportUtils';
import type { Payment } from '../../../types/payment';

interface PaymentReportProps {
  searchTerm: string;
  dateFilter: string;
  startDate: string;
  endDate: string;
  exportTrigger: { type: 'excel' | 'pdf' | 'print', timestamp: number } | null;
}

export default function PaymentReport({ 
  searchTerm, dateFilter, startDate, endDate, exportTrigger 
}: PaymentReportProps) {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payments = await paymentService.getAllPayments();
        setData(payments);
      } catch (error) {
        console.error("Error fetching payment report data", error);
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
      item.receiptNumber.toLowerCase().includes(searchLower) ||
      item.customerName.toLowerCase().includes(searchLower) ||
      item.orderId.toLowerCase().includes(searchLower) ||
      (item.paymentReference && item.paymentReference.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    // Date Filter (by payment date)
    if (!isDateInRange(item.paymentDate, dateFilter, startDate, endDate)) {
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

    const headers = ['Receipt No.', 'Date', 'Customer', 'Order ID', 'Method', 'Type', 'Amount (₹)'];
    const exportData = filteredData.map(p => [
      p.receiptNumber,
      new Date(p.paymentDate).toLocaleDateString(),
      p.customerName,
      p.orderId,
      p.paymentMethod.split(' (')[0],
      p.paymentType,
      p.paymentType === 'Refund' ? `-${p.amountPaid}` : `${p.amountPaid}`
    ]);

    if (exportTrigger.type === 'excel') {
      const excelReadyData = filteredData.map(p => ({
        'Receipt No.': p.receiptNumber,
        'Date': new Date(p.paymentDate).toLocaleDateString(),
        'Customer': p.customerName,
        'Order ID': p.orderId,
        'Method': p.paymentMethod.split(' (')[0],
        'Type': p.paymentType,
        'Amount': p.paymentType === 'Refund' ? -p.amountPaid : p.amountPaid
      }));
      exportToExcel(excelReadyData, 'Payment_Report');
    } else if (exportTrigger.type === 'pdf') {
      exportToPDF(headers, exportData, 'Payment_Report', 'Payment Report');
    }
  }, [exportTrigger]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading Payment Report...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-white uppercase bg-black">
          <tr>
            <th className="px-6 py-4 font-medium tracking-wider">Receipt No.</th>
            <th className="px-6 py-4 font-medium tracking-wider">Date</th>
            <th className="px-6 py-4 font-medium tracking-wider">Customer & Order</th>
            <th className="px-6 py-4 font-medium tracking-wider">Details</th>
            <th className="px-6 py-4 font-medium tracking-wider text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No records found.</td>
            </tr>
          ) : (
            filteredData.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{p.receiptNumber}</td>
                <td className="px-6 py-4 text-gray-900">{new Date(p.paymentDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{p.customerName}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Order: {p.orderId}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded-sm inline-block">
                    {p.paymentMethod.split(' (')[0]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{p.paymentType}</div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className={`font-medium ${p.paymentType === 'Refund' ? 'text-red-600' : 'text-green-600'}`}>
                    {p.paymentType === 'Refund' ? '-' : '+'} ₹ {p.amountPaid}
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
