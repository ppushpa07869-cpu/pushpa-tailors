import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Calendar, Phone, IndianRupee,
  History, Check, Image
} from 'lucide-react';
import { orderService } from '../../../services/orderService';
import { paymentService } from '../../../services/paymentService';
import type { Order } from '../../../types/order';
import type { Payment, PaymentFormData } from '../../../types/payment';
import { getStatusColor, getStatusIcon, getNextStatus } from '../../../utils/orderUtils';
import ReceivePaymentModal from '../../../components/admin/orders/ReceivePaymentModal';
import PaymentHistoryDrawer from '../../../components/admin/orders/PaymentHistoryDrawer';

export default function ViewOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; amount: number; remaining: number } | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const data = await orderService.getOrder(orderId);
      if (data) setOrder(data);
      else navigate('/admin/customers');
    } catch (error) {
      console.error('Error fetching order:', error);
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
      console.error('Error fetching payments:', error);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchPayments();
  }, [orderId]);

  useEffect(() => {
    if (searchParams.get('action') === 'pay' && order?.remainingAmount && order.remainingAmount > 0) {
      setIsPaymentModalOpen(true);
    }
  }, [searchParams, order]);

  const handleReceivePayment = async (data: PaymentFormData) => {
    if (!order) return;
    setProcessingPayment(true);
    try {
      await paymentService.addPayment(order.id!, data);
      await fetchOrder();
      await fetchPayments();
      setIsPaymentModalOpen(false);
      const newPaid = (order.paidAmount || 0) + data.amountPaid;
      const newRemaining = Math.max(0, order.totalAmount - newPaid);
      setToast({ show: true, amount: data.amountPaid, remaining: newRemaining });
      setTimeout(() => setToast(null), 4000);
    } catch (error) {
      console.error('Error receiving payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleAdvanceStatus = async () => {
    if (!order) return;
    const next = getNextStatus(order.status);
    if (!next) return;

    if (next === 'Delivered' && order.remainingAmount > 0) {
      if (!window.confirm(`This order has ₹${order.remainingAmount} pending. Mark as Delivered anyway?`)) return;
    }

    setUpdatingStatus(true);
    try {
      await orderService.updateOrder(order.id!, { status: next });
      await fetchOrder();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const paymentPercentage = order.totalAmount > 0
    ? Math.min(100, Math.round(((order.paidAmount || 0) / order.totalAmount) * 100))
    : 0;

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">

      {/* Back Button */}
      <button
        onClick={() => navigate(`/admin/customers/${order.customerId}`)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Customer
      </button>

      {/* Order Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-24 translate-x-24 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-serif text-gray-900">{order.customerName}</h1>
            <span className="text-gray-400 font-mono text-lg">#{order.orderId}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-600 font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-gray-400" />
              {order.mobileNumber}
            </span>
            {order.orderType && (
              <>
                <span className="text-gray-300">|</span>
                <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-xs border border-primary/20">
                  {order.orderType} {order.quantity && order.quantity > 1 ? `(${order.quantity} pcs)` : ''}
                </span>
              </>
            )}
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              Due: {new Date(order.deliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 relative z-10">
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)} {order.status}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Amount</div>
          <div className="text-3xl font-bold text-gray-900">₹{order.totalAmount}</div>
        </div>
        <div className="bg-green-50/70 rounded-2xl p-5 shadow-sm border border-green-100">
          <div className="text-sm font-medium text-green-700/70 mb-1">Paid</div>
          <div className="text-3xl font-bold text-green-600">₹{order.paidAmount || 0}</div>
        </div>
        <div className="bg-orange-50/70 rounded-2xl p-5 shadow-sm border border-orange-100">
          <div className="text-sm font-medium text-orange-700/70 mb-1">Remaining</div>
          <div className="text-3xl font-bold text-orange-600">₹{order.remainingAmount || 0}</div>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-2">
          <div className="text-sm font-medium text-gray-600">Payment Progress</div>
          <span className="font-bold text-lg text-gray-900">{paymentPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${paymentPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Paid ₹{order.paidAmount || 0} of ₹{order.totalAmount}</p>
      </div>

      {/* Status Progress */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="text-sm font-medium text-gray-600 mb-3">Order Progress</div>
        <div className="flex items-center gap-1 mb-2">
          {['Pending', 'In Progress', 'Ready', 'Delivered'].map((s, i) => {
            const steps = ['Pending', 'In Progress', 'Ready', 'Delivered'];
            const currentIdx = steps.indexOf(order.status);
            const isCompleted = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={s} className="flex-1 flex items-center">
                <div className={`h-3 flex-1 rounded-full transition-all ${
                  isCompleted ? 'bg-primary' : 'bg-gray-100'
                } ${isCurrent && order.status !== 'Delivered' ? 'animate-pulse' : ''}`} />
                {i < 3 && <div className="w-1 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400 px-0.5">
          <span>Pending</span><span>In Progress</span><span>Ready</span><span>Delivered</span>
        </div>
      </div>

      {/* Reference Photo & Remarks */}

      {/* Structured Order Measurements */}
      {order.measurementSnapshot && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">
            📏 Order Measurements
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Measurement Type:{' '}
            <span className="font-semibold text-gray-900">
              {order.measurementSnapshot.measurementType || 'Standard'}
            </span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {([
              ['bust', 'Bust'],
              ['waist', 'Waist'],
              ['shoulder', 'Shoulder'],
              ['frontNeck', 'Front Neck'],
              ['backNeck', 'Back Neck'],
              ['sleeveLength', 'Sleeve Length'],
              ['sleeveRound', 'Sleeve Round'],
              ['blouseLength', 'Blouse Length'],
              ['armHole', 'Arm Hole'],
              ['chestRound', 'Chest Round'],
              ['margin', 'Margin'],
            ] as const).map(([field, label]) => {
              const value = order.measurementSnapshot?.[field];

              if (value === undefined || value === null) return null;

              return (
                <div
                  key={field}
                  className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                >
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-base font-semibold text-gray-900">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>

          {order.measurementSnapshot.notes && (
            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">
                Measurement Notes
              </p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {order.measurementSnapshot.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {(order.referencePhotoUrl || order.designRemarks) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">📸 Reference & Design</h3>
          <div className="flex gap-4 flex-wrap">
            {order.referencePhotoUrl && (
              <button
                onClick={() => setIsPhotoOpen(true)}
                className="group relative"
              >
                <img
                  src={order.referencePhotoUrl}
                  alt="Reference"
                  className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 group-hover:border-primary transition-colors shadow-sm"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors flex items-center justify-center">
                  <Image className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            )}
            {order.designRemarks && (
              <div className="flex-1 min-w-0 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-600 italic">"{order.designRemarks}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Actions */}
      <div className="flex flex-col md:flex-row gap-3">
        {order.remainingAmount > 0 && (
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl text-lg font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 transition-all"
          >
            <IndianRupee className="h-6 w-6" />
            💰 Receive Payment
          </button>
        )}

        {nextStatus && (
          <button
            onClick={handleAdvanceStatus}
            disabled={updatingStatus}
            className="flex-1 flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-2xl text-lg font-bold shadow-lg shadow-green-600/30 hover:bg-green-700 hover:-translate-y-1 transition-all disabled:bg-gray-300 disabled:shadow-none disabled:translate-y-0"
          >
            {updatingStatus
              ? <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Check className="h-6 w-6" />
            }
            Mark {nextStatus}
          </button>
        )}

        <button
          onClick={() => navigate(`/admin/customers/${order.customerId}/orders/edit/${order.id}`)}
          className="flex-1 md:flex-none md:w-40 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl text-sm font-bold hover:bg-gray-50 hover:-translate-y-1 transition-all"
        >
          <Edit className="h-5 w-5" />
          Edit Order
        </button>
      </div>

      {/* Payment History */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsHistoryDrawerOpen(true)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <History className="h-4 w-4" />
          View Payment History ({payments.length})
        </button>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-sm text-blue-800 font-medium">📝 Notes</p>
          <p className="text-sm text-blue-700 mt-1">{order.notes}</p>
        </div>
      )}

      {/* Modals */}
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

      {/* Reference Photo Modal */}
      {isPhotoOpen && order.referencePhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsPhotoOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-gray-900">Reference Photo</h3>
              <button onClick={() => setIsPhotoOpen(false)} className="h-8 w-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-full transition-colors">✕</button>
            </div>
            <img src={order.referencePhotoUrl} alt="Reference" className="w-full rounded-xl border border-gray-200" />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast?.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 min-w-[280px] border border-gray-800 flex items-start gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
            <div className="bg-green-500/20 text-green-400 p-2 rounded-full flex-shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Payment Received</p>
              <p className="text-xs text-gray-400 mt-0.5">₹{toast.amount} collected · ₹{toast.remaining} remaining</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
