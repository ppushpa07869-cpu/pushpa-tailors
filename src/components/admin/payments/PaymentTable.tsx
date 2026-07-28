import type { Payment } from '../../../types/payment';

interface PaymentTableProps {
  payments: Payment[];
}

export default function PaymentTable({ payments }: PaymentTableProps) {
  if (payments.length === 0) {
    return (
      <div className="bg-white p-8 text-center text-gray-500 rounded-sm border border-gray-100 shadow-sm hidden md:block">
        No payments found matching your search.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-white uppercase bg-black">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">Receipt No.</th>
              <th className="px-6 py-4 font-medium tracking-wider">Date</th>
              <th className="px-6 py-4 font-medium tracking-wider">Customer</th>
              <th className="px-6 py-4 font-medium tracking-wider">Order ID</th>
              <th className="px-6 py-4 font-medium tracking-wider">Method</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{payment.receiptNumber}</div>
                  <div className="text-xs text-gray-500">{payment.paymentType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{payment.customerName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900 font-medium">{payment.orderId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {payment.paymentMethod}
                  </span>
                  {payment.paymentReference && (
                    <div className="text-[10px] text-gray-500 mt-1 truncate max-w-[120px]" title={payment.paymentReference}>
                      Ref: {payment.paymentReference}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`font-medium ${payment.paymentType === 'Refund' ? 'text-red-600' : 'text-green-600'}`}>
                    {payment.paymentType === 'Refund' ? '-' : '+'} ₹ {payment.amountPaid}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
