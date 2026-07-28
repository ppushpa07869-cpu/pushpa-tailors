import { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { PaymentFormData, PaymentMethod, PaymentType } from '../../../types/payment';
import type { Order } from '../../../types/order';

interface PaymentFormProps {
  order: Order;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash (నగదు)', 'UPI (యూపీఐ)', 'PhonePe', 'Google Pay', 'Paytm', 'Bank Transfer', 'Other'
];

const PAYMENT_TYPES: PaymentType[] = [
  'Advance', 'Partial Payment', 'Final Payment', 'Refund'
];

export default function PaymentForm({ order, onSubmit, onCancel, isLoading }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash (నగదు)',
    paymentReference: '',
    amountPaid: 0,
    paymentType: 'Partial Payment',
    remarks: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amountPaid <= 0) {
      alert("Payment amount must be greater than zero.");
      return;
    }
    if (formData.amountPaid > order.remainingAmount && formData.paymentType !== 'Refund') {
      alert(`Amount cannot exceed the remaining balance of ₹ ${order.remainingAmount}`);
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Date */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Payment Date (చెల్లింపు తేదీ) <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>

        {/* Amount Paid */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Amount Paid (చెల్లించిన మొత్తం) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amountPaid"
            value={formData.amountPaid || ''}
            onChange={handleChange}
            min="1"
            max={formData.paymentType === 'Refund' ? undefined : order.remainingAmount}
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
          {formData.paymentType !== 'Refund' && (
            <p className="text-xs text-gray-500 mt-1">Remaining: ₹ {order.remainingAmount}</p>
          )}
        </div>

        {/* Payment Type */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Payment Type (చెల్లింపు రకం) <span className="text-red-500">*</span>
          </label>
          <select
            name="paymentType"
            value={formData.paymentType}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          >
            {PAYMENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Payment Method (చెల్లింపు విధానం) <span className="text-red-500">*</span>
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          >
            {PAYMENT_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* Payment Reference (Optional) */}
        <div className="space-y-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Payment Reference / Transaction ID (లావాదేవీ ఐడి)
          </label>
          <input
            type="text"
            name="paymentReference"
            value={formData.paymentReference}
            onChange={handleChange}
            placeholder="e.g., UTR Number, UPI Ref..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>

        {/* Remarks */}
        <div className="space-y-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Remarks (గమనికలు)
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-sm hover:bg-secondary transition-colors disabled:bg-gray-400"
        >
          <Save className="h-4 w-4" />
          <span>{isLoading ? 'Processing...' : 'Record Payment'}</span>
        </button>
      </div>
    </form>
  );
}
