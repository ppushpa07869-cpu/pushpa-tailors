import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, MessageSquare, ExternalLink, IndianRupee, Clock,
  Calendar, CheckCircle2, AlertTriangle, Filter
} from 'lucide-react';
import type { Order } from '../../../types/order';
import type { Payment } from '../../../types/payment';
import type { ReminderPriority, PaymentReminder } from '../../../types/reminder';
import { 
  paymentReminderService, 
  PRIORITY_BADGES, 
  generateWhatsAppUrl,
  snoozeReminder,
  clearSnooze
} from '../../../services/paymentReminderService';
import { paymentService } from '../../../services/paymentService';
import ReceivePaymentModal from '../orders/ReceivePaymentModal';
import type { PaymentFormData } from '../../../types/payment';

interface PaymentRemindersSectionProps {
  orders: Order[];
  payments: Payment[];
  onRefreshData?: () => void;
}

export default function PaymentRemindersSection({ 
  orders, 
  onRefreshData 
}: PaymentRemindersSectionProps) {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<'all' | ReminderPriority | 'snoozed'>('all');
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [whatsappModalReminder, setWhatsappModalReminder] = useState<PaymentReminder | null>(null);
  const [snoozeModalReminder, setSnoozeModalReminder] = useState<PaymentReminder | null>(null);

  // Payment Modal state
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<{
    order: Order;
    reminder: PaymentReminder;
  } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Compute Reminders
  const allRemindersIncludingSnoozed = useMemo(() => {
    return paymentReminderService.getPaymentReminders(orders, true);
  }, [orders]);

  const activeReminders = useMemo(() => {
    return allRemindersIncludingSnoozed.filter(r => !r.isSnoozed);
  }, [allRemindersIncludingSnoozed]);

  const snoozedReminders = useMemo(() => {
    return allRemindersIncludingSnoozed.filter(r => r.isSnoozed);
  }, [allRemindersIncludingSnoozed]);

  // Summaries
  const weeklySummary = useMemo(() => {
    return paymentReminderService.getWeeklySummary(allRemindersIncludingSnoozed);
  }, [allRemindersIncludingSnoozed]);

  const monthlySummary = useMemo(() => {
    return paymentReminderService.getMonthlySummary(allRemindersIncludingSnoozed);
  }, [allRemindersIncludingSnoozed]);

  // Filtered Reminders based on Tab
  const displayedReminders = useMemo(() => {
    if (activeTab === 'snoozed') return snoozedReminders;
    if (activeTab === 'all') return activeReminders;
    return activeReminders.filter(r => r.priority === activeTab);
  }, [activeTab, activeReminders, snoozedReminders]);

  // Handlers
  const handleOpenReceivePayment = (reminder: PaymentReminder) => {
    const primaryOrder = orders.find(o => o.id === reminder.pendingOrders[0]?.id) || {
      id: reminder.pendingOrders[0]?.id || '',
      orderId: reminder.pendingOrders[0]?.orderId || '',
      customerId: reminder.customerId,
      customerName: reminder.customerName,
      mobileNumber: reminder.mobileNumber,
      orderDate: reminder.pendingOrders[0]?.orderDate || '',
      deliveryDate: reminder.pendingOrders[0]?.deliveryDate || '',
      status: reminder.pendingOrders[0]?.status as any || 'Pending',
      paymentStatus: 'Partially Paid' as any,
      advanceAmount: 0,
      paidAmount: reminder.pendingOrders[0]?.paidAmount || 0,
      remainingAmount: reminder.pendingOrders[0]?.remainingAmount || reminder.totalPendingAmount,
      totalAmount: reminder.pendingOrders[0]?.totalAmount || reminder.totalPendingAmount,
      notes: '',
      createdAt: null,
      updatedAt: null,
    };

    setSelectedOrderForPayment({ order: primaryOrder, reminder });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    if (!selectedOrderForPayment) return;
    setIsSubmittingPayment(true);
    try {
      await paymentService.addPayment(selectedOrderForPayment.order.id, formData);
      setIsPaymentModalOpen(false);
      setSelectedOrderForPayment(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to submit payment:', err);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleSnoozeSelect = (days: 1 | 3 | 7) => {
    if (!snoozeModalReminder) return;
    snoozeReminder(snoozeModalReminder.id, days);
    setSnoozeModalReminder(null);
    if (onRefreshData) onRefreshData();
  };

  const handleUnSnooze = (reminderId: string) => {
    clearSnooze(reminderId);
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">
              Payment Reminders
            </h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
              {activeReminders.length} Pending
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Smart automated payment collection alerts based on Delivery Date
          </p>
        </div>

        {/* Action Buttons: Weekly & Monthly Summary Popups */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowWeeklyModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all border border-blue-200 shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            Weekly Summary
          </button>
          
          <button
            onClick={() => setShowMonthlyModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-all border border-purple-200 shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            Monthly Summary
          </button>
        </div>
      </div>

      {/* Priority Level Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          All ({activeReminders.length})
        </button>

        {(['critical', 'high_priority', 'follow_up', 'reminder'] as ReminderPriority[]).map((level) => {
          const badge = PRIORITY_BADGES[level];
          const count = activeReminders.filter(r => r.priority === level).length;
          const isActive = activeTab === level;

          return (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? `${badge.badgeBg} ring-2 ring-offset-1 ring-gray-400 font-extrabold shadow-sm`
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
              <span className="opacity-75">({count})</span>
            </button>
          );
        })}

        {snoozedReminders.length > 0 && (
          <button
            onClick={() => setActiveTab('snoozed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'snoozed'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>⏰ Snoozed</span>
            <span>({snoozedReminders.length})</span>
          </button>
        )}
      </div>

      {/* Reminder Cards Grid */}
      {displayedReminders.length === 0 ? (
        <div className="bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-8 text-center space-y-3">
          <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-serif font-bold text-gray-900">No Pending Reminders Here!</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {activeTab === 'snoozed' 
              ? 'No reminders are currently snoozed.' 
              : 'Great job! All payments for this priority category have been cleared.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedReminders.map((reminder) => {
            const priorityInfo = PRIORITY_BADGES[reminder.priority];
            const primaryOrder = reminder.pendingOrders[0];

            return (
              <div
                key={reminder.id}
                className={`bg-white rounded-2xl p-5 border ${priorityInfo.borderColor} shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${priorityInfo.badgeBg}`}>
                    <span>{priorityInfo.icon}</span>
                    <span>{priorityInfo.label}</span>
                  </span>

                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-red-600 font-extrabold">{reminder.daysPending}</span> Days Pending
                  </span>
                </div>

                {/* Customer Details */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-base group-hover:text-primary transition-colors truncate">
                      {reminder.customerName}
                    </h3>
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="font-medium">{reminder.mobileNumber}</span>
                    {primaryOrder && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-600 font-mono">
                        #{primaryOrder.orderId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <span>Delivery Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(reminder.oldestDeliveryDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Pending Amount */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-gray-500">Pending Amount:</span>
                    <div className="text-xl font-extrabold text-orange-600 flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {reminder.totalPendingAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Snoozed Banner if active */}
                {reminder.isSnoozed && (
                  <div className="bg-amber-50 rounded-xl p-2 mb-3 border border-amber-200 text-amber-800 text-xs flex justify-between items-center">
                    <span>Snoozed until {reminder.snoozeUntil}</span>
                    <button
                      onClick={() => handleUnSnooze(reminder.id)}
                      className="font-bold text-amber-900 underline text-[11px]"
                    >
                      Resume
                    </button>
                  </div>
                )}

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-gray-100">
                  {/* 📞 Call */}
                  <a
                    href={`tel:${reminder.mobileNumber}`}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-colors border border-gray-200/60 text-center"
                    title="Call Customer"
                  >
                    <Phone className="h-4 w-4 text-green-600" />
                    <span className="text-[10px] font-bold mt-1">Call</span>
                  </a>

                  {/* 💬 WhatsApp */}
                  <button
                    onClick={() => setWhatsappModalReminder(reminder)}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 transition-colors border border-gray-200/60 text-center"
                    title="WhatsApp Reminder"
                  >
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <span className="text-[10px] font-bold mt-1">Chat</span>
                  </button>

                  {/* 👁 Open Order */}
                  <button
                    onClick={() => navigate(`/admin/customers/${reminder.customerId}?orderId=${primaryOrder?.id || ''}`)}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors border border-gray-200/60 text-center"
                    title="Open Customer Order"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <span className="text-[10px] font-bold mt-1">View</span>
                  </button>

                  {/* 💰 Receive Payment */}
                  <button
                    onClick={() => handleOpenReceivePayment(reminder)}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors border border-primary/20 text-center"
                    title="Receive Payment"
                  >
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-[10px] font-bold mt-1">Collect</span>
                  </button>

                  {/* ⏰ Remind Later (Snooze) */}
                  <button
                    onClick={() => setSnoozeModalReminder(reminder)}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-colors border border-gray-200/60 text-center"
                    title="Remind Later (Snooze)"
                  >
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-[10px] font-bold mt-1">Snooze</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. Receive Payment Modal */}
      {selectedOrderForPayment && (
        <ReceivePaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedOrderForPayment(null);
          }}
          onSubmit={handlePaymentSubmit}
          totalAmount={selectedOrderForPayment.order.totalAmount}
          paidAmount={selectedOrderForPayment.order.paidAmount}
          remainingAmount={selectedOrderForPayment.order.remainingAmount}
          isLoading={isSubmittingPayment}
        />
      )}

      {/* 2. WhatsApp Language Choice Modal */}
      {whatsappModalReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                Send WhatsApp Reminder
              </h3>
              <button
                onClick={() => setWhatsappModalReminder(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
              <div className="font-bold text-gray-900">{whatsappModalReminder.customerName}</div>
              <div className="text-xs text-gray-500">Phone: {whatsappModalReminder.mobileNumber}</div>
              <div className="text-sm font-bold text-orange-600">Pending Amount: ₹{whatsappModalReminder.totalPendingAmount}</div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-600">Select Message Language:</p>
              
              {/* Telugu Option */}
              <a
                href={generateWhatsAppUrl(
                  whatsappModalReminder.mobileNumber,
                  whatsappModalReminder.customerName,
                  whatsappModalReminder.totalPendingAmount,
                  'te'
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWhatsappModalReminder(null)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all group font-semibold text-sm"
              >
                <span>తెలుగు (Telugu Message)</span>
                <span className="group-hover:translate-x-1 transition-transform">➡️</span>
              </a>

              {/* English Option */}
              <a
                href={generateWhatsAppUrl(
                  whatsappModalReminder.mobileNumber,
                  whatsappModalReminder.customerName,
                  whatsappModalReminder.totalPendingAmount,
                  'en'
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWhatsappModalReminder(null)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-all group font-semibold text-sm"
              >
                <span>English Message</span>
                <span className="group-hover:translate-x-1 transition-transform">➡️</span>
              </a>
            </div>

            <button
              onClick={() => setWhatsappModalReminder(null)}
              className="w-full py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 3. Snooze / Remind Later Modal */}
      {snoozeModalReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Remind Later (Snooze)
              </h3>
              <button
                onClick={() => setSnoozeModalReminder(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Hide reminder for <strong>{snoozeModalReminder.customerName}</strong> temporarily. Payment status will remain unchanged.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSnoozeSelect(1)}
                className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-sm text-left flex justify-between items-center transition-all"
              >
                <span>Tomorrow (1 Day)</span>
                <Clock className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleSnoozeSelect(3)}
                className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-sm text-left flex justify-between items-center transition-all"
              >
                <span>In 3 Days</span>
                <Clock className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleSnoozeSelect(7)}
                className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-sm text-left flex justify-between items-center transition-all"
              >
                <span>In 7 Days (1 Week)</span>
                <Clock className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setSnoozeModalReminder(null)}
              className="w-full py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 4. Weekly Summary Modal */}
      {showWeeklyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-serif font-bold">
                  📅
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-gray-900">Weekly Summary</h3>
                  <p className="text-[11px] text-gray-500">Auto-generated every Monday</p>
                </div>
              </div>
              <button
                onClick={() => setShowWeeklyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 font-semibold">Pending Customers</span>
                  <span className="text-xl font-bold text-blue-900">{weeklySummary.pendingCustomersCount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                  <span className="text-xs text-gray-600 font-semibold">Total Pending Amount</span>
                  <span className="text-xl font-bold text-orange-600 flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {weeklySummary.totalPendingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                  <span className="text-xs text-gray-600 font-semibold">Average Pending Days</span>
                  <span className="text-xl font-bold text-gray-900">{weeklySummary.averagePendingDays} Days</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>Weekly summary helps you review overall outstanding risk every Monday.</span>
              </div>
            </div>

            <button
              onClick={() => setShowWeeklyModal(false)}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 text-xs transition-colors shadow-sm"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}

      {/* 5. Monthly Summary Modal */}
      {showMonthlyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-serif font-bold">
                  📊
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-gray-900">Monthly Summary</h3>
                  <p className="text-[11px] text-gray-500">Auto-generated on 1st of every month</p>
                </div>
              </div>
              <button
                onClick={() => setShowMonthlyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 font-semibold">Outstanding Amount</span>
                  <span className="text-2xl font-extrabold text-orange-600 flex items-center">
                    <IndianRupee className="h-5 w-5" />
                    {monthlySummary.outstandingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-purple-100">
                  <span className="text-xs text-gray-600 font-semibold">Pending Customers</span>
                  <span className="text-lg font-bold text-purple-900">{monthlySummary.pendingCustomersCount}</span>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-700">Priority Breakdown:</div>
                <div className="grid grid-cols-2 gap-2">
                  {(['reminder', 'follow_up', 'high_priority', 'critical'] as ReminderPriority[]).map((level) => {
                    const badge = PRIORITY_BADGES[level];
                    const item = monthlySummary.breakdownByPriority[level];

                    return (
                      <div key={level} className={`p-3 rounded-xl border ${badge.borderColor} ${badge.badgeBg}`}>
                        <div className="flex items-center gap-1 text-xs font-bold mb-1">
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </div>
                        <div className="text-sm font-extrabold text-gray-900">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-gray-500">{item.count} Customers</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMonthlyModal(false)}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 text-xs transition-colors shadow-sm"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
