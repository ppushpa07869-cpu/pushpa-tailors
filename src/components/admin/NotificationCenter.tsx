import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, ArrowRight, Calendar, IndianRupee } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import type { AppNotification } from '../../services/dashboardService';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      dashboardService.getDashboardData()
        .then(data => setNotifications(data.notifications))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleNotificationClick = (notif: AppNotification) => {
    onClose();
    navigate(`/admin/customers/${notif.customerId}?orderId=${notif.orderId}`);
  };

  const getNotificationDetails = (type: AppNotification['type']) => {
    switch (type) {
      case 'overdue':
        return { bg: 'border-l-4 border-l-red-500 bg-red-50/70', badge: 'Overdue Delivery', badgeColor: 'bg-red-100 text-red-700' };
      case 'today':
        return { bg: 'border-l-4 border-l-orange-500 bg-orange-50/70', badge: 'Delivery Today', badgeColor: 'bg-orange-100 text-orange-700' };
      case 'tomorrow':
        return { bg: 'border-l-4 border-l-yellow-500 bg-yellow-50/70', badge: 'Delivery Tomorrow', badgeColor: 'bg-yellow-100 text-yellow-800' };
      case 'ready':
        return { bg: 'border-l-4 border-l-green-500 bg-green-50/70', badge: 'Ready for Pickup', badgeColor: 'bg-green-100 text-green-800' };
      case 'pending_payment':
        return { bg: 'border-l-4 border-l-blue-500 bg-blue-50/70', badge: 'Pending Payment', badgeColor: 'bg-blue-100 text-blue-800' };
      default:
        return { bg: 'border-l-4 border-l-gray-300 bg-gray-50', badge: 'Notification', badgeColor: 'bg-gray-100 text-gray-700' };
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-semibold text-gray-900">Notification Center</h2>
              <p className="text-xs text-gray-500">{notifications.length} actionable alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading alerts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center">
              <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-900">All Clear!</h3>
              <p className="text-sm text-gray-500">No urgent alerts. Everything is on track.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map(notif => {
                const details = getNotificationDetails(notif.type);
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left p-4 hover:brightness-95 transition-all group ${details.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-gray-900 truncate">{notif.customerName}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-primary flex-shrink-0 transition-colors" />
                        </div>
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md mb-1.5 ${details.badgeColor}`}>
                          {details.badge}
                        </span>
                        <p className="text-sm text-gray-600 mb-1.5">{notif.message}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(notif.deliveryDate)}
                          </span>
                          {notif.remainingAmount > 0 && (
                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                              <IndianRupee className="h-3 w-3" />
                              ₹{notif.remainingAmount} due
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400 text-center">
            Click any notification to open the customer workspace
          </p>
        </div>
      </div>
    </>
  );
}

