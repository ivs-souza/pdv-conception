import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

/**
 * Sapphire v2.0 - Firebase Connector
 * Security: Strict usage of Environment Variables via process.env.NEXT_PUBLIC_
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const isConfigured = !!firebaseConfig.apiKey;

// Singleton pattern for Firebase initialization with environment guard
// Offline persistence is DISABLED by default to avoid conflicts with static export
const app = (getApps().length === 0 && isConfigured)
  ? initializeApp(firebaseConfig) 
  : (getApps()[0] || null);

// Exporting services only if app exists. 
// Consumers MUST check if these are null before use.
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;

if (db) {
  console.log("🔥 Firestore Initialized:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
} else {
  console.warn("⚠️ Firestore failed to initialize. Check environment variables.");
}

export default app;
