// src/contexts/cart/useCart.test.tsx
// Prueba el hook useCart de forma AISLADA con renderHook.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'                    // monta un hook y ejecuta acciones
import type { ReactNode } from 'react'
import { useCart } from './useCart'
import { CartProvider } from './CartProvider'
import { AuthContext } from '../auth/AuthContext'
import { createAuthValue } from '../../test/renderWithProviders'          // sesión falsa
import { anillo, clienta, collar } from '../../test/fixtures'

function wrapper({ children }: { children: ReactNode }) {                  // Auth (falso) + Carrito (real)
  return (
    <AuthContext.Provider value={createAuthValue(clienta)}>
      <CartProvider>{children}</CartProvider>
    </AuthContext.Provider>
  )
}

describe('useCart', () => {
  beforeEach(() => localStorage.clear())                                   // cada test arranca con el carrito vacío

  it('tira error si se usa fuera de <CartProvider> (guard)', () => {
    const silenciar = vi.spyOn(console, 'error').mockImplementation(() => {}) // React imprime el error: lo silenciamos
    expect(() => renderHook(() => useCart()))
      .toThrow('useCart debe usarse dentro de <CartProvider>')
    silenciar.mockRestore()
  })

  it('arranca vacío', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.itemCount).toBe(0)
  })

  it('addItem agrega y calcula total e itemCount', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem(collar)                                       // 1 collar ($1000)
      result.current.addItem(collar)                                       // otro collar
      result.current.addItem(anillo)                                       // 1 anillo ($500)
    })
    expect(result.current.items).toHaveLength(2)                           // 2 joyas distintas
    expect(result.current.itemCount).toBe(3)                               // 3 unidades
    expect(result.current.total).toBe(2500)                                // 2×1000 + 500
  })

  it('updateQuantity y removeItem actualizan el total', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(collar))
    act(() => result.current.updateQuantity('p1', 4))                      // ahora 4 collares
    expect(result.current.total).toBe(4000)
    act(() => result.current.removeItem('p1'))                             // lo saca
    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
  })

  it('clearCart vacía todo', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => { result.current.addItem(collar); result.current.addItem(anillo) })
    act(() => result.current.clearCart())
    expect(result.current.items).toEqual([])
  })

  it('guarda el carrito en localStorage con la clave del usuario', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(collar))
    const guardado = JSON.parse(localStorage.getItem('mlady-cart:uid-ana') ?? '{}')
    expect(guardado.items).toHaveLength(1)                                 // quedó persistido
  })
})