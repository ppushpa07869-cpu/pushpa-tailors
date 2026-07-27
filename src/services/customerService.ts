import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Customer } from '../types/customer';

const COLLECTION_NAME = 'customers';

// Utility to generate a simple Customer ID (e.g., PT-1234)
const generateCustomerId = () => {
  return `PT-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const customerService = {
  async addCustomer(customerData: Omit<Customer, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>) {
    const customersRef = collection(db, COLLECTION_NAME);
    const newCustomer = {
      ...customerData,
      customerId: generateCustomerId(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(customersRef, newCustomer);
    return { id: docRef.id, ...newCustomer };
  },

  async updateCustomer(id: string, customerData: Partial<Customer>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = {
      ...customerData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, updateData);
  },

  async deleteCustomer(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  async getCustomer(id: string): Promise<Customer | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Customer;
    }
    return null;
  },

  async getCustomers(): Promise<Customer[]> {
    const customersRef = collection(db, COLLECTION_NAME);
    const q = query(customersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];
  }
};
