import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Phone, Plus, IndianRupee, Edit,
  Image, History, MapPin, Receipt, X
} from 'lucide-react';
import { customerService } from '../../../services/customerService';
import { orderService } from '../../../services/orderService';
import { paymentService } from '../../../services/paymentService';
import type { Customer } from '../../../types/customer';
import type { Order } from '../../../types/order';
import type { Payment, PaymentFormData } from '../../../types/payment';
import { getNextStatus } from '../../../utils/orderUtils';
import OrderCard from '../../../components/admin/orders/OrderCard';
import ReceivePaymentModal from '../../../components/admin/orders/ReceivePaymentModal';
import DeleteDialog from '../../../components/admin/customers/DeleteDialog';

export default function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerPayments, setCustomerPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'orders' | 'payments'
  const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');

  // Payment modal
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Reference photo viewer
  const [photoOrder, setPhotoOrder] = useState<Order | null>(null);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  // Delete order dialog
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    if (!customerId) return;
    try {
      const [cust, ords, allPays] = await Promise.all([
        customerService.getCustomer(customerId),
        orderService.getOrdersByCustomer(customerId),
        paymentService.getAllPayments(),
      ]);

      if (!cust) {
        navigate('/admin/customers');
        return;
      }

      setCustomer(cust);
      setOrders(ords);

      // Filter payments belonging to this customer
      const custPays = allPays.filter(p => p.customerId === customerId);
      setCustomerPayments(custPays);

    } catch (error) {
      console.error('Error loading customer details workspace:', error);
    } finally {
      setLoading(false);
    }
  }, [customerId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle URL parameters for auto-opening actions (e.g., from notifications)
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const action = searchParams.get('action');
    if (orderId && orders.length > 0) {
      const targetOrder = orders.find(o => o.id === orderId);
      if (targetOrder && action === 'pay') {
        setPaymentOrder(targetOrder);
        setIsPaymentOpen(true);
      }
    }
  }, [searchParams, orders]);

  // Payment Processing
  const handleReceivePayment = async (data: PaymentFormData) => {
    if (!paymentOrder) return;
    setProcessingPayment(true);
    try {
      await paymentService.addPayment(paymentOrder.id, data);
      await fetchData();
      setIsPaymentOpen(false);
      showToast(`₹${data.amountPaid} payment recorded successfully`);
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Status Advance / Mark Delivered
  const handleMarkDelivered = async (order: Order) => {
    const next = getNextStatus(order.status);
    if (!next) return;

    if (next === 'Delivered' && order.remainingAmount > 0) {
      if (!window.confirm(`This order has ₹${order.remainingAmount} remaining. Mark as Delivered?`)) {
        return;
      }
    }

    try {
      await orderService.updateOrder(order.id, { status: next });
      await fetchData();
      showToast(`Order #${order.orderId} marked as ${next}`);
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  // Delete Order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeletingOrder(true);
    try {
      await orderService.deleteOrder(orderToDelete.id);
      await fetchData();
      setIsDeleteOpen(false);
      setOrderToDelete(null);
      showToast('Order deleted', 'info');
    } catch (error) {
      console.error('Delete order error:', error);
    } finally {
      setIsDeletingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  // Workspace Calculations
  const today = new Date().toISOString().split('T')[0];
  const pendingAmount = orders.reduce((sum, o) => sum + (o.remainingAmount || 0), 0);

  // Next Delivery Date calculation
  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const sortedUpcoming = [...activeOrders].sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
  const nextDeliveryOrder = sortedUpcoming[0];
  const nextDeliveryDateStr = nextDeliveryOrder
    ? new Date(nextDeliveryOrder.deliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'No Active Deliveries';

  // Overall Current Status
  let currentStatusText = 'No Active Orders';
  let currentStatusBadgeClass = 'bg-gray-100 text-gray-600';
  if (activeOrders.length > 0) {
    const isOverduePresent = activeOrders.some(o => o.deliveryDate < today);
    if (isOverduePresent) {
      currentStatusText = '🔴 Overdue Delivery';
      currentStatusBadgeClass = 'bg-red-100 text-red-700 font-bold';
    } else {
      const readyCount = activeOrders.filter(o => o.status === 'Ready').length;
      if (readyCount > 0) {
        currentStatusText = `🟢 ${readyCount} Ready for Pickup`;
        currentStatusBadgeClass = 'bg-green-100 text-green-800 font-bold';
      } else {
        currentStatusText = `🟠 ${activeOrders.length} In Progress`;
        currentStatusBadgeClass = 'bg-orange-100 text-orange-800 font-bold';
      }
    }
  } else if (orders.length > 0) {
    currentStatusText = '✔ All Delivered';
    currentStatusBadgeClass = 'bg-emerald-100 text-emerald-800 font-bold';
  }

  // Last Payment calculation
  const sortedPayments = [...customerPayments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  const lastPayment = sortedPayments[0];

  // Last Visit / Activity calculation
  let lastVisitStr = 'None';
  if (orders.length > 0 || sortedPayments.length > 0) {
    const latestOrderDate = orders[0]?.orderDate || '';
    const latestPayDate = lastPayment?.paymentDate || '';
    const maxDate = latestOrderDate > latestPayDate ? latestOrderDate : latestPayDate;
    if (maxDate) {
      lastVisitStr = new Date(maxDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-fade-in">

      <button
        onClick={() => navigate('/admin/customers')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </button>

      {/* PRIMARY WORKSPACE HERO CARD */}
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-tr-full blur-xl" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-white/10 border-2 border-white/20 rounded-2xl flex items-center justify-center text-3xl font-serif font-bold text-white flex-shrink-0 shadow-inner">
                {customer.customerName[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">{customer.customerName}</h1>
                  <span className="text-xs font-mono bg-white/10 text-gray-300 px-2.5 py-1 rounded-full border border-white/10">
                    {customer.customerId}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 mt-1.5 flex-wrap text-sm">
                  <a href={`tel:${customer.mobileNumber}`} className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{customer.mobileNumber}</span>
                  </a>
                  {customer.alternateNumber && (<span className="text-gray-400">/ {customer.alternateNumber}</span>)}
                  {customer.address && (
                    <span className="flex items-center gap-1 text-gray-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {customer.address}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col md:items-end gap-1">
              <span className="text-xs text-gray-400">Workspace Status</span>
              <span className={`px-4 py-1.5 rounded-full text-xs tracking-wide shadow-sm ${currentStatusBadgeClass}`}>
                {currentStatusText}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-gray-400 font-medium block">Pending Amount</span>
              <span className={`text-xl font-bold mt-1 block ${pendingAmount > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                ₹{pendingAmount}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-gray-400 font-medium block">Next Delivery</span>
              <span className="text-sm font-bold text-gray-200 mt-1 block truncate">{nextDeliveryDateStr}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-gray-400 font-medium block">Active Orders</span>
              <span className="text-xl font-bold text-white mt-1 block">{activeOrders.length}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-gray-400 font-medium block">Last Payment</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block truncate">
                {lastPayment ? `₹${lastPayment.amountPaid}` : 'None'}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-gray-400 font-medium block">Last Visit</span>
              <span className="text-sm font-bold text-gray-300 mt-1 block truncate">{lastVisitStr}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-gray-400 font-medium block">Total Orders</span>
              <span className="text-xl font-bold text-white mt-1 block">{orders.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <button onClick={() => navigate(`/admin/customers/${customerId}/orders/add`)} className="flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-lg shadow-primary/30">
              <Plus className="h-5 w-5" />
              <span>New Order</span>
            </button>
            <button onClick={() => {
                const unpaidOrder = orders.find(o => o.remainingAmount > 0);
                if (unpaidOrder) {
                  setPaymentOrder(unpaidOrder);
                  setIsPaymentOpen(true);
                } else if (orders.length > 0) {
                  showToast('All orders for this customer are fully paid!', 'info');
                } else {
                  showToast('No orders found for payment', 'info');
                }
              }} className="flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-500 hover:scale-[1.02] transition-all shadow-lg shadow-emerald-600/30">
              <IndianRupee className="h-5 w-5" />
              <span>Receive Payment</span>
            </button>
            <button onClick={() => {
                const withPhoto = orders.find(o => o.referencePhotoUrl);
                if (withPhoto) {
                  setPhotoOrder(withPhoto);
                  setIsPhotoOpen(true);
                } else {
                  showToast('No reference photo uploaded yet', 'info');
                }
              }} className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 hover:scale-[1.02] transition-all">
              <Image className="h-5 w-5" />
              <span>Reference Photo</span>
            </button>
            <button onClick={() => navigate(`/admin/customers/edit/${customerId}`)} className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 hover:scale-[1.02] transition-all">
              <Edit className="h-5 w-5" />
              <span>Edit Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* WORKSPACE NAVIGATION TABS */}
      <div className="flex border-b border-gray-200 gap-2">
        <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 ${activeTab === 'orders' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
          <History className="h-4 w-4" />
          Order History ({orders.length})
        </button>
        <button onClick={() => setActiveTab('payments')} className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 ${activeTab === 'payments' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
          <Receipt className="h-4 w-4" />
          Payment Ledger ({customerPayments.length})
        </button>
      </div>

      {/* TAB CONTENT 1: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif text-gray-900">Orders ({orders.length})</h2>
            <button onClick={() => navigate(`/admin/customers/${customerId}/orders/add`)} className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              <Plus className="h-4 w-4" /> Add Order
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-6 text-sm">Create the first order for {customer.customerName}</p>
              <button onClick={() => navigate(`/admin/customers/${customerId}/orders/add`)} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all text-sm">
                <Plus className="h-5 w-5" /> Create First Order
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onView={(o) => navigate(`/admin/orders/view/${o.id}`)}
                  onEdit={(o) => navigate(`/admin/customers/${customerId}/orders/edit/${o.id}`)}
                  onDelete={(o) => { setOrderToDelete(o); setIsDeleteOpen(true); }}
                  onReceivePayment={(o) => { setPaymentOrder(o); setIsPaymentOpen(true); }}
                  onMarkDelivered={handleMarkDelivered}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: PAYMENT LEDGER */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif text-gray-900">Payment Ledger</h2>
          {customerPayments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500">
              No payments recorded yet for this customer.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {customerPayments.map(pay => (
                <div key={pay.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{pay.paymentMethod}</p>
                    <p className="text-xs text-gray-400">{pay.paymentDate}</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">₹{pay.amountPaid}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {paymentOrder && (
        <ReceivePaymentModal
          isOpen={isPaymentOpen}
          onClose={() => { setIsPaymentOpen(false); setPaymentOrder(null); }}
          onSubmit={handleReceivePayment}
          totalAmount={paymentOrder.totalAmount}
          paidAmount={paymentOrder.paidAmount || 0}
          remainingAmount={paymentOrder.remainingAmount}
          isLoading={processingPayment}
        />
      )}

      {/* Reference Photo Modal */}
      {isPhotoOpen && photoOrder?.referencePhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsPhotoOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-gray-900">Reference Photo</h3>
              <button
                onClick={() => setIsPhotoOpen(false)}
                className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={photoOrder.referencePhotoUrl}
              alt="Reference"
              className="w-full rounded-2xl border border-gray-200 shadow-sm max-h-[60vh] object-contain"
            />
            {photoOrder.designRemarks && (
              <p className="mt-4 text-sm text-gray-600 italic bg-gray-50 rounded-xl p-3">"{photoOrder.designRemarks}"</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setIsPhotoOpen(false);
                  navigate(`/admin/customers/${customerId}/orders/edit/${photoOrder.id}`);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                <Edit className="h-4 w-4" /> Edit Order
              </button>
              <button
                onClick={() => setIsPhotoOpen(false)}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Dialog */}
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => !isDeletingOrder && setIsDeleteOpen(false)}
        onConfirm={handleDeleteOrder}
        customerName={orderToDelete ? `Order #${orderToDelete.orderId}` : ''}
        isDeleting={isDeletingOrder}
      />


      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm ${toast.type === 'success' ? 'bg-gray-900' : 'bg-gray-700'}`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

