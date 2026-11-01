//src/services/firebase.ts
import { initializeApp } from 'firebase/app'               // conecta tu app con Firebase
import { getFirestore } from 'firebase/firestore'          // acceso a la base de datos
import { getAuth } from 'firebase/auth'                    // acceso al sistema de usuarios

const firebaseConfig = {                                   // tus claves, leídas del .env
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)           // conecta (una sola vez)
export const db = getFirestore(app)                        // la base de datos
export const auth = getAuth(app)                           // los usuarios