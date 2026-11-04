//src/pages/admin/AdminProductsPage.tsx
import './AdminProductsPage.css'                                           // estilos de la tabla
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, getAllProducts } from '../../services/adminProductsService'
import type { Product } from '../../types/Product'
import { Spinner } from '../../components/common/Spinner'                 // círculo de carga

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])                  // las joyas
  const [loading, setLoading] = useState(true)                             // estado LOADING
  const [error, setError] = useState<string | null>(null)                  // estado ERROR (al cargar)
  const [deleteError, setDeleteError] = useState<string | null>(null)      // error al borrar
  const [deletingId, setDeletingId] = useState<string | null>(null)        // estado DELETING
  const [recarga, setRecarga] = useState(0)                                // cambiarlo vuelve a pedir las joyas

  useEffect(() => {                                                        // al abrir, y cada vez que cambia "recarga"
    let cancelado = false
    getAllProducts()
      .then((data) => { if (!cancelado) setProducts(data) })
      .catch(() => { if (!cancelado) setError('No se pudieron cargar los productos.') })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [recarga])

  const reintentar = () => {                                               // botón "Reintentar"
    setError(null)
    setLoading(true)
    setRecarga((n) => n + 1)
  }

  const handleDelete = async (product: Product) => {                       // botón "Eliminar"
    if (!window.confirm(`¿Seguro que querés borrar "${product.name}"?`)) return
    setDeleteError(null)
    setDeletingId(product.id)                                              // marca esa fila como "borrando"
    try {
      await deleteProduct(product.id)                                      // la borra de Firestore
      setProducts((prev) => prev.filter((p) => p.id !== product.id))      // y de la tabla
    } catch {
      setDeleteError(`No se pudo borrar "${product.name}".`)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <Spinner texto="Cargando productos..." />            // LOADING

  if (error) {                                                             // ERROR
    return (
      <div className="admin-estado">
        <p className="admin-error">{error}</p>
        <button className="admin-btn" onClick={reintentar}>Reintentar</button>
      </div>
    )
  }

  if (products.length === 0) {                                             // EMPTY
    return (
      <div className="admin-estado">
        <p>Todavía no hay productos.</p>
        <Link to="/admin/products/new" className="admin-btn">+ Crear el primero</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="admin-encabezado">
        <h2>Productos ({products.length})</h2>
        <Link to="/admin/products/new" className="admin-btn">+ Nuevo producto</Link>
      </div>

      {deleteError && <p className="admin-error">{deleteError}</p>}

      <div className="tabla-scroll">
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const borrando = deletingId === p.id                         // ¿esta fila se está borrando?
              return (
                <tr key={p.id} className={borrando ? 'fila-borrando' : ''}>
                  <td><img src={p.imageUrl} alt={p.name} className="tabla-img" /></td>
                  <td>{p.name}</td>
                  <td className="tabla-categoria">{p.category}</td>
                  <td>${p.price.toLocaleString('es-AR')}</td>
                  <td>{p.stock}</td>
                  <td className="tabla-acciones">
                    <Link to={`/admin/products/${p.id}/edit`} className="accion-editar">Editar</Link>
                    <button
                      className="accion-eliminar"
                      onClick={() => handleDelete(p)}
                      disabled={deletingId !== null}
                    >
                      {borrando ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}