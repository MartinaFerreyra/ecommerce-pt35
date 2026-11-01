import { useContext } from 'react'                          // para abrir la caja
import { CartContext } from './CartContext'                 // la caja

export function useCart() {                                 // el hook del carrito
  const context = useContext(CartContext)                   // abre la caja
  if (context === undefined) {                              // guard: no hay CartProvider arriba
    throw new Error('useCart debe usarse dentro de <CartProvider>')
  }
  return context                                            // devuelve items, addToCart, totales...
}