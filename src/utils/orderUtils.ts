import type { OrderStatus } from '../types/order';

// Status colors for the 4-step workflow
export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'In Progress':
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    case 'Ready':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'Delivered':
      return 'bg-gray-100 text-gray-600 border border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

export const getStatusIcon = (status: OrderStatus): string => {
  switch (status) {
    case 'Pending':    return '🟡';
    case 'In Progress': return '🟠';
    case 'Ready':      return '🟢';
    case 'Delivered':  return '✔';
    default:           return '⚪';
  }
};

export const STATUS_FLOW: OrderStatus[] = ['Pending', 'In Progress', 'Ready', 'Delivered'];

export const getNextStatus = (current: OrderStatus): OrderStatus | null => {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
};
