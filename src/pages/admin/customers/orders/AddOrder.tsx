import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { customerService } from '../../../../services/customerService';
import { orderService } from '../../../../services/orderService';
import type { Customer } from '../../../../types/customer';
import type { OrderFormData } from '../../../../types/order';
import SimpleOrderForm from '../../../../components/admin/orders/SimpleOrderForm';

export default function AddOrder() {
  const { customerId } = useParams<{ customerId?: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(Boolean(customerId));

  useEffect(() => {
    if (!customerId) {
      setLoadingCustomer(false);
      return;
    }
    customerService.getCustomer(customerId)
      .then(c => {
        if (c) setCustomer(c);
      })
      .catch(() => {})
      .finally(() => setLoadingCustomer(false));
  }, [customerId]);

  const handleSubmit = async (data: OrderFormData) => {
    setIsLoading(true);
    try {
      let targetCustomer: Customer | null = customer;

      if (!targetCustomer) {
        // 1. Search for existing customer by mobile number
        const existing = await customerService.findCustomerByMobile(data.mobileNumber.trim());
        if (existing) {
          targetCustomer = existing;
        } else {
          // 2. Automatically create new customer
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

      // 4. Redirect to Customer Workspace
      navigate(`/admin/customers/${targetCustomer.id}`);
    } catch (error) {
      console.error('Error saving order & customer:', error);
      alert('Failed to save order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingCustomer) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium text-sm">Preparing Order Form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
            {customer ? `New Order for ${customer.customerName}` : '➕ New Order'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {customer
              ? 'Create a new stitching order for this customer'
              : 'Single-step order creation (Customer is matched or auto-created)'}
          </p>
        </div>
      </div>

      <SimpleOrderForm
        initialCustomerName={customer?.customerName || ''}
        initialMobileNumber={customer?.mobileNumber || ''}
        initialData={customer ? { customerId: customer.id } : undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

