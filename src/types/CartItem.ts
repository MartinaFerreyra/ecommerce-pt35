//src/types/CartItem.ts
import type { Product } from './Product'                    // formulario de la joya

export type CartItem = {                                    // un renglón del carrito
  product: Product                                          // ✏️ la joya completa (antes solo el id)
  quantity: number                                          // cuántas unidades
  addedAt: Date                                             // 🆕 cuándo se agregó
}

export type CartState = {                                   // 🆕 el estado completo del carrito
  items: CartItem[]                                         // los renglones
  total: number                                             // el total en pesos
}

export type CartAction =                                    // 🆕 las acciones posibles ("qué ocurrió")
  | { type: 'ADD_ITEM'; payload: Product }                  // agregar 1 unidad de esta joya
  | { type: 'REMOVE_ITEM'; payload: string }                // sacar la joya con este id
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } } // cambiar la cantidad
  | { type: 'CLEAR_CART' }                                  // vaciar todo