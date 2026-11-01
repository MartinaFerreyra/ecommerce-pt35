//src/contexts/auth/AuthContext.ts
import { createContext } from 'react'
import type { User } from '../../types/User'

export type AuthContextValue = {                                           // lo que ofrece la sesión
  user: User | null                                                        // usuario, o null sin sesión
  loading: boolean                                                         // ¿revisando si hay sesión?
  isAuthenticated: boolean                                                 // ¿hay sesión?
  isAdmin: boolean                                                         // ¿es admin?
  login: (email: string, password: string) => Promise<void>                // ingresar
  signup: (name: string, email: string, password: string) => Promise<void> // registrarse
  loginWithGoogle: () => Promise<void>                                     // con Google
  logout: () => Promise<void>                                              // salir
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined) // la caja vacía