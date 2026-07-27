import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export interface Customer {
  id?: string;
  customerId: string; // Auto Generated
  customerName: string;
  mobileNumber: string;
  alternateNumber?: string;
  address?: string;
  measurementType?: string;
  blouseType?: string;
  deliveryDate: Date | Timestamp | string;
  advanceAmount: number;
  remainingAmount: number;
  totalAmount: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delivered';
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export const customerSchema = z.object({
  customerName: z.string().min(1, 'Customer Name is required'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile Number must be 10 digits'),
  alternateNumber: z.string().regex(/^\d{10}$/, 'Must be 10 digits').optional().or(z.literal('')),
  address: z.string().optional(),
  measurementType: z.string().optional(),
  blouseType: z.string().optional(),
  deliveryDate: z.string().min(1, 'Delivery Date is required'),
  totalAmount: z.coerce.number().min(0, 'Total Amount is required'),
  advanceAmount: z.coerce.number().min(0).default(0),
  remainingAmount: z.coerce.number().min(0).default(0),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Delivered']).default('Pending'),
}).superRefine((data, ctx) => {
  if (data.advanceAmount > data.totalAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Advance Amount cannot exceed Total Amount',
      path: ['advanceAmount'],
    });
  }
});

export type CustomerFormData = z.infer<typeof customerSchema>;
