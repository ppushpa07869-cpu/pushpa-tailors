import { useState } from 'react';
import { X, IndianRupee } from 'lucide-react';
import type { PaymentFormData, PaymentMethod, PaymentType } from '../../../types/payment';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isLoading: boolean;
}

export default function ReceivePaymentModal({
  isOpen, onClose, onSubmit, totalAmount, paidAmount, remainingAmount, isLoading
}: ReceivePaymentModalProps) {
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountPaid || amountPaid <= 0) return;

    await onSubmit({
      paymentDate: new Date().toISOString().split('T')[0],
      amountPaid: Number(amountPaid),
      paymentMethod: paymentMethod as PaymentMethod,
      paymentType: (Number(amountPaid) === remainingAmount ? 'Final Payment' : 'Partial Payment') as PaymentType,
      remarks
    });
  };

  const handleFullPayment = () => {
    setAmountPaid(remainingAmount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-xl font-serif text-gray-900 flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-green-600" />
            Receive Payment
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Summary Section */}
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-4 border border-gray-100">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Total</div>
              <div className="font-medium text-gray-900">â‚¹{totalAmount}</div>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Paid</div>
              <div className="font-medium text-green-600">â‚¹{paidAmount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Remaining</div>
              <div className="font-medium text-orange-600">â‚¹{remainingAmount}</div>
            </div>
          </div>

          {remainingAmount > 0 && (
            <button
              type="button"
              onClick={handleFullPayment}
              className="w-full py-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary/20 transition-colors border border-primary/20"
            >
              Pay Full Remaining â‚¹{remainingAmount}
            </button>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (â‚¹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">â‚¹</span>
                </div>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                  min="1"
                  max={remainingAmount}
                  required
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg font-medium text-gray-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900"
              >
                <option value="Cash (à°¨à°—à°¦à±)">Cash</option>
                <option value="UPI (à°¯à±‚à°ªà±€à°)">UPI</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Google Pay">Google Pay</option>
                <option value="Paytm">Paytm</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks (Optional)
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Transaction ID, notes..."
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amountPaid || amountPaid <= 0}
              className="flex-1 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 shadow-sm"
            >
              {isLoading ? 'Processing...' : 'Receive Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
