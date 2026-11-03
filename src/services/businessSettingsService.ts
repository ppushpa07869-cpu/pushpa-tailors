
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';

import { db } from './firebase';

export interface BusinessSettings {
    shopName: string;
    phoneNumber: string;
    whatsappNumber: string;
    address: string;
}

const SETTINGS_REF = doc(db, 'settings', 'businessProfile');

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
    shopName: 'Pushpa Tailors',
    phoneNumber: '',
    whatsappNumber: '',
    address: ''
};

// Read business settings from Firestore.
export async function getBusinessSettings(): Promise<BusinessSettings> {
    const snapshot = await getDoc(SETTINGS_REF);

    if (!snapshot.exists()) {
        return DEFAULT_BUSINESS_SETTINGS;
    }

    const data = snapshot.data();

    return {
        shopName: data.shopName ?? DEFAULT_BUSINESS_SETTINGS.shopName,
        phoneNumber: data.phoneNumber ?? '',
        whatsappNumber: data.whatsappNumber ?? '',
        address: data.address ?? ''
    };
}

// Save business settings to Firestore.
export async function saveBusinessSettings(
    settings: BusinessSettings
): Promise<void> {
    await setDoc(
        SETTINGS_REF,
        {
            ...settings,
            updatedAt: serverTimestamp()
        },
        { merge: true }
    );
}
