// src/contexts/cart/useCart.test.tsx
import { describe, it, expect, vi } from 'vitest'             // herramientas para escribir tests
import { renderHook } from '@testing-library/react'           // monta un hook en el navegador de mentira
import { useCart } from './useCart'                            // el hook que vamos a probar

describe('useCart (guard)', () => {                            // grupo de tests del guard
  it('tira error si se usa fuera de <CartProvider>', () => {   // caso: sin Provider arriba
    const silenciar = vi.spyOn(console, 'error')               // React imprime el error en consola...
      .mockImplementation(() => {})                            // ...lo silenciamos para que no ensucie la salida

    expect(() => renderHook(() => useCart()))                  // montamos useCart SIN CartProvider
      .toThrow('useCart debe usarse dentro de <CartProvider>') // debe tirar EXACTAMENTE este mensaje

    silenciar.mockRestore()                                    // devolvemos console.error a la normalidad
  })
})