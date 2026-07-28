import { X } from 'lucide-react';
import type { Payment } from '../../../types/payment';

interface PaymentHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  payments: Payment[];
}

export default function PaymentHistoryDrawer({ isOpen, onClose, payments }: PaymentHistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-xl font-serif text-gray-900">Payment History</h2>
              <p className="text-sm text-gray-500 mt-1">Total Payments: <span className="font-bold text-gray-900">{payments.length}</span></p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {payments.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p>No payments recorded yet.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
                {payments.map((p) => (
                  <div key={p.id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white border-2 border-primary shadow-sm" />
                    
                    <div className="bg-gray-50 rounded-md p-4 border border-gray-100 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-gray-500">
                          {new Date(p.paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          ₹{p.amountPaid}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 font-medium">
                        {p.paymentMethod}
                      </div>
                      
                      {p.remarks && (
                        <div className="mt-2 text-xs text-gray-500 italic border-t border-gray-200 pt-2">
                          {p.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
