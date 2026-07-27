import { Edit, Trash2, Ruler } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Customer } from '../../../types/customer';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (id: string) => void;
  onDelete: (customer: Customer) => void;
}

export default function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue === 'string') return dateValue;
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString();
    }
    return new Date(dateValue).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{customer.customerName}</h3>
          <p className="text-sm text-gray-500 font-mono mt-1">{customer.customerId}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
          {customer.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          <span className="block text-xs text-gray-400">Mobile</span>
          {customer.mobileNumber}
        </div>
        <div>
          <span className="block text-xs text-gray-400">Delivery Date</span>
          {formatDate(customer.deliveryDate)}
        </div>
      </div>
      
      <div className="mt-2 pt-3 border-t border-gray-100 flex justify-end gap-2">
        <Link 
          to={`/admin/customers/${customer.id}/measurements`}
          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-sm transition-colors"
          title="Measurements"
        >
          <Ruler className="h-4 w-4" />
        </Link>
        <button 
          onClick={() => onEdit(customer.id!)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onDelete(customer)}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
