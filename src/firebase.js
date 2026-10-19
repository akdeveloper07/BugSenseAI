// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Helper to read Vite environment variables using import.meta.env with safe fallbacks
const getEnv = (key, fallback) => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore in non-supported environments
  }
  try {
    if (typeof process !== "undefined" && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore in non-supported environments
  }
  return fallback;
};

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyDE0j6WmH830SlpGmy9XbY1EXU9QdbWTsU"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "bugsense-ai-28c1b.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "bugsense-ai-28c1b"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "bugsense-ai-28c1b.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "657520549712"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:657520549712:web:39408cbd12d80bbd179655"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-DBY5YBVBRG"),
};

// Initialize Firebase — reuse existing app instance to prevent duplicate initialization
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export Authentication instance and Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Note: Firestore is not used by this application (the backend uses PostgreSQL via Prisma).
// Per requirements, Firestore instance is not initialized or exported to keep the bundle lean.

export default app;
