import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { customerService } from '../../../services/customerService';
import { orderService } from '../../../services/orderService';
import type { Customer } from '../../../types/customer';
import type { OrderFormData } from '../../../types/order';
import SimpleOrderForm from './SimpleOrderForm';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewOrderModal({ isOpen, onClose }: NewOrderModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (data: OrderFormData) => {
    setIsLoading(true);
    try {
      let targetCustomer: Customer | null = null;

      // 1. Check if customer was auto-filled or search by mobile
      if (data.customerId) {
        targetCustomer = await customerService.getCustomer(data.customerId);
      }

      if (!targetCustomer) {
        const existing = await customerService.findCustomerByMobile(data.mobileNumber.trim());
        if (existing) {
          targetCustomer = existing;
        } else {
          // 2. Automatically create new customer document
          targetCustomer = await customerService.addCustomer({
            customerName: data.customerName.trim(),
            mobileNumber: data.mobileNumber.trim(),
          });
        }
      }

      if (!targetCustomer) {
        throw new Error('Failed to identify or create customer');
      }

      // 3. Create the order linked to target customer
      await orderService.addOrder({
        ...data,
        customerId: targetCustomer.id!,
        customerName: targetCustomer.customerName,
        mobileNumber: targetCustomer.mobileNumber,
      });

      // 4. Close modal and navigate to customer workspace
      onClose();
      navigate(`/admin/customers/${targetCustomer.id}`);
    } catch (error) {
      console.error('Error saving order & customer:', error);
      alert('Failed to save order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-fade-in border border-gray-100 z-10 my-auto">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">➕ New Order</h2>
            <p className="text-xs text-gray-500 mt-0.5">Instant single-step order & customer creation</p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <SimpleOrderForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
