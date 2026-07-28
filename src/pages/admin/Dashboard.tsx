import { useState, useEffect } from 'react';
import { IndianRupee, Wallet, Clock, CheckCircle } from 'lucide-react';
import { paymentService } from '../../services/paymentService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaysCollection: 0,
    monthlyCollection: 0,
    pendingCollection: 0,
    fullyPaidOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const paymentStats = await paymentService.getDashboardStats();
        setStats(paymentStats);
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: "Today's Collection", value: `₹ ${stats.todaysCollection}`, icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Monthly Collection', value: `₹ ${stats.monthlyCollection}`, icon: Wallet, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Pending Collection', value: `₹ ${stats.pendingCollection}`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Fully Paid Orders', value: stats.fullyPaidOrders, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
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
