import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../../../services/orderService';
import type { Order, OrderFormData } from '../../../types/order';
import OrderForm from '../../../components/admin/orders/OrderForm';

export default function EditOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const data = await orderService.getOrder(orderId);
        if (data) {
          setOrder(data);
        } else {
          alert("Order not found!");
          navigate('/admin/orders');
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        alert("Failed to load order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  const handleSubmit = async (data: OrderFormData) => {
    if (!orderId) return;
    setIsSubmitting(true);
    try {
      await orderService.updateOrder(orderId, data);
      navigate('/admin/orders');
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  const initialData: OrderFormData = {
    customerId: order.customerId,
    customerName: order.customerName,
    mobileNumber: order.mobileNumber,
    measurementId: order.measurementId,
    measurementType: order.measurementType,
    orderDate: order.orderDate,
    deliveryDate: order.deliveryDate,
    status: order.status,
    advanceAmount: order.advanceAmount,
    totalAmount: order.totalAmount,
    notes: order.notes || '',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif text-gray-900 tracking-wide">Edit Order (ఆర్డర్ మార్చండి)</h1>
        <p className="text-gray-500 mt-1 font-medium">Update existing order details for {order.orderId}.</p>
      </div>

      <OrderForm 
        initialData={initialData} 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
      />
    </div>
  );
}
