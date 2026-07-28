import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { paymentService } from '../../../services/paymentService';
import { orderService } from '../../../services/orderService';
import type { Payment, PaymentFormData } from '../../../types/payment';
import type { Order } from '../../../types/order';
import PaymentTable from '../../../components/admin/payments/PaymentTable';
import PaymentCard from '../../../components/admin/payments/PaymentCard';
import PaymentForm from '../../../components/admin/payments/PaymentForm';

export default function OrderPayments() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrderAndPayments = async () => {
    if (!orderId) return;
    try {
      const orderData = await orderService.getOrder(orderId);
      if (!orderData) {
        alert("Order not found!");
        navigate('/admin/orders');
        return;
      }
      setOrder(orderData);
      
      const paymentsData = await paymentService.getPaymentsByOrder(orderId);
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndPayments();
  }, [orderId, navigate]);

  const handleAddPayment = async (data: PaymentFormData) => {
    if (!orderId) return;
    setIsSubmitting(true);
    try {
      await paymentService.addPayment(orderId, data);
      setShowAddForm(false);
      fetchOrderAndPayments(); // Refresh data to get new order stats and payment list
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/orders/view/${order.id}`)}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            title="Back to Order"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-serif text-gray-900 tracking-wide">
              Manage Payments
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Order: {order.orderId} • Customer: {order.customerName}</p>
          </div>
        </div>
        
        {!showAddForm && order.remainingAmount > 0 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-sm hover:bg-secondary transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
          <p className="text-xl font-bold text-gray-900">₹ {order.totalAmount}</p>
        </div>
        <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-1">Paid Amount</p>
          <p className="text-xl font-bold text-green-600">₹ {order.paidAmount}</p>
        </div>
        <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-1">Remaining Amount</p>
          <p className={`text-xl font-bold ${order.remainingAmount > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
            ₹ {order.remainingAmount}
          </p>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-8">
          <h2 className="text-xl font-serif text-gray-900 mb-4">Record New Payment</h2>
          <PaymentForm 
            order={order} 
            onSubmit={handleAddPayment} 
            onCancel={() => setShowAddForm(false)} 
            isLoading={isSubmitting} 
          />
        </div>
      )}

      <div>
        <h2 className="text-xl font-serif text-gray-900 mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <div className="bg-white p-8 text-center text-gray-500 rounded-sm border border-gray-100 shadow-sm">
            No payments have been recorded for this order yet.
          </div>
        ) : (
          <>
            <PaymentTable payments={payments} />
            <PaymentCard payments={payments} />
          </>
        )}
      </div>
    </div>
  );
}
