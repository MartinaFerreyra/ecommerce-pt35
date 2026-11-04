// src/contexts/cart/cartReducer.test.ts
// Prueba que CADA acción del reducer produce el estado correcto.
// Casos edge sugeridos con IA: stock límite, sin stock, cantidad 0 o negativa, acción desconocida.
import { describe, it, expect } from 'vitest'
import { cartReducer, initialCartState } from './cartReducer'              // la función pura
import type { CartAction, CartState } from '../../types/CartItem'
import { anillo, agotado, collar } from '../../test/fixtures'              // joyas de prueba

const conItems = (...pares: [typeof collar, number][]): CartState => {      // arma un carrito de partida
  const items = pares.map(([product, quantity]) => ({ product, quantity, addedAt: new Date() }))
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  return { items, total }
}

describe('cartReducer', () => {
  describe('ADD_ITEM', () => {
    it('agrega una joya nueva con cantidad 1 y calcula el total', () => {
      const state = cartReducer(initialCartState, { type: 'ADD_ITEM', payload: collar })
      expect(state.items).toHaveLength(1)                                   // hay 1 renglón
      expect(state.items[0].quantity).toBe(1)                               // con 1 unidad
      expect(state.total).toBe(1000)                                        // total = precio
    })

    it('si la joya ya estaba, le suma 1', () => {
      const state = cartReducer(conItems([collar, 1]), { type: 'ADD_ITEM', payload: collar })
      expect(state.items).toHaveLength(1)                                   // sigue siendo 1 renglón
      expect(state.items[0].quantity).toBe(2)                               // ahora 2 unidades
      expect(state.total).toBe(2000)
    })

    it('no pasa el stock disponible (edge)', () => {
      const inicial = conItems([anillo, 2])                                 // anillo tiene stock 2
      const state = cartReducer(inicial, { type: 'ADD_ITEM', payload: anillo })
      expect(state).toBe(inicial)                                           // no cambia nada
    })

    it('no agrega una joya sin stock (edge)', () => {
      const state = cartReducer(initialCartState, { type: 'ADD_ITEM', payload: agotado })
      expect(state.items).toHaveLength(0)                                   // el carrito sigue vacío
    })
  })

  describe('REMOVE_ITEM', () => {
    it('saca la joya entera y recalcula el total', () => {
      const state = cartReducer(conItems([collar, 2], [anillo, 1]), { type: 'REMOVE_ITEM', payload: 'p1' })
      expect(state.items.map((i) => i.product.id)).toEqual(['p2'])         // queda solo el anillo
      expect(state.total).toBe(500)
    })
  })

  describe('UPDATE_QUANTITY', () => {
    it('cambia la cantidad', () => {
      const state = cartReducer(conItems([collar, 1]), {
        type: 'UPDATE_QUANTITY', payload: { productId: 'p1', quantity: 3 },
      })
      expect(state.items[0].quantity).toBe(3)
      expect(state.total).toBe(3000)
    })

    it('nunca supera el stock (edge)', () => {
      const state = cartReducer(conItems([anillo, 1]), {
        type: 'UPDATE_QUANTITY', payload: { productId: 'p2', quantity: 99 },
      })
      expect(state.items[0].quantity).toBe(2)                               // tope = stock
    })

    it('con cantidad 0 o negativa, saca la joya (edge)', () => {
      const state = cartReducer(conItems([collar, 2]), {
        type: 'UPDATE_QUANTITY', payload: { productId: 'p1', quantity: 0 },
      })
      expect(state.items).toHaveLength(0)
      expect(state.total).toBe(0)
    })
  })

  describe('CLEAR_CART', () => {
    it('vacía el carrito', () => {
      const state = cartReducer(conItems([collar, 2], [anillo, 1]), { type: 'CLEAR_CART' })
      expect(state).toEqual(initialCartState)
    })
  })

  it('una acción desconocida no cambia el estado (edge)', () => {
    const inicial = conItems([collar, 1])
    const state = cartReducer(inicial, { type: 'NO_EXISTE' } as unknown as CartAction)
    expect(state).toBe(inicial)
  })
})