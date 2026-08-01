import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export interface Customer {
  id?: string;
  customerId: string; // Auto Generated
  customerName: string;
  mobileNumber: string;
  alternateNumber?: string;
  address?: string;
  createdAt?: Timestamp | Date | any;
  updatedAt?: Timestamp | Date | any;
}

export const customerSchema = z.object({
  customerName: z.string().min(1, 'Customer Name is required'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile Number must be 10 digits'),
  alternateNumber: z.string().regex(/^\d{10}$/, 'Must be 10 digits').optional().or(z.literal('')),
  address: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
