import { Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import type { Order } from '../../../types/order';
import { getStatusColor } from '../../../utils/orderUtils';

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

export default function OrderTable({ orders, onView, onEdit, onDelete }: OrderTableProps) {
  const checkOverdue = (deliveryDate: string, status: string) => {
    if (status === 'Delivered (డెలివరీ అయింది)' || status === 'Cancelled (రద్దు)') return false;
    const today = new Date().toISOString().split('T')[0];
    return deliveryDate < today;
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white p-8 text-center text-gray-500 rounded-sm border border-gray-100 shadow-sm">
        No orders found matching your search.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-white uppercase bg-black">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">Order ID</th>
              <th className="px-6 py-4 font-medium tracking-wider">Customer</th>
              <th className="px-6 py-4 font-medium tracking-wider">Delivery Date</th>
              <th className="px-6 py-4 font-medium tracking-wider">Status</th>
              <th className="px-6 py-4 font-medium tracking-wider">Remaining</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const isOverdue = checkOverdue(order.deliveryDate, order.status);
              return (
                <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{order.orderId}</div>
                    {isOverdue && (
                      <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-gray-500 text-xs">{order.mobileNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${order.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      ₹ {order.remainingAmount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(order)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(order)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Edit Order"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(order)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
