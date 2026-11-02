//api/_lib/firebaseAdmin.ts
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import type { App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp(): App {                                        // conecta recién cuando se usa (y se puede atrapar el error)
  const existente = getApps()[0]
  if (existente) return existente                                    // si ya estaba conectada, la reutiliza

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId) throw new Error('Falta la variable FIREBASE_PROJECT_ID')       // mensajes claros si falta algo
  if (!clientEmail) throw new Error('Falta la variable FIREBASE_CLIENT_EMAIL')
  if (!privateKey) throw new Error('Falta la variable FIREBASE_PRIVATE_KEY')

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, ''), // convierte "\n" y saca comillas sobrantes
    }),
  })
}

export function getAdminAuth() { return getAuth(getAdminApp()) }        // para verificar el token
export function getAdminDb() { return getFirestore(getAdminApp()) }      // para leer el rol