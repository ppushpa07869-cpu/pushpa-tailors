import { useState, useEffect } from 'react';
import { Users, FileImage, CreditCard, Activity } from 'lucide-react';
import { customerService } from '../../services/customerService';

export default function Dashboard() {
  const [customerCount, setCustomerCount] = useState<number | string>('...');

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const customers = await customerService.getCustomers();
        setCustomerCount(customers.length.toString());
      } catch (error) {
        console.error("Error fetching customer count", error);
        setCustomerCount('Error');
      }
    };
    fetchCount();
  }, []);

  const stats = [
    { name: 'Total Designs', value: '1,245', icon: FileImage, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Pending Payments', value: '$4,520', icon: CreditCard, color: 'text-red-600', bg: 'bg-red-100' },
    { name: 'Customers', value: customerCount, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Recent Activity', value: '42', icon: Activity, color: 'text-secondary', bg: 'bg-yellow-100' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-sm">
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white shadow-sm border border-gray-100 rounded-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 font-serif">Recent Orders</h3>
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">This is a placeholder dashboard.</p>
          <p className="text-sm">Firestore integration will be added in a future phase.</p>
        </div>
      </div>
    </div>
  );
}
