// src/test/renderWithProviders.tsx
// WRAPPER DE PROVIDERS: monta un componente con Router + Auth + Carrito + Favoritos,
// igual que en la app real, pero con una sesión de mentira (sin Firebase).
import { render } from '@testing-library/react'                       // monta componentes en el navegador de mentira
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'                        // router que vive en memoria (sin barra de direcciones)
import { vi } from 'vitest'
import { AuthContext } from '../contexts/auth/AuthContext'             // la caja de sesión REAL
import type { AuthContextValue } from '../contexts/auth/AuthContext'
import { CartProvider } from '../contexts/cart/CartProvider'           // el carrito REAL
import { FavoritesProvider } from '../contexts/favorites/FavoritesProvider' // los favoritos REALES
import type { User } from '../types/User'

export function createAuthValue(user: User | null): AuthContextValue {  // sesión falsa
  return {
    user,                                                               // el usuario (o null)
    loading: false,                                                     // ya terminó de revisar
    isAuthenticated: user !== null,                                     // hay sesión si hay usuario
    isAdmin: user?.role === 'admin',                                    // admin según el rol
    login: vi.fn(async () => {}),                                       // funciones vacías
    signup: vi.fn(async () => {}),
    loginWithGoogle: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
  }
}

type Options = {
  user?: User | null                                                    // quién está logueado
  route?: string                                                        // URL inicial
}

export function AllProviders({ children, user = null, route = '/' }: Options & { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={[route]}>                             {/* 1° router */}
      <AuthContext.Provider value={createAuthValue(user)}>              {/* 2° sesión falsa */}
        <CartProvider>                                                  {/* 3° carrito real */}
          <FavoritesProvider>{children}</FavoritesProvider>             {/* 4° favoritos reales */}
        </CartProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

export function renderWithProviders(ui: ReactElement, options: Options = {}) { // render con todos los providers
  return render(ui, {
    wrapper: ({ children }) => <AllProviders {...options}>{children}</AllProviders>,
  })
}