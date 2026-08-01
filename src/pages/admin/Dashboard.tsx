import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, CheckCircle, IndianRupee, ChevronRight } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardData } from '../../services/dashboardService';
import { paymentReminderService } from '../../services/paymentReminderService';
import { pushNotificationService } from '../../services/pushNotificationService';
import { getStatusColor, getStatusIcon } from '../../utils/orderUtils';
import NewOrderModal from '../../components/admin/orders/NewOrderModal';
import PaymentSummaryCard from '../../components/admin/dashboard/PaymentSummaryCard';
import PaymentRemindersSection from '../../components/admin/dashboard/PaymentRemindersSection';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const remindersSectionRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    dashboardService.getDashboardData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();

    // Register service worker stub for PWA Push architecture
    if (pushNotificationService.isSupported()) {
      pushNotificationService.registerServiceWorker().catch(() => {});
    }
  }, [loadData]);

  const scrollToReminders = () => {
    remindersSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Compute Payment Summary
  const paymentSummary = paymentReminderService.getDashboardPaymentSummary(
    data.allPayments || [],
    data.allOrders || []
  );

  const summaryCards = [
    {
      label: 'Total Customers',
      labelTe: 'మొత్తం కస్టమర్లు',
      value: data.stats.totalCustomers,
      icon: Users,
      color: 'blue',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      accentBg: 'bg-blue-500',
      route: '/admin/customers',
    },
    {
      label: 'Active Orders',
      labelTe: 'యాక్టివ్ ఆర్డర్లు',
      value: data.stats.activeOrders,
      icon: Package,
      color: 'orange',
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      accentBg: 'bg-orange-500',
      route: '/admin/customers',
    },
    {
      label: 'Ready Orders',
      labelTe: 'రెడీ ఆర్డర్లు',
      value: data.stats.readyOrders,
      icon: CheckCircle,
      color: 'green',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      accentBg: 'bg-green-500',
      route: '/admin/customers',
    },
    {
      label: 'Pending Payments',
      labelTe: 'పెండింగ్ చెల్లింపులు',
      value: data.stats.pendingPayments,
      icon: IndianRupee,
      color: 'red',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      accentBg: 'bg-red-500',
      action: scrollToReminders,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">

      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-wide">{greeting} 👋</h1>
          <p className="text-gray-500 mt-1">Here's your smart payment overview at Pushpa Tailors.</p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-sm"
        >
          <span className="text-lg">➕</span> New Order
        </button>
      </div>

      {/* 1. Premium Dashboard Payment Summary Card */}
      <PaymentSummaryCard 
        summary={paymentSummary} 
        onViewRemindersClick={scrollToReminders} 
      />

      {/* 2. Four Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const handleClick = () => {
            if (card.action) {
              card.action();
            } else if (card.route) {
              navigate(card.route);
            }
          };

          return (
            <button
              key={card.label}
              onClick={handleClick}
              className={`${card.bg} rounded-2xl p-5 md:p-6 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden border border-white/60`}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 ${card.accentBg} opacity-5 rounded-bl-full`} />
              <div className={`h-12 w-12 ${card.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{card.value}</div>
              <div className="text-sm font-semibold text-gray-700">{card.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.labelTe}</div>
              <ChevronRight className="absolute bottom-4 right-4 h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </button>
          );
        })}
      </div>

      {/* 3. Smart Payment Reminders Section */}
      <div ref={remindersSectionRef}>
        <PaymentRemindersSection
          orders={data.allOrders || []}
          payments={data.allPayments || []}
          onRefreshData={loadData}
        />
      </div>

      {/* 4. Secondary Grid: Alerts, Recent Orders & Collection Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Alerts & Recent Orders */}
        <div className="lg:col-span-2 space-y-8">

          {/* Action Required / Overdue Notifications */}
          {data.notifications.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif text-gray-900">⚠️ Action Required</h2>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                  {data.notifications.length} alerts
                </span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {data.notifications.slice(0, 5).map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => navigate(`/admin/customers/${notif.customerId}?orderId=${notif.orderId}`)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <span className="text-2xl flex-shrink-0">{notif.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{notif.customerName}</div>
                      <div className="text-sm text-gray-500">{notif.message}</div>
                      {notif.remainingAmount > 0 && (
                        <div className="text-xs text-orange-600 font-medium mt-0.5">₹{notif.remainingAmount} pending</div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-gray-900">📋 Recent Orders</h2>
            </div>
            {data.recentOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-500">No orders yet. Start by adding a customer.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {data.recentOrders.slice(0, 6).map(order => (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/admin/customers/${order.customerId}?orderId=${order.id}`)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">#{order.orderId}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                    <span className={`text-sm font-bold flex-shrink-0 ${order.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      ₹{order.remainingAmount > 0 ? order.remainingAmount : order.totalAmount}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Collection Breakdown & Quick Navigation */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden border border-gray-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
            <h2 className="text-xl font-serif text-white mb-6 relative z-10">💵 Collection History</h2>
            <div className="space-y-5 relative z-10">
              {[
                { label: 'Today', labelTe: 'ఈరోజు', value: data.collectionSummary.today, color: 'text-green-400' },
                { label: 'This Week', labelTe: 'ఈ వారం', value: data.collectionSummary.thisWeek, color: 'text-blue-400' },
                { label: 'This Month', labelTe: 'ఈ నెల', value: data.collectionSummary.thisMonth, color: 'text-purple-400' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-400">{item.label}</div>
                    <div className="text-xs text-gray-600">{item.labelTe}</div>
                  </div>
                  <div className={`text-xl font-bold ${item.color}`}>₹{item.value.toLocaleString('en-IN')}</div>
                </div>
              ))}
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-orange-300">Total Pending</div>
                  <div className="text-xs text-orange-400/70">బాకీ మొత్తం</div>
                </div>
                <div className="text-2xl font-bold text-orange-400">₹{data.collectionSummary.pending.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-serif font-bold text-gray-900 mb-4">Quick Navigation</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => setIsNewOrderModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-left text-sm shadow-md shadow-primary/20"
              >
                <span className="text-lg">➕</span> New Order
              </button>
              <button
                onClick={() => navigate('/admin/customers')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-left text-sm"
              >
                <span className="text-lg">👥</span> View All Customers
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-left text-sm"
              >
                <span className="text-lg">📊</span> Business Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => {
          setIsNewOrderModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
