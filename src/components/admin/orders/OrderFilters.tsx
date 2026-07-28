import { Search, Filter } from 'lucide-react';

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const FILTER_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'today', label: "Today's Deliveries" },
  { value: 'pending', label: 'Pending Orders' },
  { value: 'delivered', label: 'Delivered Orders' },
];

export default function OrderFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Order ID, Customer Name, or Mobile Number..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors shadow-sm"
        />
      </div>
      <div className="relative min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-sm leading-5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors shadow-sm appearance-none"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
