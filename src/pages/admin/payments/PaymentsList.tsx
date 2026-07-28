import { useState, useEffect } from 'react';
import { paymentService } from '../../../services/paymentService';
import type { Payment } from '../../../types/payment';
import PaymentTable from '../../../components/admin/payments/PaymentTable';
import PaymentCard from '../../../components/admin/payments/PaymentCard';
import PaymentFilters from '../../../components/admin/payments/PaymentFilters';

export default function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await paymentService.getAllPayments();
        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    // Search filtering
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      payment.receiptNumber.toLowerCase().includes(searchLower) ||
      payment.customerName.toLowerCase().includes(searchLower) ||
      payment.orderId.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Date filtering
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);
    
    switch (dateFilter) {
      case 'today':
        return payment.paymentDate === today;
      case 'month':
        return payment.paymentDate.startsWith(currentMonth);
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif text-gray-900 tracking-wide">Payments</h1>
        <p className="text-gray-500 mt-1 font-medium">View all payment history across all orders.</p>
      </div>

      <PaymentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <PaymentTable payments={filteredPayments} />
          <PaymentCard payments={filteredPayments} />
        </>
      )}
    </div>
  );
}
