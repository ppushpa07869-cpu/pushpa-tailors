import { useState, useEffect } from 'react';
import { ShoppingBag, Truck, Clock, CheckCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todaysDeliveries: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const orderStats = await orderService.getDashboardStats();
        setStats(orderStats);
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: "Today's Deliveries", value: stats.todaysDeliveries, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Delivered Orders', value: stats.deliveredOrders, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-serif text-gray-900 mb-8 tracking-wide">Dashboard Overview</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-md ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-white shadow-sm border border-gray-100 rounded-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 font-serif">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/orders/add" className="block p-4 border border-gray-200 rounded-sm hover:border-primary hover:bg-gray-50 transition-colors text-center font-medium text-gray-700">
            Create New Order
          </a>
          <a href="/admin/customers/add" className="block p-4 border border-gray-200 rounded-sm hover:border-primary hover:bg-gray-50 transition-colors text-center font-medium text-gray-700">
            Add New Customer
          </a>
          <a href="/admin/orders" className="block p-4 border border-gray-200 rounded-sm hover:border-primary hover:bg-gray-50 transition-colors text-center font-medium text-gray-700">
            View All Orders
          </a>
        </div>
      </div>
    </div>
  );
}
