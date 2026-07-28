import { collection, addDoc, getDocs, query, serverTimestamp, collectionGroup, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Payment, PaymentFormData } from '../types/payment';
import { orderService } from './orderService';

// Utility to generate a sequential Receipt Number (e.g., RCPT-2026-0001)
const generateReceiptNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `RCPT-${currentYear}-`;
  
  const paymentsQuery = query(collectionGroup(db, 'payments'));
  const querySnapshot = await getDocs(paymentsQuery);
  
  let maxNumber = 0;
  querySnapshot.forEach((docSnap) => {
    const payment = docSnap.data() as Payment;
    if (payment.receiptNumber && payment.receiptNumber.startsWith(prefix)) {
      const numberPart = parseInt(payment.receiptNumber.replace(prefix, ''), 10);
      if (!isNaN(numberPart) && numberPart > maxNumber) {
        maxNumber = numberPart;
      }
    }
  });

  const nextNumber = maxNumber + 1;
  const formattedNumber = nextNumber.toString().padStart(4, '0');
  return `${prefix}${formattedNumber}`;
};

export const paymentService = {
  async addPayment(orderId: string, data: PaymentFormData): Promise<Payment> {
    const order = await orderService.getOrder(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const receiptNumber = await generateReceiptNumber();
    
    // 1. Add the payment document
    const paymentsRef = collection(db, 'orders', orderId, 'payments');
    const newPayment = {
      ...data,
      paymentId: `PAY-${Date.now()}`,
      receiptNumber,
      orderId,
      customerId: order.customerId,
      customerName: order.customerName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(paymentsRef, newPayment);
    const savedPayment = { id: docRef.id, ...newPayment } as Payment;

    // 2. Update the parent order
    const newPaidAmount = (order.paidAmount || 0) + data.amountPaid;
    const newRemainingAmount = Math.max(0, order.totalAmount - newPaidAmount);
    const newPaymentStatus = newRemainingAmount === 0 ? 'Fully Paid' : (newPaidAmount === 0 ? 'Unpaid' : 'Partially Paid');

    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      paymentStatus: newPaymentStatus,
      updatedAt: serverTimestamp()
    });

    return savedPayment;
  },

  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    const paymentsRef = collection(db, 'orders', orderId, 'payments');
    const querySnapshot = await getDocs(paymentsRef);
    
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];

    // Sort by createdAt descending in memory since we aren't creating composite indexes
    return payments.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  },

  async getAllPayments(): Promise<Payment[]> {
    const paymentsQuery = query(collectionGroup(db, 'payments'));
    const querySnapshot = await getDocs(paymentsQuery);
    
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];

    return payments.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  },

  async getDashboardStats() {
    const payments = await this.getAllPayments();
    const orders = await orderService.getOrders();
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7); // YYYY-MM
    
    let todaysCollection = 0;
    let monthlyCollection = 0;
    
    payments.forEach(payment => {
      if (payment.paymentDate === today) {
        todaysCollection += payment.amountPaid;
      }
      if (payment.paymentDate.startsWith(currentMonth)) {
        monthlyCollection += payment.amountPaid;
      }
    });

    let pendingCollection = 0;
    let fullyPaidOrders = 0;

    orders.forEach(order => {
      if (order.status !== 'Cancelled (రద్దు)') {
        pendingCollection += order.remainingAmount || 0;
        if (order.paymentStatus === 'Fully Paid') {
          fullyPaidOrders++;
        }
      }
    });
    
    return {
      todaysCollection,
      monthlyCollection,
      pendingCollection,
      fullyPaidOrders
    };
  }
};
