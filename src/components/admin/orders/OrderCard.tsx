import { Eye, Edit, Trash2, Calendar, Phone, IndianRupee, AlertCircle } from 'lucide-react';
import type { Order } from '../../../types/order';
import { getStatusColor } from '../../../utils/orderUtils';

interface OrderCardProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

export default function OrderCard({ orders, onView, onEdit, onDelete }: OrderCardProps) {
  const checkOverdue = (deliveryDate: string, status: string) => {
    if (status === 'Delivered (డెలివరీ అయింది)' || status === 'Cancelled (రద్దు)') return false;
    const today = new Date().toISOString().split('T')[0];
    return deliveryDate < today;
  };

  if (orders.length === 0) {
    return (
      <div className="md:hidden bg-white p-8 text-center text-gray-500 rounded-sm border border-gray-100 shadow-sm">
        No orders found matching your search.
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-4">
      {orders.map((order) => {
        const isOverdue = checkOverdue(order.deliveryDate, order.status);
        
        return (
          <div key={order.id} className={`bg-white p-4 rounded-sm shadow-sm border ${isOverdue ? 'border-red-300' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{order.orderId}</h3>
                  {isOverdue && (
                    <span className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                      <AlertCircle className="w-3 h-3" /> Overdue
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 mt-1">{order.customerName}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{order.mobileNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Delivery: <span className={isOverdue ? 'text-red-600 font-medium' : ''}>{new Date(order.deliveryDate).toLocaleDateString()}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <IndianRupee className="h-4 w-4 text-gray-400" />
                <span>Remaining: <span className={`font-medium ${order.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>₹ {order.remainingAmount}</span></span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-50">
              <button
                onClick={() => onView(order)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 text-blue-600 rounded-sm text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-4 w-4" /> View
              </button>
              <button
                onClick={() => onEdit(order)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-600 rounded-sm text-sm font-medium hover:bg-green-100 transition-colors"
              >
                <Edit className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => onDelete(order)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 rounded-sm text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
