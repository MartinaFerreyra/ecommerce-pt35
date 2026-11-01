//src/contexts/products/ProductsProvider.tsx
import { useEffect, useRef, useState } from 'react'                      // herramientas de React
import type { ReactNode } from 'react'                                   // tipo de children
import type { Product, CategoryFilter } from '../../types/Product'       // formularios
import { listProducts } from '../../services/productsService'            // pide UNA página
import type { ProductsCursor } from '../../services/productsService'     // tipo del marcador
import { ProductsContext } from './ProductsContext'                      // la caja
import type { ProductsContextValue } from './ProductsContext'            // el contrato

const DEFAULT_PAGE_SIZE = 6                                              // joyas por página al abrir

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])                // joyas de la página actual
  const [cache, setCache] = useState<Record<string, Product>>({})        // todas las joyas ya vistas (para el carrito)
  const [selectedCategory, setCategoryState] = useState<CategoryFilter>('todas') // categoría elegida
  const [searchTerm, setSearchState] = useState('')                      // 🆕 texto buscado
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE)       // 🆕 joyas por página
  const [pageIndex, setPageIndex] = useState(0)                          // página actual (0 = la primera)
  const [hasMore, setHasMore] = useState(false)                          // ¿hay siguiente?
  const [loading, setLoading] = useState(true)                           // arranca cargando
  const [error, setError] = useState<string | null>(null)                // sin error

  const cursorsRef = useRef<ProductsCursor[]>([null])                    // marcadores de cada página

  useEffect(() => {                                                      // cada vez que cambia algo de esto...
    let cancelado = false
    listProducts({
      pageSize,                                                          // cuántas por página
      cursor: cursorsRef.current[pageIndex],                             // desde el marcador de esta página
      category: selectedCategory,                                        // filtro de categoría
      search: searchTerm,                                                // 🆕 filtro de búsqueda
    })
      .then((resultado) => {
        if (cancelado) return
        setProducts(resultado.items)                                     // muestra las joyas
        setHasMore(resultado.hasMore)                                    // ¿hay siguiente?
        cursorsRef.current[pageIndex + 1] = resultado.lastDoc            // marcador de la próxima página
        setCache((prev) => {                                             // suma las joyas al archivo
          const next = { ...prev }
          resultado.items.forEach((product) => { next[product.id] = product })
          return next
        })
      })
      .catch((err) => {
        if (cancelado) return
        console.error('Error al traer productos:', err)
        setError('No se pudieron cargar los productos')
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })
    return () => { cancelado = true }
  }, [pageIndex, selectedCategory, searchTerm, pageSize])                // 🆕 también búsqueda y tamaño

  const reiniciar = () => {                                              // 🆕 vuelve a la página 1 (al cambiar un filtro)
    cursorsRef.current = [null]                                          // borra los marcadores viejos
    setLoading(true)
    setError(null)
    setPageIndex(0)
  }

  const setSelectedCategory = (category: CategoryFilter) => {            // cambiar categoría
    if (category === selectedCategory) return
    reiniciar()
    setCategoryState(category)
  }

  const setSearchTerm = (text: string) => {                              // 🆕 cambiar búsqueda
    if (text === searchTerm) return
    reiniciar()
    setSearchState(text)
  }

  const setPageSize = (size: number) => {                                // 🆕 cambiar joyas por página
    if (size === pageSize) return
    reiniciar()
    setPageSizeState(size)
  }

  const clearFilters = () => {                                           // 🆕 "Limpiar filtros"
    if (selectedCategory === 'todas' && searchTerm === '' && pageSize === DEFAULT_PAGE_SIZE) return // ya está limpio
    reiniciar()
    setCategoryState('todas')
    setSearchState('')
    setPageSizeState(DEFAULT_PAGE_SIZE)
  }

  const nextPage = () => {                                               // ir a la siguiente
    if (!hasMore) return
    setLoading(true)
    setError(null)
    setPageIndex((p) => p + 1)
  }

  const prevPage = () => {                                               // volver a la anterior
    if (pageIndex === 0) return
    setLoading(true)
    setError(null)
    setPageIndex((p) => p - 1)
  }

  const getProductById = (id: string) => cache[id]                       // busca en el archivo

  const value: ProductsContextValue = {
    products,
    selectedCategory, setSelectedCategory,
    searchTerm, setSearchTerm,
    pageSize, setPageSize,
    clearFilters,
    page: pageIndex + 1,
    hasMore, nextPage, prevPage,
    loading, error,
    getProductById,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}