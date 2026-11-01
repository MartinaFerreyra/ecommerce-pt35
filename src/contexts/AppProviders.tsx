//src/contexts/AppProviders.tsx
import type { ReactNode } from 'react'                 // tipo de children
import { AuthProvider } from './auth/AuthProvider'     // sesión
import { ProductsProvider } from './products/ProductsProvider'    // productos (todavía suelto)
import { CartProvider } from './cart/CartProvider'     // ✏️ carrito
import { FavoritesProvider } from './favorites/FavoritesProvider'

export function AppProviders({ children }: { children: ReactNode }) { // junta los 3 en orden
  return (
    <AuthProvider>              {/* 1° sesión */}
      <ProductsProvider>        {/* 2° productos */}
        <CartProvider>          {/* 3° carrito */}
          <FavoritesProvider>
          {children}            {/* tu App */}
          </FavoritesProvider>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}