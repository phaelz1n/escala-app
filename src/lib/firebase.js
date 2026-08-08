// src/lib/firebase.js
// Firebase SDK configuration
// Fill in your credentials from Firebase Console → Project Settings → Your Apps → SDK setup
// or set them in .env file (VITE_FIREBASE_*)

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Detect if Firebase is configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-api-key-here'
);

let app, db, auth;

if (isFirebaseConfigured) {
  app  = initializeApp(firebaseConfig);
  db   = getFirestore(app);
  auth = getAuth(app);
} else {
  console.warn(
    '[ScalaOp] Firebase não configurado. Rodando em modo offline (dados locais).\n' +
    'Copie .env.example para .env e preencha as credenciais do Firebase Console.'
  );
}

export { db, auth };
export default app;
