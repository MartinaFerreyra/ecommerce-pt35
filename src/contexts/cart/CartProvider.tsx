//src/contexts/cart/CartProvider.tsx
import { useCallback, useEffect, useMemo, useReducer } from 'react'      // ✏️ useReducer en lugar de useState
import type { ReactNode } from 'react'                                   // tipo de children
import type { CartItem, CartState } from '../../types/CartItem'          // contratos
import type { Product } from '../../types/Product'                       // joya
import { useAuth } from '../auth/useAuth'                                // quién está logueado
import { cartReducer, calculateTotal, initialCartState } from './cartReducer' // 🆕 las reglas
import { CartContext } from './CartContext'                              // la caja
import type { CartContextValue } from './CartContext'                    // el contrato

function loadFromStorage(storageKey: string): CartState {               // 🆕 lee el carrito guardado
  try {
    const stored = localStorage.getItem(storageKey)                      // busca en el navegador
    if (!stored) return initialCartState                                 // si no hay nada, vacío
    const parsed = JSON.parse(stored) as { items?: CartItem[] }          // texto → objeto
    const items = parsed.items?.map((item) => ({
      ...item,
      addedAt: new Date(item.addedAt),                                   // la fecha vuelve a ser Date
    })) ?? []
    return { items, total: calculateTotal(items) }                       // el total se recalcula
  } catch {
    return initialCartState                                              // si estaba roto, vacío
  }
}

export function CartProvider({ children }: { children: ReactNode }) {   // el encargado del carrito
  const { user } = useAuth()                                             // INTEGRACIÓN con auth
  const storageKey = `mlady-cart:${user ? user.id : 'invitado'}`         // un "cajón" por usuario
  return (
    <UserCart key={storageKey} storageKey={storageKey}>                  {/* si cambia el usuario, carga su carrito */}
      {children}
    </UserCart>
  )
}

function UserCart({ storageKey, children }: { storageKey: string; children: ReactNode }) { // el carrito de UN usuario
  const [state, dispatch] = useReducer(cartReducer, storageKey, loadFromStorage) // lee localStorage una sola vez

  useEffect(() => {                                                      // cada vez que cambia el carrito...
    localStorage.setItem(storageKey, JSON.stringify(state))              // ...lo guarda
  }, [storageKey, state])

  const addItem = useCallback((product: Product) => {                    // funciones con nombre
    dispatch({ type: 'ADD_ITEM', payload: product })                     // que envían acciones
  }, [])

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const itemCount = useMemo(                                             // cantidad total de unidades
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  )

  const value = useMemo<CartContextValue>(() => ({                       // memoizado
    items: state.items,
    total: state.total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }), [state.items, state.total, itemCount, addItem, removeItem, updateQuantity, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider> // reparte a los hijos
}