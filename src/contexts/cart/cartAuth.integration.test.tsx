// src/contexts/cart/cartAuth.integration.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'       // herramientas de test
import { renderHook, act } from '@testing-library/react'           // montar hooks y ejecutar acciones
import type { ReactNode } from 'react'                             // tipo de children
import { AuthContext } from '../auth/AuthContext'                  // la caja de sesión REAL
import type { AuthContextValue } from '../auth/AuthContext'        // su contrato
import { CartProvider } from './CartProvider'                      // el carrito REAL
import { useCart } from './useCart'                                // el hook REAL
import type { User } from '../../types/User'                       // tipo usuario
import type { Product } from '../../types/Product'                 // tipo producto

const ana: User = { id: 'uid-ana', name: 'Ana', email: 'ana@test.com', role: 'customer' }     // usuaria 1
const beto: User = { id: 'uid-beto', name: 'Beto', email: 'beto@test.com', role: 'customer' } // usuario 2

const collar: Product = {                                         // joya de prueba
  id: 'p1',                                                       // id del producto
  name: 'Collar Luna',                                            // nombre
  description: 'Collar de prueba',                                // descripción
  price: 1000,                                                    // precio
  category: 'collares',                                           // categoría
  stock: 10,                                                      // hay stock
}

let usuarioActual: User | null = null                             // quién está "logueado" en el test

function crearAuthFalso(user: User | null): AuthContextValue {    // sesión de mentira (sin Firebase)
  return {
    user,                                                         // el usuario (o null)
    loading: false,                                               // ya terminó de revisar
    isAuthenticated: user !== null,                               // hay sesión si hay usuario
    isAdmin: user?.role === 'admin',                              // admin según el rol
    login: vi.fn(async () => {}),                                 // funciones vacías: no las usamos
    signup: vi.fn(async () => {}),
    loginWithGoogle: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
  }
}

function Envoltorio({ children }: { children: ReactNode }) {      // arma el árbol: Auth → Cart → hook
  return (
    <AuthContext.Provider value={crearAuthFalso(usuarioActual)}>  {/* sesión falsa con el usuario actual */}
      <CartProvider>{children}</CartProvider>                     {/* el carrito real lee esa sesión */}
    </AuthContext.Provider>
  )
}

describe('Integración carrito ↔ auth', () => {                    // grupo de tests de integración
  beforeEach(() => {                                              // antes de CADA test...
    localStorage.clear()                                          // ...vaciamos los carritos guardados
    usuarioActual = null                                          // ...y nadie está logueado
  })

  it('cada usuario tiene su propio carrito', () => {              // caso principal
    usuarioActual = ana                                           // inicia sesión Ana
    const { result, rerender } = renderHook(() => useCart(), { wrapper: Envoltorio }) // montamos el carrito

    act(() => result.current.addItem(collar))                     // Ana agrega un collar
    expect(result.current.itemCount).toBe(1)                      // Ana tiene 1 unidad
    expect(result.current.total).toBe(1000)                       // y el total es 1000

    usuarioActual = beto                                          // cambia la sesión a Beto
    rerender()                                                    // React vuelve a dibujar
    expect(result.current.itemCount).toBe(0)                      // Beto NO ve el collar de Ana

    usuarioActual = ana                                           // vuelve Ana
    rerender()                                                    // React vuelve a dibujar
    expect(result.current.itemCount).toBe(1)                      // Ana recupera su carrito (localStorage)
  })

  it('al cerrar sesión se usa el carrito de invitado', () => {    // caso: logout
    usuarioActual = ana                                           // inicia sesión Ana
    const { result, rerender } = renderHook(() => useCart(), { wrapper: Envoltorio })

    act(() => result.current.addItem(collar))                     // Ana agrega un collar
    usuarioActual = null                                          // cierra sesión
    rerender()                                                    // React vuelve a dibujar
    expect(result.current.itemCount).toBe(0)                      // el invitado tiene el carrito vacío
  })
})