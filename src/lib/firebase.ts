// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all required environment variables are present
const requiredKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'storageBucket'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(`Missing Firebase config keys in .env.local: ${missingKeys.join(', ')}`);
  throw new Error('Missing required Firebase configuration. Please check your .env.local file.');
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Offline persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support offline persistence.');
    }
  });
}

/**
 * Checks the connection status to Firebase
 * @returns Promise<{ connected: boolean; error?: string }>
 */
const checkFirebaseConnection = (): Promise<{ connected: boolean; error?: string }> => {
  return new Promise((resolve) => {
    // Set a timeout to handle cases where Firebase doesn't respond
    const timeout = setTimeout(() => {
      resolve({ 
        connected: false, 
        error: 'Connection timeout. Please check your internet connection.' 
      });
    }, 5000);

    // Check auth state as a way to verify connection
    const unsubscribe = onAuthStateChanged(
      auth,
      () => {
        clearTimeout(timeout);
        unsubscribe();
        resolve({ connected: true });
      },
      (error) => {
        clearTimeout(timeout);
        unsubscribe();
        resolve({ 
          connected: false, 
          error: error.message || 'Failed to connect to Firebase' 
        });
      }
    );
  });
};

export { 
  app, 
  auth, 
  db, 
  storage, 
  checkFirebaseConnection 
};
