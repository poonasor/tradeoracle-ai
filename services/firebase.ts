import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDtefwcvTB1xMSPj-QtwM54K4-GnVB837o',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'tradeoracle-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'tradeoracle-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'tradeoracle-ai.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '302552558446',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:302552558446:web:62f5ca8cb77baed2052f7f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PMQRTZQMN1'
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export const analyticsPromise = isSupported().then((supported) => {
  if (!supported) return null;
  return getAnalytics(firebaseApp);
});
