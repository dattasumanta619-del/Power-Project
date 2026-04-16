import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";

const firebaseConfig = {
  // TODO: Replace with your Firebase credentials
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function hasUsableFirebaseConfig(): boolean {
  return Object.values(firebaseConfig).every(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0 &&
      !value.includes("your_")
  );
}

export const isFirebaseConfigured = hasUsableFirebaseConfig();

let appInstance: FirebaseApp | null = null;
let databaseInstance: Database | null = null;

if (isFirebaseConfigured) {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  databaseInstance = getDatabase(appInstance);
}

export const firebaseApp = appInstance;
export const database = databaseInstance;
