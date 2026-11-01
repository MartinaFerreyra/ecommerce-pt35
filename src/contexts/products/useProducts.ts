//src/contexts/products/useProducts.ts
import { useContext } from 'react'                          // para abrir la caja
import { ProductsContext } from './ProductsContext'         // la caja

export function useProducts() {                             // el hook de productos
  const context = useContext(ProductsContext)               // abre la caja
  if (context === undefined) {                              // guard
    throw new Error('useProducts debe usarse dentro de <ProductsProvider>')
  }
  return context
}