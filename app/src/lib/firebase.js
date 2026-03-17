import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const isFirebaseEnabled = requiredKeys.every((key) => Boolean(firebaseConfig[key]));

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseEnabled) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    useFetchStreams: false
  });
  storage = firebaseConfig.storageBucket ? getStorage(app) : null;
} else {
  // Keep local-only mode available for development before env is ready.
  console.warn('[firebase] Missing env config, running in local fallback mode.');
}

const isFirebaseStorageEnabled = isFirebaseEnabled && Boolean(firebaseConfig.storageBucket);

export { app, auth, db, storage, isFirebaseEnabled, isFirebaseStorageEnabled };
