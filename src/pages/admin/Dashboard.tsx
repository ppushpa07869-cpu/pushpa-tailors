import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, ShoppingBag, IndianRupee, Wallet, 
  Clock, AlertCircle, CheckCircle, Activity, Calendar as CalendarIcon, TrendingUp
} from 'lucide-react';
import { dashboardService, type DashboardData } from '../../services/dashboardService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardData = await dashboardService.getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { stats, charts } = data;

  const statCards = [
    { name: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', link: '/admin/reports?tab=customer' },
    { name: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-100', link: '/admin/reports?tab=order' },
    { name: "Today's Collection", value: `₹ ${stats.todaysCollection}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-100', link: '/admin/reports?tab=payment&date=today' },
    { name: 'Monthly Collection', value: `₹ ${stats.monthlyCollection}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100', link: '/admin/reports?tab=payment&date=month' },
    { name: 'Pending Collection', value: `₹ ${stats.pendingCollection}`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100', link: '/admin/reports?tab=order&paymentStatus=Pending' },
    { name: 'Orders Due Today', value: stats.ordersDueToday, icon: CalendarIcon, color: 'text-yellow-600', bg: 'bg-yellow-100', link: '/admin/reports?tab=delivery&status=due_today' },
    { name: 'Overdue Orders', value: stats.overdueOrders, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', link: '/admin/reports?tab=delivery&status=overdue' },
    { name: 'Fully Paid Orders', value: stats.fullyPaidOrders, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-100', link: '/admin/reports?tab=order&paymentStatus=Fully Paid' },
    { name: 'Orders In Progress', value: stats.ordersInProgress, icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-100', link: '/admin/reports?tab=order&status=In Progress' },
    { name: 'Monthly Revenue', value: `₹ ${stats.monthlyRevenue}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100', link: '/admin/reports?tab=payment&date=month' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-gray-900 tracking-wide">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1 font-medium">Real-time business analytics and metrics.</p>
      </div>
      
      {/* 10 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div 
            key={stat.name} 
            onClick={() => navigate(stat.link)}
            className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer transform hover:-translate-y-1"
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-2 rounded-md ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} aria-hidden="true" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-bold text-gray-900 mt-1">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
          <h3 className="text-lg font-serif text-gray-900 mb-6">Monthly Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Per Month */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
          <h3 className="text-lg font-serif text-gray-900 mb-6">Orders Per Month</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ordersPerMonthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [value, 'Orders']} cursor={{fill: 'transparent'}} />
                <Bar dataKey="orders" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
          <h3 className="text-lg font-serif text-gray-900 mb-6">Orders by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.ordersByStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.ordersByStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
          <h3 className="text-lg font-serif text-gray-900 mb-6">Revenue by Payment Method</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {charts.paymentMethodsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
