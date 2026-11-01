//src/contexts/auth/useAuth.ts
import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {                                // el mozo de la sesión
  const context = useContext(AuthContext)
  if (context === undefined) {                             // guard
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}