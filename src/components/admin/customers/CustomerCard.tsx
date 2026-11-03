import { useNavigate } from 'react-router-dom';
import { ChevronRight, Phone, Trash2, Edit } from 'lucide-react';
import type { Customer } from '../../../types/customer';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (id: string) => void;
  onDelete: (customer: Customer) => void;
}

export default function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div
        className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0 cursor-pointer"
        onClick={() => navigate(`/admin/customers/${customer.id}`)}
      >
        {customer.customerName[0]?.toUpperCase()}
      </div>

      {/* Info */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => navigate(`/admin/customers/${customer.id}`)}
      >
        <div className="font-bold text-gray-900 truncate">{customer.customerName}</div>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
          <Phone className="h-3 w-3" />
          {customer.mobileNumber}
        </div>
        <div className="text-xs text-gray-400 font-mono mt-0.5">{customer.customerId}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(customer.id!)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(customer)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate(`/admin/customers/${customer.id}`)}
          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
          title="Open"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
