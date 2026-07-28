import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { orderService } from '../../../services/orderService';
import type { Order } from '../../../types/order';
import OrderTable from '../../../components/admin/orders/OrderTable';
import OrderCard from '../../../components/admin/orders/OrderCard';
import OrderFilters from '../../../components/admin/orders/OrderFilters';

export default function OrdersList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (order: Order) => {
    if (window.confirm(`Are you sure you want to delete order ${order.orderId}? This action cannot be undone.`)) {
      try {
        await orderService.deleteOrder(order.id);
        fetchOrders();
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order.");
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Search filtering
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.mobileNumber.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Status filtering
    const today = new Date().toISOString().split('T')[0];
    
    switch (statusFilter) {
      case 'today':
        return order.deliveryDate === today;
      case 'pending':
        return order.status !== 'Delivered (డెలివరీ అయింది)' && order.status !== 'Cancelled (రద్దు)';
      case 'delivered':
        return order.status === 'Delivered (డెలివరీ అయింది)';
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-wide">Orders</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage customer orders and stitching status.</p>
        </div>
        <button
          onClick={() => navigate('/admin/orders/add')}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-sm hover:bg-secondary transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline font-medium">New Order</span>
        </button>
      </div>

      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <OrderTable
            orders={filteredOrders}
            onView={(order) => navigate(`/admin/orders/view/${order.id}`)}
            onEdit={(order) => navigate(`/admin/orders/edit/${order.id}`)}
            onDelete={handleDelete}
          />
          <OrderCard
            orders={filteredOrders}
            onView={(order) => navigate(`/admin/orders/view/${order.id}`)}
            onEdit={(order) => navigate(`/admin/orders/edit/${order.id}`)}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
