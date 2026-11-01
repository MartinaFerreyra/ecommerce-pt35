//src/components/common/products/ProductList.tsx
import './ProductList.css'                                            // estilos de la grilla
import { useProducts } from '../../../contexts/products/useProducts'  // las joyas
import { ProductCard } from './ProductCard'                           // la tarjeta
import { Pagination } from './Pagination'                             // 🆕 los botones de página

export function ProductList() {                                       // la grilla de joyas
  const { products, loading, error } = useProducts()                  // ✏️ "products" = joyas de la página actual

  if (loading) return <p>Cargando joyas...</p>                        // mientras llegan de Firestore
  if (error) return <p>{error}</p>                                    // si algo falló
  if (products.length === 0) {                                        // si no hay ninguna
    return <p>No hay joyas en esta categoría.</p>
  }

  return (
    <>
      <ul className="product-grid">                                   {/* la grilla */}
        {products.map((product) => (                                  // por cada joya de esta página...
          <li key={product.id}>                                       {/* ...un <li> */}
            <ProductCard product={product} />                         {/* ...con su tarjeta */}
          </li>
        ))}
      </ul>
      <Pagination />                                                  {/* 🆕 los botones debajo de la grilla */}
    </>
  )
}