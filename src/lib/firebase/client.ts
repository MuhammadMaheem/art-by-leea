/**
 * Firebase Client SDK — Browser-side initialization.
 *
 * This file initializes the Firebase app, Authentication, Firestore, and
 * Storage using the CLIENT (public) Firebase config keys. These keys are
 * safe to expose in the browser — Firebase Security Rules protect data.
 *
 * Uses a singleton pattern: the app is only initialized once, even if
 * this module is imported from multiple components.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export the services for use throughout the browser-side app
export const auth = getAuth(app);

// Session persistence — user is logged out when the browser tab closes
setPersistence(auth, browserSessionPersistence);

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
