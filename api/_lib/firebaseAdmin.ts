//api/_lib/firebaseAdmin.ts
import { cert, getApps, initializeApp } from 'firebase-admin/app'   // conectar el servidor con Firebase
import { getAuth } from 'firebase-admin/auth'                        // verificar quién es el usuario
import { getFirestore } from 'firebase-admin/firestore'              // leer su rol en "users"

const app = getApps()[0] ?? initializeApp({                          // conecta una sola vez (si ya estaba, la reutiliza)
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,                      // process.env = variables del .env (en el servidor)
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // convierte los "\n" escritos en saltos de línea reales
  }),
})

export const adminAuth = getAuth(app)                                // para verificar el token (¿quién es?)
export const adminDb = getFirestore(app)                             // para leer users/{uid} (¿es admin?)