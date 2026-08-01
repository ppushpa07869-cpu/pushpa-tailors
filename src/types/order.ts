import { Timestamp } from 'firebase/firestore';

export const OrderTypes = [
  '👚 Blouse',
  '🧵 Saree Fall (Pico & Fall)',
  '🎀 Saree Kuchulu (Tassels)',
  '👗 Dress',
  '👶 Kids Wear',
  '✂️ Alteration',
  '🛍️ Custom Order',
  '➕ Other',
] as const;

export type OrderType = typeof OrderTypes[number];

// Simplified 4-status workflow: Pending → In Progress → Ready → Delivered
export type OrderStatus = 
  | 'Pending'
  | 'In Progress'
  | 'Ready'
  | 'Delivered';

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Fully Paid';

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  mobileNumber: string;
  orderType?: OrderType | string;
  quantity?: number;
  orderDate: string; // YYYY-MM-DD format
  deliveryDate: string; // YYYY-MM-DD format — REQUIRED, always kept
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  advanceAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalAmount: number;
  referencePhotoUrl?: string; // Optional reference/measurement photo
  designRemarks?: string; // Optional design notes
  notes: string;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

export interface OrderFormData {
  customerId?: string;
  customerName: string;
  mobileNumber: string;
  orderType: OrderType | string;
  quantity: number;
  orderDate: string;
  deliveryDate: string;
  status: OrderStatus;
  advanceAmount: number;
  totalAmount: number;
  referencePhotoUrl?: string;
  designRemarks?: string;
  notes?: string;
}

