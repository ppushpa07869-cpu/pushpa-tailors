import { IndianRupee, Users, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import type { DashboardPaymentSummary } from '../../../types/reminder';

interface PaymentSummaryCardProps {
  summary: DashboardPaymentSummary;
  onViewRemindersClick?: () => void;
}

export default function PaymentSummaryCard({ summary, onViewRemindersClick }: PaymentSummaryCardProps) {
  const { todaysCollection, totalPendingAmount, pendingCustomersCount, collectionProgress } = summary;

  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden border border-gray-800/80">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30 shadow-inner">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-white tracking-wide flex items-center gap-2">
              Payment Summary
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            </h2>
            <p className="text-xs text-gray-400">మొత్తం చెల్లింపుల సారాంశం</p>
          </div>
        </div>

        {onViewRemindersClick && (
          <button
            onClick={onViewRemindersClick}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-all border border-white/10 shadow-sm"
          >
            View Reminders 🔔
          </button>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
        {/* Today's Collection */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-green-500/30 transition-all group">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Today's Collection</span>
            <span className="text-[10px] text-green-400 font-medium">ఈరోజు</span>
          </div>
          <div className="text-2xl font-bold text-green-400 flex items-center gap-1 group-hover:scale-105 transition-transform origin-left">
            <IndianRupee className="h-5 w-5" />
            {todaysCollection.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Directly collected today</p>
        </div>

        {/* Total Pending Amount */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-orange-500/30 transition-all group">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Total Pending Amount</span>
            <span className="text-[10px] text-orange-400 font-medium">బాకీ</span>
          </div>
          <div className="text-2xl font-bold text-orange-400 flex items-center gap-1 group-hover:scale-105 transition-transform origin-left">
            <IndianRupee className="h-5 w-5" />
            {totalPendingAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Outstanding customer dues</p>
        </div>

        {/* Pending Customers */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Pending Customers</span>
            <span className="text-[10px] text-blue-400 font-medium">కస్టమర్లు</span>
          </div>
          <div className="text-2xl font-bold text-blue-400 flex items-center gap-2 group-hover:scale-105 transition-transform origin-left">
            <Users className="h-5 w-5" />
            {pendingCustomersCount}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Customers with active balance</p>
        </div>
      </div>

      {/* Collection Progress Indicator */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-200">Collection Progress</span>
            <span className="text-[10px] text-gray-400 font-normal">లక్ష్య ప్రగతి</span>
          </div>
          <span className="text-xs font-bold text-amber-400">{collectionProgress}% Collected</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-primary rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{ width: `${Math.min(100, Math.max(0, collectionProgress))}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400">
          <span className="flex items-center gap-1 text-emerald-400">
            ✓ Collected: ₹{summary.totalCollected.toLocaleString('en-IN')}
          </span>
          {totalPendingAmount > 0 ? (
            <span className="flex items-center gap-1 text-orange-400">
              <AlertCircle className="h-3 w-3" />
              Outstanding: ₹{totalPendingAmount.toLocaleString('en-IN')}
            </span>
          ) : (
            <span className="text-green-400 font-medium">🎉 100% Payments Cleared!</span>
          )}
        </div>
      </div>
    </div>
  );
}
