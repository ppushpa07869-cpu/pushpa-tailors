import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Measurement, MeasurementFormData } from '../types/measurement';

const getCollectionRef = (customerId: string) => {
  return collection(db, 'customers', customerId, 'measurements');
};

const getDocRef = (customerId: string, measurementId: string) => {
  return doc(db, 'customers', customerId, 'measurements', measurementId);
};

const cleanData = (data: any) => {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

export const measurementService = {
  async addMeasurement(customerId: string, data: MeasurementFormData): Promise<Measurement> {
    const measurementsRef = getCollectionRef(customerId);
    const cleanedData = cleanData(data);
    const newMeasurement = {
      ...cleanedData,
      customerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(measurementsRef, newMeasurement);
    return { id: docRef.id, ...newMeasurement } as Measurement;
  },

  async updateMeasurement(customerId: string, measurementId: string, data: MeasurementFormData): Promise<void> {
    const docRef = getDocRef(customerId, measurementId);
    const cleanedData = cleanData(data);
    const updateData = {
      ...cleanedData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, updateData);
  },

  async deleteMeasurement(customerId: string, measurementId: string): Promise<void> {
    const docRef = getDocRef(customerId, measurementId);
    await deleteDoc(docRef);
  },

  async getMeasurement(customerId: string, measurementId: string): Promise<Measurement | null> {
    const docRef = getDocRef(customerId, measurementId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Measurement;
    }
    return null;
  },

  async getMeasurements(customerId: string): Promise<Measurement[]> {
    const measurementsRef = getCollectionRef(customerId);
    const q = query(measurementsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Measurement[];
  }
};
