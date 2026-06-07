import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export function getFirestoreDb(): Firestore {
  const app = initializeFirebaseApp();
  return getFirestore(app);
}

export function getFirebaseAuth(): Auth {
  const app = initializeFirebaseApp();
  return getAuth(app);
}

let analyticsInstance: Analytics | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (analyticsInstance) return analyticsInstance;
  const supported = await isSupported();
  if (!supported) return null;
  const app = initializeFirebaseApp();
  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
}
