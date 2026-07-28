import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IndianRupee, 
  ShoppingBag, 
  Truck, 
  Clock, 
  ChevronRight,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  Scissors
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardData } from '../../services/dashboardService';
import { getStatusColor } from '../../utils/orderUtils';

const TIPS = [
  { en: "Collect pending payments before delivery.", te: "డెలివరీకి ముందు పెండింగ్ చెల్లింపులు వసూలు చేయండి." },
  { en: "Verify measurements before stitching.", te: "కుట్టడానికి ముందు కొలతలను సరిచూసుకోండి." },
  { en: "Call customers one day before delivery.", te: "డెలివరీకి ఒక రోజు ముందు కస్టమర్లకు కాల్ చేయండి." },
  { en: "Update order status promptly to avoid confusion.", te: "గందరగోళాన్ని నివారించడానికి ఆర్డర్ స్థితిని వెంటనే అప్‌డేట్ చేయండి." }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tipOfTheDay, setTipOfTheDay] = useState(TIPS[0]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await dashboardService.getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Pick random tip
    setTipOfTheDay(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="text-gray-400 font-medium">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const today = new Date().toISOString().split('T')[0];

  const STATUS_ICONS: Record<string, React.ReactNode> = {
    'New': <ShoppingBag className="h-5 w-5 text-blue-600" />,
    'Cutting': <Scissors className="h-5 w-5 text-yellow-600" />,
    'Stitching': <Clock className="h-5 w-5 text-orange-600" />,
    'Ready': <CheckCircle className="h-5 w-5 text-purple-600" />,
    'Delivered': <Truck className="h-5 w-5 text-green-600" />,
    'Cancelled': <AlertCircle className="h-5 w-5 text-red-600" />
  };

  const EmptyState = ({ message, subtitle }: { message: string, subtitle?: string }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
      <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
        <CheckCircle className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">{message}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Collection</p>
                <p className="text-xs text-gray-400 mt-0.5">(ఈరోజు మొత్తం)</p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-xl shadow-inner">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">₹{data.stats.todaysCollection}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">New Orders</p>
                <p className="text-xs text-gray-400 mt-0.5">(కొత్త ఆర్డర్లు)</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-inner">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{data.stats.newOrdersCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Deliveries</p>
                <p className="text-xs text-gray-400 mt-0.5">(ఈరోజు డెలివరీలు)</p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl shadow-inner">
                <Truck className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{data.stats.deliveriesTodayCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Collection</p>
                <p className="text-xs text-gray-400 mt-0.5">(బాకీ మొత్తం)</p>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shadow-inner">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-orange-600">₹{data.stats.pendingCollection}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pending Payments Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-gray-900">Pending Payments</h2>
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">{data.pendingPayments.length} Action Needed</span>
            </div>
            
            {data.pendingPayments.length === 0 ? (
              <EmptyState message="No Pending Payments!" subtitle="All collections are up to date." />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {data.pendingPayments.map(order => {
                    const isOverdue = order.deliveryDate < today;
                    return (
                      <div 
                        key={order.id} 
                        className={`p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                          isOverdue ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-lg">{order.customerName}</span>
                            {isOverdue && (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-sm">
                                <AlertCircle className="h-3 w-3" /> Overdue
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mb-2">{order.mobileNumber} • #{order.orderId}</div>
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-xs text-gray-400">Remaining</span>
                              <div className="font-bold text-orange-600 text-lg">₹{order.remainingAmount}</div>
                            </div>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div>
                              <span className="text-xs text-gray-400">Due Date</span>
                              <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                {new Date(order.deliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/admin/orders/view/${order.id}?action=pay`)}
                          className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-sm shadow-primary/20 hover:bg-secondary transition-colors"
                        >
                          <span>💰 Receive Payment</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Today's Deliveries Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-gray-900">Today's Deliveries</h2>
            </div>
            
            {data.todaysDeliveries.length === 0 ? (
              <EmptyState message="No Deliveries Today" subtitle="Relax, your schedule is clear." />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {data.todaysDeliveries.map(order => {
                    const isOverdue = order.deliveryDate < today;
                    return (
                      <div 
                        key={order.id} 
                        className={`p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                          isOverdue ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-lg">{order.customerName}</span>
                            {isOverdue && (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-sm">
                                <AlertCircle className="h-3 w-3" /> Overdue
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mb-2">{order.mobileNumber} • #{order.orderId}</div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                              {order.status.split(' (')[0]}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              order.paymentStatus === 'Fully Paid' ? 'bg-green-100 text-green-800' : 
                              order.paymentStatus === 'Partially Paid' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/admin/orders/view/${order.id}`)}
                          className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                          <Truck className="h-5 w-5 text-gray-400" />
                          <span>Open Delivery</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Recent Orders Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-gray-900">Recent Orders</h2>
            </div>
            
            {data.recentOrders.length === 0 ? (
              <EmptyState message="No Recent Orders" />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="hidden md:grid grid-cols-7 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">Order & Customer</div>
                  <div>Status</div>
                  <div className="text-right">Total</div>
                  <div className="text-right">Paid</div>
                  <div className="text-right">Remaining</div>
                  <div className="text-right">Action</div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {data.recentOrders.slice(0, 5).map(order => (
                    <div 
                      key={order.id} 
                      onClick={() => navigate(`/admin/orders/view/${order.id}`)}
                      className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 items-center hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="md:col-span-2">
                        <div className="font-bold text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500">#{order.orderId} • {new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                      </div>
                      <div className="py-2 md:py-0">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${getStatusColor(order.status)}`}>
                          {order.status.split(' (')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between md:block text-right">
                        <span className="md:hidden text-xs text-gray-500">Total: </span>
                        <span className="font-medium text-gray-900">₹{order.totalAmount}</span>
                      </div>
                      <div className="flex justify-between md:block text-right">
                        <span className="md:hidden text-xs text-gray-500">Paid: </span>
                        <span className="font-medium text-green-600">₹{order.paidAmount || 0}</span>
                      </div>
                      <div className="flex justify-between md:block text-right">
                        <span className="md:hidden text-xs text-gray-500">Remaining: </span>
                        <span className="font-bold text-orange-600">₹{order.remainingAmount || 0}</span>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <span className="inline-flex items-center text-sm font-medium text-primary group-hover:text-secondary">
                          Open <ChevronRight className="h-4 w-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Section 1: Orders by Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-serif text-gray-900 mb-6">Orders by Status</h2>
            <div className="space-y-3">
              {['New', 'Cutting', 'Stitching', 'Ready', 'Delivered', 'Cancelled'].map((statusKey) => {
                const count = data.statusCounts[statusKey] || 0;
                return (
                  <button
                    key={statusKey}
                    onClick={() => navigate('/admin/orders')}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                        {STATUS_ICONS[statusKey]}
                      </div>
                      <span className="font-medium text-gray-900">{statusKey}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Collection Summary */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
            <h2 className="text-xl font-serif text-white mb-6 relative z-10">Collection Summary</h2>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <IndianRupee className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Today</div>
                    <div className="text-xs text-gray-500">ఈరోజు</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-white">₹{data.collectionSummary.today}</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <IndianRupee className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">This Week</div>
                    <div className="text-xs text-gray-500">ఈ వారం</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-white">₹{data.collectionSummary.thisWeek}</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <IndianRupee className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">This Month</div>
                    <div className="text-xs text-gray-500">ఈ నెల</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-white">₹{data.collectionSummary.thisMonth}</div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-orange-300">Pending</div>
                    <div className="text-xs text-orange-400/70">బాకీ మొత్తం</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-400">₹{data.collectionSummary.pending}</div>
              </div>
            </div>
          </div>

          {/* Professional Tip Card */}
          <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -z-0 opacity-50" />
            <div className="relative z-10 flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  Tip of the Day 💡
                </h3>
                <p className="text-gray-700 text-sm mb-2">{tipOfTheDay.en}</p>
                <p className="text-gray-500 text-xs italic">({tipOfTheDay.te})</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
