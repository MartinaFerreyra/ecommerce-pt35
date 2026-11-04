//src/pages/ProductDetailPage.tsx
import './ProductDetailPage.css'                                          // estilos del detalle
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProductById } from '../services/productsService'             // leer UNA joya
import { useCart } from '../contexts/cart/useCart'                        // agregar al carrito
import { useFavorites } from '../contexts/favorites/useFavorites'         // corazón
import { Spinner } from '../components/common/Spinner'                    // cargando (paso 5)
import { formatPrice } from '../utils/format'                             // $1.500
import type { Product } from '../types/Product'

export function ProductDetailPage() {
  const { id } = useParams()                                              // /products/:id
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [product, setProduct] = useState<Product | null>(null)            // la joya
  const [loading, setLoading] = useState(true)                            // LOADING
  const [error, setError] = useState<string | null>(null)                 // ERROR
  const [agregado, setAgregado] = useState(false)                         // aviso "agregado"

  useEffect(() => {
    if (!id) return
    let cancelado = false                                                 // por si se va antes
    getProductById(id)
      .then((data) => {
        if (cancelado) return
        if (data) setProduct(data)
        else setError('No encontramos esa joya.')                         // no existe
      })
      .catch((err) => {
        console.error('product detail error:', err)
        if (!cancelado) setError('No se pudo cargar la joya.')
      })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [id])

  if (loading) return <Spinner texto="Cargando joya..." />               // LOADING

  if (error || !product) {                                                // ERROR
    return (
      <section className="detalle">
        <p className="detalle-error">{error ?? 'No encontramos esa joya.'}</p>
        <Link to="/products">Volver a la colección</Link>
      </section>
    )
  }

  const sinStock = product.stock <= 0                                     // ¿se agotó?
  const favorito = isFavorite(product.id)                                 // ¿es favorita?

  const agregar = () => {                                                 // botón Añadir
    addItem(product)                                                      // dispara ADD_ITEM
    setAgregado(true)                                                     // muestra el aviso
  }

  return (
    <section className="detalle">
      <button className="detalle-volver" onClick={() => navigate(-1)}>← Volver</button>

      <div className="detalle-contenido">
        <img className="detalle-imagen" src={product.imageUrl} alt={product.name} />

        <div className="detalle-info">
          <span className="detalle-categoria">{product.category}</span>
          <h2>{product.name}</h2>
          <p className="detalle-precio">{formatPrice(product.price)}</p>
          <p className="detalle-descripcion">{product.description}</p>
          <p className="detalle-stock">
            {sinStock ? 'Sin stock' : `Stock disponible: ${product.stock}`}
          </p>

          <div className="detalle-acciones">
            <button className="detalle-btn" onClick={agregar} disabled={sinStock}>
              {sinStock ? 'Sin stock' : 'Añadir al carrito'}
            </button>
            <button
              className="detalle-favorito"
              onClick={() => toggleFavorite(product)}
              aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {favorito ? '♥' : '♡'}
            </button>
          </div>

          {agregado && (                                                  // aviso al agregar
            <p className="detalle-ok">Agregada al carrito ✓ <Link to="/cart">Ver carrito</Link></p>
          )}
        </div>
      </div>
    </section>
  )
}