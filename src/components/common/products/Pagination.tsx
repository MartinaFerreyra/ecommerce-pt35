//src/components/common/products/Pagination.tsx
import './Pagination.css'                                                 // estilos
import { useProducts } from '../../../contexts/products/useProducts'      // página actual y botones

export function Pagination() {                                            // los botones de página
  const { page, hasMore, nextPage, prevPage, loading } = useProducts()    // lee del contexto (sin props)

  if (page === 1 && !hasMore) return null                                 // si hay una sola página, no muestra nada

  return (
    <div className="paginacion">
      <button onClick={prevPage} disabled={page === 1 || loading}>← Anterior</button> {/* apagado en la página 1 */}
      <span>Página {page}</span>                                          {/* número de página */}
      <button onClick={nextPage} disabled={!hasMore || loading}>Siguiente →</button>  {/* apagado en la última */}
    </div>
  )
}