import { Timestamp } from 'firebase/firestore';

export type OrderStatus = 
  | 'New (కొత్తది)' 
  | 'Cutting (కటింగ్)' 
  | 'Stitching (కుట్టుతున్నారు)' 
  | 'Ready (సిద్ధంగా ఉంది)' 
  | 'Delivered (డెలివరీ అయింది)' 
  | 'Cancelled (రద్దు)';

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Fully Paid';

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  mobileNumber: string;
  measurementId: string;
  measurementType: string;
  orderDate: string; // YYYY-MM-DD format
  deliveryDate: string; // YYYY-MM-DD format
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  advanceAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalAmount: number;
  notes: string;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

export interface OrderFormData {
  customerId: string;
  customerName: string;
  mobileNumber: string;
  measurementId: string;
  measurementType: string;
  orderDate: string;
  deliveryDate: string;
  status: OrderStatus;
  advanceAmount: number;
  totalAmount: number;
  notes: string;
}
