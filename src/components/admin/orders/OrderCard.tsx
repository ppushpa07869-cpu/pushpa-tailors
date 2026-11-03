import { Eye, Edit, Trash2, Calendar, Phone, IndianRupee, AlertCircle, CheckCircle } from 'lucide-react';
import type { Order } from '../../../types/order';
import { getStatusColor, getStatusIcon, getNextStatus } from '../../../utils/orderUtils';

interface OrderCardProps {
  order: Order;
  onView: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
  onReceivePayment?: (order: Order) => void;
  onMarkDelivered?: (order: Order) => void;
}

export default function OrderCard({
  order,
  onView,
  onEdit,
  onDelete,
  onReceivePayment,
  onMarkDelivered,
}: OrderCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = order.deliveryDate < today && order.status !== 'Delivered';
  const nextStatus = getNextStatus(order.status);

  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${
      isOverdue ? 'border-red-200 bg-red-50/20' : 'border-gray-100'
    }`}>
      {/* Header: Customer Name, Phone & Status Badge */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-gray-900 text-lg truncate">{order.customerName}</h3>
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
              #{order.orderId}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1 flex-wrap">
            <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <a href={`tel:${order.mobileNumber}`} className="hover:text-primary transition-colors">
              {order.mobileNumber}
            </a>
            {order.orderType && (
              <span className="ml-1 text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-md border border-primary/20">
                {order.orderType} {order.quantity && order.quantity > 1 ? `(${order.quantity})` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)} {order.status}
          </span>
          {isOverdue && (
            <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
              <AlertCircle className="h-3 w-3" /> Overdue
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row: Delivery Date & Pending Amount */}
      <div className="grid grid-cols-2 gap-3 py-3 px-4 bg-gray-50/80 rounded-xl mb-4 text-sm">
        <div>
          <span className="text-xs text-gray-400 font-medium block">Delivery Date</span>
          <span className={`font-semibold flex items-center gap-1 mt-0.5 ${
            isOverdue ? 'text-red-600' : 'text-gray-800'
          }`}>
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            {new Date(order.deliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 font-medium block">Pending Amount</span>
          <span className={`font-bold text-base mt-0.5 block ${
            order.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'
          }`}>
            ₹{order.remainingAmount > 0 ? order.remainingAmount : 0}
            {order.remainingAmount === 0 && <span className="text-xs font-normal text-green-600 ml-1">(Paid)</span>}
          </span>
        </div>
      </div>

      {/* Design Remarks / Notes if present */}
      {order.designRemarks && (
        <p className="text-xs text-gray-500 italic mb-4 line-clamp-1 bg-white p-2 rounded-lg border border-gray-100">
          "{order.designRemarks}"
        </p>
      )}

      {/* Large Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {/* Receive Payment Button */}
        <button
          onClick={() => onReceivePayment ? onReceivePayment(order) : onView(order)}
          disabled={order.remainingAmount === 0}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            order.remainingAmount > 0
              ? 'bg-primary text-white hover:bg-primary/90 hover:scale-[1.02]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={order.remainingAmount === 0 ? 'Order Fully Paid' : 'Receive Payment'}
        >
          <IndianRupee className="h-4 w-4" />
          <span className="truncate">Payment</span>
        </button>

        {/* Mark Delivered / Next Status Button */}
        <button
          onClick={() => onMarkDelivered ? onMarkDelivered(order) : onView(order)}
          disabled={order.status === 'Delivered'}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            order.status !== 'Delivered'
              ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02]'
              : 'bg-green-50 text-green-700 cursor-default border border-green-200'
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          <span className="truncate">{order.status === 'Delivered' ? 'Delivered' : nextStatus ? `Mark ${nextStatus}` : 'Deliver'}</span>
        </button>

        {/* View Details Button */}
        <button
          onClick={() => onView(order)}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all"
        >
          <Eye className="h-4 w-4" />
          <span className="truncate">View</span>
        </button>
      </div>

      {/* Optional Edit / Delete Row */}
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-100 text-xs">
          {onEdit && (
            <button
              onClick={() => onEdit(order)}
              className="text-gray-400 hover:text-blue-600 flex items-center gap-1 py-1 px-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="h-3.5 w-3.5" /> Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(order)}
              className="text-gray-400 hover:text-red-600 flex items-center gap-1 py-1 px-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

