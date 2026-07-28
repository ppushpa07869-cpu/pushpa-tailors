import { Calendar, CreditCard, User, FileText, Hash } from 'lucide-react';
import type { Payment } from '../../../types/payment';

interface PaymentCardProps {
  payments: Payment[];
}

export default function PaymentCard({ payments }: PaymentCardProps) {
  if (payments.length === 0) {
    return (
      <div className="md:hidden bg-white p-8 text-center text-gray-500 rounded-sm border border-gray-100 shadow-sm">
        No payments found matching your search.
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-4">
      {payments.map((payment) => (
        <div key={payment.id} className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{payment.receiptNumber}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">{payment.paymentType}</p>
            </div>
            <div className={`font-bold text-lg ${payment.paymentType === 'Refund' ? 'text-red-600' : 'text-green-600'}`}>
              {payment.paymentType === 'Refund' ? '-' : '+'} ₹ {payment.amountPaid}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">{payment.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4 text-gray-400" />
              <span>Order: <span className="font-medium">{payment.orderId}</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Date: {new Date(payment.paymentDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span>Method: <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{payment.paymentMethod}</span></span>
            </div>
            {payment.paymentReference && (
              <div className="flex items-center gap-2 text-sm text-gray-500 pl-6">
                <Hash className="h-3 w-3" />
                <span className="text-xs">Ref: {payment.paymentReference}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
