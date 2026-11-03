import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  where,
  limit,
} from 'firebase/firestore';

import { db } from './firebase';
import type { Order, OrderFormData } from '../types/order';

const COLLECTION_NAME = 'orders';

// Generate a sequential order ID, for example PT-2026-0001.
const generateOrderId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `PT-${currentYear}-`;

  const ordersRef = collection(db, COLLECTION_NAME);
  const q = query(
    ordersRef,
    where('orderId', '>=', prefix),
    where('orderId', '<', `PT-${currentYear + 1}-`),
    orderBy('orderId', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  let nextNumber = 1;

  if (!querySnapshot.empty) {
    const latestOrder = querySnapshot.docs[0].data() as Order;
    const numberPart = parseInt(
      latestOrder.orderId.replace(prefix, ''),
      10
    );

    if (!Number.isNaN(numberPart)) {
      nextNumber = numberPart + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

export const orderService = {
  async addOrder(data: OrderFormData): Promise<Order> {
    const ordersRef = collection(db, COLLECTION_NAME);
    const orderId = await generateOrderId();

    const newOrder = {
      ...data,
      orderId,
      paidAmount: 0,
      remainingAmount: data.totalAmount,
      paymentStatus: 'Unpaid' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(ordersRef, newOrder);

    // Create a separate payment record for any advance received.
    if (data.advanceAmount > 0) {
      const { paymentService } = await import('./paymentService');

      await paymentService.addPayment(docRef.id, {
        paymentDate:
          data.orderDate || new Date().toISOString().split('T')[0],
        paymentType: 'Advance',
        amountPaid: data.advanceAmount,
        paymentMethod: 'Cash',
        remarks: 'Advance paid on order creation',
      });

      const updatedOrder = await this.getOrder(docRef.id);
      if (updatedOrder) return updatedOrder;
    }

    const savedOrder = await this.getOrder(docRef.id);

    if (!savedOrder) {
      throw new Error('Order was created but could not be retrieved.');
    }

    return savedOrder;
  },

  async updateOrder(
    id: string,
    data: Partial<OrderFormData>
  ): Promise<void> {
    const currentOrder = await this.getOrder(id);

    if (!currentOrder) {
      throw new Error('Order not found.');
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    // Keep payment history intact when order details are edited.
    // paidAmount is maintained by paymentService, not by the order form.
    const newTotalAmount = data.totalAmount ?? currentOrder.totalAmount;
    const paidAmount = currentOrder.paidAmount ?? 0;
    const remainingAmount = Math.max(0, newTotalAmount - paidAmount);

    updateData.remainingAmount = remainingAmount;
    updateData.paymentStatus =
      remainingAmount === 0
        ? 'Fully Paid'
        : paidAmount > 0
          ? 'Partially Paid'
          : 'Unpaid';

    // Do not overwrite paidAmount with advanceAmount.
    // Do not overwrite existing payment records.
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
  },

  async deleteOrder(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  async getOrder(id: string): Promise<Order | null> {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Order;
  },

  async getOrders(): Promise<Order[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Order[];
  },

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Order[];
  },
};
