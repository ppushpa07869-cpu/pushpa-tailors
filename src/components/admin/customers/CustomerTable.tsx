import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, ChevronRight, Phone } from 'lucide-react';
import type { Customer } from '../../../types/customer';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (id: string) => void;
  onDelete: (customer: Customer) => void;
}

export default function CustomerTable({ customers, onEdit, onDelete }: CustomerTableProps) {
  const navigate = useNavigate();

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-4xl mb-3">👥</div>
        <p className="text-gray-500 font-medium">No customers found.</p>
        <p className="text-sm text-gray-400 mt-1">Add your first customer to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/admin/customers/${customer.id}`)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {customer.customerName[0]?.toUpperCase()}
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {customer.customerName}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {customer.mobileNumber}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                {customer.customerId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end items-center gap-1" onClick={e => e.stopPropagation()}>
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
                    title="View Details"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
