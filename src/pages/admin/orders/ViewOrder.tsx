import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Calendar, Phone, IndianRupee, 
  CheckCircle, History, AlertCircle, Check
} from 'lucide-react';
import { orderService } from '../../../services/orderService';
import { paymentService } from '../../../services/paymentService';
import type { Order } from '../../../types/order';
import type { Payment, PaymentFormData } from '../../../types/payment';
import { getStatusColor } from '../../../utils/orderUtils';
import ReceivePaymentModal from '../../../components/admin/orders/ReceivePaymentModal';
import PaymentHistoryDrawer from '../../../components/admin/orders/PaymentHistoryDrawer';

export default function ViewOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals & Drawers
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  
  // Data
  const [payments, setPayments] = useState<Payment[]>([]);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Toast
  const [toast, setToast] = useState<{show: boolean; amount: number; remaining: number} | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const data = await orderService.getOrder(orderId);
      if (data) {
        setOrder(data);
      } else {
        alert("Order not found!");
        navigate('/admin/orders');
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!orderId) return;
    try {
      const data = await paymentService.getPaymentsByOrder(orderId);
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchPayments();
  }, [orderId, navigate]);

  const handleReceivePayment = async (data: PaymentFormData) => {
    if (!order) return;
    setProcessingPayment(true);
    try {
      await paymentService.addPayment(order.id!, data);
      await fetchOrder(); // Refresh totals
      await fetchPayments(); // Refresh history
      
      setIsPaymentModalOpen(false);
      
      // Calculate remaining for toast
      const newPaid = (order.paidAmount || 0) + data.amountPaid;
      const newRemaining = Math.max(0, order.totalAmount - newPaid);
      
      setToast({ show: true, amount: data.amountPaid, remaining: newRemaining });
      setTimeout(() => setToast(null), 4000);
    } catch (error) {
      console.error("Error receiving payment:", error);
      alert("Failed to process payment. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const confirmDelivery = async () => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      await orderService.updateOrder(order.id!, { status: 'Delivered (డెలివరీ అయింది)' });
      await fetchOrder();
      setIsDeliveryDialogOpen(false);
    } catch (error) {
      console.error("Error marking delivered:", error);
      alert("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkDelivered = () => {
    if (!order) return;
    if (order.remainingAmount > 0) {
      setIsDeliveryDialogOpen(true);
    } else {
      confirmDelivery();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const paymentPercentage = order.totalAmount > 0 ? Math.min(100, Math.round(((order.paidAmount || 0) / order.totalAmount) * 100)) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-medium text-sm">Back to Orders</span>
      </button>

      {/* Top Header - Glassmorphism & Soft Shadows */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-serif text-gray-900 tracking-tight">
              {order.customerName}
            </h1>
            <span className="text-gray-400 font-mono text-lg">#{order.orderId}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-600 font-medium">
            <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-gray-400" /> {order.mobileNumber}</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-400" /> Due: {new Date(order.deliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 relative z-10">
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${getStatusColor(order.status)}`}>
            {order.status.split(' (')[0]}
          </span>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm ${
            order.paymentStatus === 'Fully Paid' ? 'bg-green-100 text-green-800 border border-green-200' : 
            order.paymentStatus === 'Partially Paid' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Amount (మొత్తం)</div>
          <div className="text-4xl font-bold text-gray-900">₹{order.totalAmount}</div>
        </div>
        <div className="bg-green-50/50 rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10"><IndianRupee className="h-32 w-32 text-green-600" /></div>
          <div className="relative z-10">
            <div className="text-sm font-medium text-green-800/70 mb-1">Paid Amount (చెల్లించిన మొత్తం)</div>
            <div className="text-4xl font-bold text-green-600">₹{order.paidAmount || 0}</div>
          </div>
        </div>
        <div className="bg-orange-50/50 rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10"><AlertCircle className="h-32 w-32 text-orange-600" /></div>
          <div className="relative z-10">
            <div className="text-sm font-medium text-orange-800/70 mb-1">Remaining Amount (మిగిలిన మొత్తం)</div>
            <div className="text-4xl font-bold text-orange-600">₹{order.remainingAmount || 0}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-2">
          <div className="text-sm font-medium text-gray-600">Payment Progress</div>
          <div className="text-right">
            <span className="text-sm text-gray-500">Paid ₹{order.paidAmount || 0} of ₹{order.totalAmount}</span>
            <span className="ml-3 font-bold text-lg text-gray-900">{paymentPercentage}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${paymentPercentage}%` }}
          />
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        {order.remainingAmount > 0 && (
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/30 hover:bg-secondary hover:-translate-y-1 transition-all"
          >
            <span className="text-2xl">💰</span>
            Receive Payment
          </button>
        )}
        
        {order.status !== 'Delivered (డెలివరీ అయింది)' && order.status !== 'Cancelled (రద్దు)' && (
          <button
            onClick={handleMarkDelivered}
            disabled={updatingStatus}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-lg font-bold shadow-lg transition-all ${
              order.remainingAmount === 0 
                ? 'bg-green-600 text-white shadow-green-600/30 hover:bg-green-700 hover:-translate-y-1' 
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="h-6 w-6" />
            Mark Delivered
          </button>
        )}

        <button
          onClick={() => navigate(`/admin/orders/edit/${order.id}`)}
          className="flex-1 md:flex-none md:w-48 flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl text-lg font-bold shadow-sm hover:bg-gray-50 hover:-translate-y-1 transition-all"
        >
          <Edit className="h-5 w-5" />
          Edit Order
        </button>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={() => setIsHistoryDrawerOpen(true)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <History className="h-4 w-4" />
          View Payment History
        </button>
      </div>

      {/* Modals & Dialogs */}
      <ReceivePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handleReceivePayment}
        totalAmount={order.totalAmount}
        paidAmount={order.paidAmount || 0}
        remainingAmount={order.remainingAmount}
        isLoading={processingPayment}
      />

      <PaymentHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        payments={payments}
      />

      {/* Delivery Safety Dialog */}
      {isDeliveryDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeliveryDialogOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">Remaining Payment</h3>
              <div className="text-3xl font-bold text-orange-600 mb-4">₹{order.remainingAmount}</div>
              <p className="text-gray-600 mb-8">Do you still want to mark this order as delivered?</p>
              
              <div className="w-full space-y-3">
                <button
                  onClick={() => {
                    setIsDeliveryDialogOpen(false);
                    setIsPaymentModalOpen(true);
                  }}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-colors shadow-lg shadow-primary/30"
                >
                  Receive Payment
                </button>
                <button
                  onClick={confirmDelivery}
                  disabled={updatingStatus}
                  className="w-full py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {updatingStatus ? 'Processing...' : 'Deliver Anyway'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Toast */}
      {toast && toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="bg-gray-900 text-white rounded-xl shadow-2xl p-4 min-w-[320px] border border-gray-800 flex items-start gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
            <div className="bg-green-500/20 text-green-400 p-2 rounded-full flex-shrink-0">
              <Check className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-white mb-1">Payment Received Successfully</h4>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Received</span>
                <span className="font-bold text-green-400">₹{toast.amount}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-0.5">
                <span className="text-gray-400">Remaining</span>
                <span className={`font-bold ${toast.remaining > 0 ? 'text-orange-400' : 'text-gray-300'}`}>
                  ₹{toast.remaining}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
