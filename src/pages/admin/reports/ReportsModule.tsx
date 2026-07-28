import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, FileText, Printer, Search, Filter } from 'lucide-react';
import CustomerReport from '../../../components/admin/reports/CustomerReport';
import OrderReport from '../../../components/admin/reports/OrderReport';
import DeliveryReport from '../../../components/admin/reports/DeliveryReport';
import PaymentReport from '../../../components/admin/reports/PaymentReport';

export type ReportTab = 'customer' | 'order' | 'delivery' | 'payment';

export default function ReportsModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as ReportTab) || 'order';

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(searchParams.get('paymentStatus') || 'all');
  
  // Custom Date Range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Trigger export callbacks from child components
  const [exportTrigger, setExportTrigger] = useState<{ type: 'excel' | 'pdf' | 'print', timestamp: number } | null>(null);

  const tabs = [
    { id: 'customer', label: 'Customer Report (కస్టమర్ రిపోర్ట్)' },
    { id: 'order', label: 'Order Report (ఆర్డర్ రిపోర్ట్)' },
    { id: 'delivery', label: 'Delivery Report (డెలివరీ రిపోర్ట్)' },
    { id: 'payment', label: 'Payment Report (చెల్లింపు రిపోర్ట్)' },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-wide">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1 font-medium">Generate and export detailed business reports.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('print')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors shadow-sm">
            <Printer className="h-4 w-4" /> <span>Print</span>
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors shadow-sm">
            <FileText className="h-4 w-4 text-red-500" /> <span>PDF</span>
          </button>
          <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="h-4 w-4 text-green-600" /> <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 print:hidden">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 shadow-sm border border-gray-100 rounded-sm space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Name, Mobile, Order ID, Receipt No..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
            />
          </div>
          
          <div className="relative min-w-[150px]">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-sm leading-5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <Filter className="h-4 w-4" />
            </div>
          </div>

          {(activeTab === 'order' || activeTab === 'delivery') && (
            <div className="relative min-w-[150px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-sm leading-5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm appearance-none"
              >
                <option value="all">All Statuses</option>
                {activeTab === 'order' ? (
                  <>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </>
                ) : (
                  <>
                    <option value="due_today">Due Today</option>
                    <option value="due_tomorrow">Due Tomorrow</option>
                    <option value="overdue">Overdue</option>
                    <option value="delivered">Delivered</option>
                  </>
                )}
              </select>
            </div>
          )}

          {activeTab === 'order' && (
            <div className="relative min-w-[150px]">
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-sm leading-5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm appearance-none"
              >
                <option value="all">All Payments</option>
                <option value="Fully Paid">Fully Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          )}
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-sm text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-sm text-sm"
            />
          </div>
        )}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 print:border-none print:shadow-none print:p-0">
        <h2 className="hidden print:block text-2xl font-serif text-black mb-6 border-b pb-2">
          {tabs.find(t => t.id === activeTab)?.label.split('(')[0]}
        </h2>

        {activeTab === 'customer' && (
          <CustomerReport 
            searchTerm={searchTerm} dateFilter={dateFilter} startDate={startDate} endDate={endDate}
            exportTrigger={exportTrigger}
          />
        )}
        {activeTab === 'order' && (
          <OrderReport 
            searchTerm={searchTerm} dateFilter={dateFilter} startDate={startDate} endDate={endDate}
            statusFilter={statusFilter} paymentStatusFilter={paymentStatusFilter}
            exportTrigger={exportTrigger}
          />
        )}
        {activeTab === 'delivery' && (
          <DeliveryReport 
            searchTerm={searchTerm} dateFilter={dateFilter} startDate={startDate} endDate={endDate}
            statusFilter={statusFilter}
            exportTrigger={exportTrigger}
          />
        )}
        {activeTab === 'payment' && (
          <PaymentReport 
            searchTerm={searchTerm} dateFilter={dateFilter} startDate={startDate} endDate={endDate}
            exportTrigger={exportTrigger}
          />
        )}
      </div>
    </div>
  );
}
