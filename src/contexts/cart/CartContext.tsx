// src/contexts/cart/CartContext.tsx
import { createContext } from 'react'                           // para crear la caja
import type { CartItem } from '../../types/CartItem'           // renglón del carrito
import type { Product } from '../../types/Product'             // joya

export type CartContextValue = {                                // lo que ofrece el carrito a la app
  items: CartItem[]                                             // los renglones
  total: number                                                 // ✏️ antes totalPrice
  itemCount: number                                             // ✏️ antes totalItems
  addItem: (product: Product) => void                           // ✏️ antes addToCart(productId): ahora recibe la joya
  removeItem: (productId: string) => void                       // sacar la joya entera
  updateQuantity: (productId: string, quantity: number) => void // ✏️ reemplaza a decreaseItem
  clearCart: () => void                                         // vaciar
}

export const CartContext = createContext<CartContextValue | undefined>(undefined) // la caja vacía