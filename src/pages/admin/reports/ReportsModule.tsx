import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, FileText, Printer, Search, Filter } from 'lucide-react';
import CustomerReport from '../../../components/admin/reports/CustomerReport';
import OrderReport from '../../../components/admin/reports/OrderReport';
import PaymentReport from '../../../components/admin/reports/PaymentReport';

export type ReportTab = 'customer' | 'order' | 'payment';

export default function ReportsModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as ReportTab) || 'order';

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(searchParams.get('paymentStatus') || 'all');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [exportTrigger, setExportTrigger] = useState<{ type: 'excel' | 'pdf' | 'print', timestamp: number } | null>(null);

  const tabs = [
    { id: 'customer', label: 'Customer Report', emoji: '👥' },
    { id: 'order',    label: 'Order Report',    emoji: '📦' },
    { id: 'payment',  label: 'Payment Report',  emoji: '💰' },
  ];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
    setSearchTerm('');
    setDateFilter('all');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
  };

  const handleExport = (type: 'excel' | 'pdf' | 'print') => {
    setExportTrigger({ type, timestamp: Date.now() });
  };

  return (
    <div className="space-y-6 animate-fade-in print:space-y-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-wide">Reports</h1>
          <p className="text-gray-500 mt-1 font-medium">Generate and export detailed business reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('print')} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
            <FileText className="h-4 w-4 text-red-500" /> PDF
          </button>
          <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
            <Download className="h-4 w-4 text-green-600" /> Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 print:hidden flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/50 hover:text-primary'
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow-sm border border-gray-100 rounded-2xl space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, mobile, order ID..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>
          
          <div className="relative min-w-[150px]">
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
            <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {activeTab === 'order' && (
            <>
              <div className="relative min-w-[150px]">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">🟡 Pending</option>
                  <option value="In Progress">🟠 In Progress</option>
                  <option value="Ready">🟢 Ready</option>
                  <option value="Delivered">✔ Delivered</option>
                </select>
                <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <div className="relative min-w-[150px]">
                <select
                  value={paymentStatusFilter}
                  onChange={e => setPaymentStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none"
                >
                  <option value="all">All Payments</option>
                  <option value="Fully Paid">Fully Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
                <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </>
          )}
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            <span className="text-gray-500 font-medium">to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
        )}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:border-none print:shadow-none print:p-0">
        <h2 className="hidden print:block text-2xl font-serif text-black mb-6 border-b pb-2">
          {tabs.find(t => t.id === activeTab)?.label}
        </h2>

        {activeTab === 'customer' && (
          <CustomerReport
            searchTerm={searchTerm} dateFilter={dateFilter}
            startDate={startDate} endDate={endDate}
            exportTrigger={exportTrigger}
          />
        )}
        {activeTab === 'order' && (
          <OrderReport
            searchTerm={searchTerm} dateFilter={dateFilter}
            startDate={startDate} endDate={endDate}
            statusFilter={statusFilter} paymentStatusFilter={paymentStatusFilter}
            exportTrigger={exportTrigger}
          />
        )}
        {activeTab === 'payment' && (
          <PaymentReport
            searchTerm={searchTerm} dateFilter={dateFilter}
            startDate={startDate} endDate={endDate}
            exportTrigger={exportTrigger}
          />
        )}
      </div>
    </div>
  );
}
