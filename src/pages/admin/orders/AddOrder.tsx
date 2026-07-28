import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/orderService';
import type { OrderFormData } from '../../../types/order';
import OrderForm from '../../../components/admin/orders/OrderForm';

export default function AddOrder() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      await orderService.addOrder(data);
      navigate('/admin/orders');
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif text-gray-900 tracking-wide">New Order (కొత్త ఆర్డర్)</h1>
        <p className="text-gray-500 mt-1 font-medium">Create a new stitching order.</p>
      </div>

      <OrderForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
