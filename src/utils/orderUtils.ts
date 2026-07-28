import type { OrderStatus } from '../types/order';

export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'New (కొత్తది)':
      return 'bg-blue-100 text-blue-800';
    case 'Cutting (కటింగ్)':
      return 'bg-yellow-100 text-yellow-800';
    case 'Stitching (కుట్టుతున్నారు)':
      return 'bg-orange-100 text-orange-800';
    case 'Ready (సిద్ధంగా ఉంది)':
      return 'bg-purple-100 text-purple-800';
    case 'Delivered (డెలివరీ అయింది)':
      return 'bg-green-100 text-green-800';
    case 'Cancelled (రద్దు)':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
