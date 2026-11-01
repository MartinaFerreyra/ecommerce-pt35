//src/contexts/products/ProductsContext.ts
import { createContext } from 'react'                                    // para crear la caja
import type { Product, CategoryFilter } from '../../types/Product'       // formularios

export type ProductsContextValue = {                                     // lo que ofrece la pizarra de productos
  products: Product[]                                                    // joyas de la página actual
  selectedCategory: CategoryFilter                                       // categoría elegida
  setSelectedCategory: (category: CategoryFilter) => void                // cambiar categoría
  searchTerm: string                                                     // 🆕 texto buscado
  setSearchTerm: (text: string) => void                                  // 🆕 cambiar búsqueda
  pageSize: number                                                       // 🆕 joyas por página
  setPageSize: (size: number) => void                                    // 🆕 cambiar joyas por página
  clearFilters: () => void                                               // 🆕 volver todo a como estaba
  page: number                                                           // número de página
  hasMore: boolean                                                       // ¿hay siguiente?
  nextPage: () => void                                                   // ir a la siguiente
  prevPage: () => void                                                   // volver a la anterior
  loading: boolean                                                       // ¿cargando?
  error: string | null                                                   // mensaje de error
  getProductById: (id: string) => Product | undefined                    // buscar una joya (para el carrito)
}

export const ProductsContext = createContext<ProductsContextValue | undefined>(undefined) // la caja vacía