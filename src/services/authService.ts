//src/services/authService.ts
import {
  createUserWithEmailAndPassword,                          // crear cuenta
  signInWithEmailAndPassword,                              // ingresar con email
  signInWithPopup,                                         // ingresar con ventanita (Google)
  signOut,                                                 // salir
  updateProfile,                                           // guardar el nombre en la cuenta
  GoogleAuthProvider,                                      // proveedor Google
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'  // usuario tal como lo da Firebase
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { User, UserRole } from '../types/User'

const googleProvider = new GoogleAuthProvider()            // Provider de Google

// Lee la ficha del usuario en Firestore (users/{uid}); si no existe, la crea como "customer"
export async function getOrCreateUserProfile(firebaseUser: FirebaseUser): Promise<User> {
  const ref = doc(db, 'users', firebaseUser.uid)           // la ficha de este usuario
  const snap = await getDoc(ref)                           // la lee

  if (snap.exists()) {                                     // si ya existe, la devuelve
    const data = snap.data()
    return { id: firebaseUser.uid, name: data.name, email: data.email, role: data.role as UserRole }
  }

  const perfil = {                                         // si no existe (ej: primera vez con Google), la crea
    name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Usuario',
    email: firebaseUser.email ?? '',
    role: 'customer' as UserRole,                          // todos arrancan como cliente
    createdAt: serverTimestamp(),
  }
  await setDoc(ref, perfil)
  return { id: firebaseUser.uid, name: perfil.name, email: perfil.email, role: perfil.role }
}

// REGISTRARSE con email y contraseña
export async function signupService(name: string, email: string, password: string): Promise<User> {
  const credentials = await createUserWithEmailAndPassword(auth, email, password) // crea la cuenta
  await updateProfile(credentials.user, { displayName: name })                     // le pone el nombre
  await setDoc(doc(db, 'users', credentials.user.uid), {                           // crea su ficha
    name,
    email,
    role: 'customer',
    createdAt: serverTimestamp(),
  })
  return { id: credentials.user.uid, name, email, role: 'customer' }
}

// INGRESAR con email y contraseña
export async function loginService(email: string, password: string): Promise<User> {
  const credentials = await signInWithEmailAndPassword(auth, email, password)
  return getOrCreateUserProfile(credentials.user)
}

// INGRESAR / REGISTRARSE con Google
export async function loginWithGoogleService(): Promise<User> {
  const credentials = await signInWithPopup(auth, googleProvider)
  return getOrCreateUserProfile(credentials.user)
}

// SALIR
export async function logoutService(): Promise<void> {
  await signOut(auth)
}

// Traduce los errores de Firebase al español
export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? ''
  const mensajes: Record<string, string> = {
    'auth/email-already-in-use': 'Ese email ya está registrado.',
    'auth/invalid-email': 'El email no es válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-credential': 'Email o contraseña incorrectos.',
    'auth/too-many-requests': 'Demasiados intentos. Probá más tarde.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  }
  return mensajes[code] ?? 'Ocurrió un error. Intentá de nuevo.'
}