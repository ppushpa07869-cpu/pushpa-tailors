import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Phone, IndianRupee, Scissors, CreditCard } from 'lucide-react';
import { orderService } from '../../../services/orderService';
import type { Order } from '../../../types/order';
import { getStatusColor } from '../../../utils/orderUtils';

export default function ViewOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        alert("Failed to load order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            title="Back to Orders"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-serif text-gray-900 tracking-wide">
              Order {order.orderId}
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Order details and status.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/orders/${order.id}/payments`)}
            className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-sm hover:bg-blue-100 transition-colors shadow-sm"
          >
            <CreditCard className="h-4 w-4" />
            <span>Payments</span>
          </button>
          <button
            onClick={() => navigate(`/admin/orders/edit/${order.id}`)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-sm hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Order</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-lg font-serif text-gray-900">Order Summary</h3>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              order.paymentStatus === 'Fully Paid' ? 'bg-green-100 text-green-800' : 
              order.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                Customer Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                <p className="font-medium text-gray-900">{order.customerName}</p>
                <div className="flex items-center gap-2 text-gray-600 mt-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {order.mobileNumber}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Scissors className="h-4 w-4" /> Measurement Type
              </h4>
              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 font-medium text-gray-900">
                {order.measurementType}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Dates
              </h4>
              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Order Date:</span>
                  <span className="font-medium text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Delivery Date:</span>
                  <span className="font-medium text-gray-900">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" /> Payment Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Total Amount:</span>
                  <span className="font-medium text-gray-900">₹ {order.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Paid Amount:</span>
                  <span className="font-medium text-green-600">₹ {order.paidAmount}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-gray-700 font-medium">Remaining Amount:</span>
                  <span className={`font-bold ${order.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    ₹ {order.remainingAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/30">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
            <p className="text-gray-700 whitespace-pre-wrap text-sm">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
