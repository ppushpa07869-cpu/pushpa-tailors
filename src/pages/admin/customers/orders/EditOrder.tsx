import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { customerService } from '../../../../services/customerService';
import { orderService } from '../../../../services/orderService';
import type { Customer } from '../../../../types/customer';
import type { Order, OrderFormData } from '../../../../types/order';
import SimpleOrderForm from '../../../../components/admin/orders/SimpleOrderForm';

export default function EditOrder() {
  const { customerId, orderId } = useParams<{
    customerId: string;
    orderId: string;
  }>();

  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId || !orderId) {
      setLoading(false);
      return;
    }

    Promise.all([
      customerService.getCustomer(customerId),
      orderService.getOrder(orderId),
    ])
      .then(([c, o]) => {
        if (!c || !o) {
          navigate(`/admin/customers/${customerId}`);
        } else {
          setCustomer(c);
          setOrder(o);
        }
      })
      .catch((error) => {
        console.error('Error loading order:', error);
        navigate(`/admin/customers/${customerId}`);
      })
      .finally(() => setLoading(false));
  }, [customerId, orderId, navigate]);

  const handleSubmit = async (data: OrderFormData) => {
    if (!orderId) return;

    setIsLoading(true);

    try {
      await orderService.updateOrder(orderId, data);
      navigate(`/admin/customers/${customerId}`);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer || !order) return null;

  // Load existing order values, including its measurement snapshot.
  const initialData: OrderFormData = {
    customerId: order.customerId,
    customerName: order.customerName,
    mobileNumber: order.mobileNumber,
    orderType: order.orderType || '👚 Blouse',
    quantity: order.quantity || 1,
    orderDate: order.orderDate,
    deliveryDate: order.deliveryDate,
    status: order.status,
    advanceAmount: order.advanceAmount,
    totalAmount: order.totalAmount,
    referencePhotoUrl: order.referencePhotoUrl || '',
    designRemarks: order.designRemarks || '',
    measurementSnapshot: order.measurementSnapshot
      ? { ...order.measurementSnapshot }
      : undefined,
    notes: order.notes || '',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/admin/customers/${customerId}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div>
          <h1 className="text-2xl font-serif text-gray-900">
            Edit Order
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            #{order.orderId}
          </p>
        </div>
      </div>

      <SimpleOrderForm
        initialCustomerName={customer.customerName}
        initialMobileNumber={customer.mobileNumber}
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
