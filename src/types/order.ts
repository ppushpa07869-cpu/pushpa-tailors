
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

// Order status workflow
export type OrderStatus =
  | 'Pending'
  | 'In Progress'
  | 'Ready'
  | 'Delivered';

export type PaymentStatus =
  | 'Unpaid'
  | 'Partially Paid'
  | 'Fully Paid';

// Measurements saved as a snapshot on an individual order
export interface OrderMeasurementSnapshot {
  measurementType?: string;
  bust?: number;
  waist?: number;
  shoulder?: number;
  frontNeck?: number;
  backNeck?: number;
  sleeveLength?: number;
  sleeveRound?: number;
  blouseLength?: number;
  armHole?: number;
  chestRound?: number;
  margin?: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  mobileNumber: string;

  orderType?: OrderType | string;
  quantity?: number;

  orderDate: string;
  deliveryDate: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  advanceAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalAmount: number;

  referencePhotoUrl?: string;
  designRemarks?: string;

  // Measurements captured for this specific order
  measurementSnapshot?: OrderMeasurementSnapshot;

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

  // Optional measurements submitted with the order
  measurementSnapshot?: OrderMeasurementSnapshot;

  notes?: string;
}
