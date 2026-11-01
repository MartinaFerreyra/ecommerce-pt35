//src/contexts/auth/AuthProvider.tsx
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'                       // "avisame si cambia la sesión"
import { auth } from '../../services/firebase'
import {
  getOrCreateUserProfile, loginService, loginWithGoogleService, logoutService, signupService,
} from '../../services/authService'
import type { User } from '../../types/User'
import { AuthContext } from './AuthContext'
import type { AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {   // el encargado de la sesión
  const [user, setUser] = useState<User | null>(null)                    // arranca sin usuario
  const [loading, setLoading] = useState(true)                           // arranca revisando

  useEffect(() => {                                                      // al abrir la tienda...
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => { // ...¿había sesión guardada?
      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }
      try {
        setUser(await getOrCreateUserProfile(firebaseUser))              // lee su ficha con el rol
      } catch (err) {
        console.error('Error al leer el perfil:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })
    return unsubscribe                                                   // deja de escuchar al cerrar
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
    login: async (email, password) => { setUser(await loginService(email, password)) },
    signup: async (name, email, password) => { setUser(await signupService(name, email, password)) },
    loginWithGoogle: async () => { setUser(await loginWithGoogleService()) },
    logout: async () => { await logoutService(); setUser(null) },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}