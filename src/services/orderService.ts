import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, orderBy, serverTimestamp, where, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderFormData } from '../types/order';

const COLLECTION_NAME = 'orders';

// Utility to generate a sequential Order ID (e.g., PT-2026-0001)
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
    const latestId = latestOrder.orderId;
    const numberPart = parseInt(latestId.replace(prefix, ''), 10);
    if (!isNaN(numberPart)) {
      nextNumber = numberPart + 1;
    }
  }

  const formattedNumber = nextNumber.toString().padStart(4, '0');
  return `${prefix}${formattedNumber}`;
};

export const orderService = {
  async addOrder(data: OrderFormData): Promise<Order> {
    const ordersRef = collection(db, COLLECTION_NAME);
    const orderId = await generateOrderId();
    
    // Create base order document
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
    const savedOrder = { id: docRef.id, ...newOrder } as Order;

    // If advanceAmount > 0, automatically create the first payment record
    if (data.advanceAmount && data.advanceAmount > 0) {

      // Lazy import paymentService logic to avoid circular dependency
      const { paymentService } = await import('./paymentService');
      await paymentService.addPayment(docRef.id, {
        paymentDate: data.orderDate || new Date().toISOString().split('T')[0],
        paymentType: 'Advance',
        amountPaid: data.advanceAmount,
        paymentMethod: 'Cash (నగదు)',
        remarks: 'Advance paid on order creation',
      });
      
      // Fetch updated order state
      const updated = await this.getOrder(docRef.id);
      if (updated) return updated;
    }

    return savedOrder;
  },

  async updateOrder(id: string, data: Partial<OrderFormData>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    if (data.totalAmount !== undefined && data.advanceAmount !== undefined) {
      const remaining = data.totalAmount - data.advanceAmount;
      updateData.remainingAmount = remaining;
      updateData.paidAmount = data.advanceAmount;
      updateData.paymentStatus = remaining === 0 ? 'Fully Paid' : (data.advanceAmount === 0 ? 'Unpaid' : 'Partially Paid');
    } else if (data.totalAmount !== undefined || data.advanceAmount !== undefined) {
       const currentOrder = await this.getOrder(id);
       if (currentOrder) {
         const t = data.totalAmount ?? currentOrder.totalAmount;
         const a = data.advanceAmount ?? currentOrder.advanceAmount;
         const remaining = t - a;
         updateData.remainingAmount = remaining;
         updateData.paidAmount = a;
         updateData.paymentStatus = remaining === 0 ? 'Fully Paid' : (a === 0 ? 'Unpaid' : 'Partially Paid');
       }
    }

    await updateDoc(docRef, updateData);
  },

  async deleteOrder(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  async getOrder(id: string): Promise<Order | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  },

  async getOrders(): Promise<Order[]> {
    const ordersRef = collection(db, COLLECTION_NAME);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Order[];
  },

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const ordersRef = collection(db, COLLECTION_NAME);
    const q = query(
      ordersRef,
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Order[];
  },
};
