import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Lazily initialize Firebase on the client to avoid server-side evaluation
export function initFirebaseClient() {
  if (typeof window === 'undefined') return;
  if (app && auth) return;

  if (!getApps().length) {
    app = initializeApp(firebaseConfig as any);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app as FirebaseApp);
}

export function getAuthClient(): Auth {
  if (!auth) {
    initFirebaseClient();
    if (!auth) throw new Error('Firebase auth not initialized on client')
  }
  return auth as Auth;
}

export { app };
