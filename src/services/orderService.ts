import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, orderBy, serverTimestamp, where, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderFormData } from '../types/order';

const COLLECTION_NAME = 'orders';

// Utility to generate a sequential Order ID (e.g., PT-2026-0001)
const generateOrderId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `PT-${currentYear}-`;
  
  const ordersRef = collection(db, COLLECTION_NAME);
  // Find orders from this year, get the latest one
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
    
    const newOrder = {
      ...data,
      orderId,
      remainingAmount: data.totalAmount - data.advanceAmount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(ordersRef, newOrder);
    return { id: docRef.id, ...newOrder } as Order;
  },

  async updateOrder(id: string, data: Partial<OrderFormData>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    const updateData: any = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    if (data.totalAmount !== undefined && data.advanceAmount !== undefined) {
      updateData.remainingAmount = data.totalAmount - data.advanceAmount;
    } else if (data.totalAmount !== undefined || data.advanceAmount !== undefined) {
       const currentOrder = await this.getOrder(id);
       if (currentOrder) {
         const t = data.totalAmount ?? currentOrder.totalAmount;
         const a = data.advanceAmount ?? currentOrder.advanceAmount;
         updateData.remainingAmount = t - a;
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
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  },

  async getDashboardStats() {
    const orders = await this.getOrders();
    const today = new Date().toISOString().split('T')[0];
    
    let totalOrders = 0;
    let todaysDeliveries = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;
    
    orders.forEach(order => {
      totalOrders++;
      
      if (order.deliveryDate === today) {
        todaysDeliveries++;
      }
      
      if (order.status === 'Delivered (డెలివరీ అయింది)') {
        deliveredOrders++;
      } else if (order.status !== 'Cancelled (రద్దు)') {
        pendingOrders++;
      }
    });
    
    return {
      totalOrders,
      todaysDeliveries,
      pendingOrders,
      deliveredOrders
    };
  }
};
