//src/contexts/cart/cartReducer.ts
import type { CartState, CartAction, CartItem } from '../../types/CartItem'  // contratos

export const initialCartState: CartState = { items: [], total: 0 }           // carrito vacío

export function calculateTotal(items: CartItem[]): number {                  // suma precio × cantidad
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}

export function cartReducer(state: CartState, action: CartAction): CartState { // estado actual + acción → estado nuevo
  switch (action.type) {                                                     // según qué ocurrió...

    case 'ADD_ITEM': {                                                       // agregar una joya
      const existing = state.items.find((item) => item.product.id === action.payload.id) // ¿ya está?

      if (existing) {                                                        // si ya está...
        if (existing.quantity >= action.payload.stock) return state          // ...y llegó al stock, no cambia
        const updated = state.items.map((item) =>                            // ...si no, le suma 1
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        return { items: updated, total: calculateTotal(updated) }
      }

      if (action.payload.stock <= 0) return state                            // sin stock, no la agrega
      const newItems = [                                                     // si no estaba, la agrega con 1
        ...state.items,
        { product: action.payload, quantity: 1, addedAt: new Date() },
      ]
      return { items: newItems, total: calculateTotal(newItems) }
    }

    case 'REMOVE_ITEM': {                                                    // sacar una joya entera
      const updated = state.items.filter((item) => item.product.id !== action.payload)
      return { items: updated, total: calculateTotal(updated) }
    }

    case 'UPDATE_QUANTITY': {                                                // cambiar la cantidad
      const { productId, quantity } = action.payload

      if (quantity <= 0) {                                                   // 0 o menos → la saca
        const updated = state.items.filter((item) => item.product.id !== productId)
        return { items: updated, total: calculateTotal(updated) }
      }

      const updated = state.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }    // nunca más que el stock
          : item
      )
      return { items: updated, total: calculateTotal(updated) }
    }

    case 'CLEAR_CART':                                                       // vaciar todo
      return initialCartState

    default:                                                                 // acción desconocida → no cambia
      return state
  }
}