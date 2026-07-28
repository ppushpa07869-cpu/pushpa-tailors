import { Timestamp } from 'firebase/firestore';

export type PaymentMethod = 
  | 'Cash (నగదు)' 
  | 'UPI (యూపీఐ)' 
  | 'PhonePe' 
  | 'Google Pay' 
  | 'Paytm' 
  | 'Bank Transfer' 
  | 'Other';

export type PaymentType = 
  | 'Advance' 
  | 'Partial Payment' 
  | 'Final Payment' 
  | 'Refund';

export interface Payment {
  id: string;
  paymentId: string;
  receiptNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  amountPaid: number;
  paymentType: PaymentType;
  remarks: string;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

export interface PaymentFormData {
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  amountPaid: number;
  paymentType: PaymentType;
  remarks: string;
}
