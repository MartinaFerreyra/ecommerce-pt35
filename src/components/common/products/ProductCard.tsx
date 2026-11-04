//src/components/common/products/ProductCard.tsx
import './ProductCard.css'                                               // estilos de la tarjeta
import { Link } from 'react-router-dom'                                  // link al detalle
import type { Product } from '../../../types/Product'                   // formulario de la joya
import { useCart } from '../../../contexts/cart/useCart'                // el carrito
import { useFavorites } from '../../../contexts/favorites/useFavorites' // los favoritos

export function ProductCard({ product }: { product: Product }) {         // recibe UNA joya
  const { addItem } = useCart()                                          // agregar al carrito
  const { isFavorite, toggleFavorite } = useFavorites()                  // ¿es favorita? y marcar/desmarcar
  const favorito = isFavorite(product.id)                                // true si ya está en favoritos
  const sinStock = product.stock <= 0                                    // true si no hay stock

  return (
    <article className="article">
      <div className="imagen-contenedor">
        <Link to={`/products/${product.id}`}>                            {/* clic en la foto → detalle */}
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        </Link>
        <button
          className={favorito ? 'btn-favorito activo' : 'btn-favorito'}  // relleno si es favorita
          onClick={() => toggleFavorite(product)}                        // pone o saca de favoritos
          aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {favorito ? '♥' : '♡'}                                         {/* corazón lleno o vacío */}
        </button>
      </div>

      <h2>
        <Link to={`/products/${product.id}`} className="card-titulo">   {/* clic en el nombre → detalle */}
          {product.name}
        </Link>
      </h2>
      <p className="descripcion">{product.description}</p>
      <span className="precio">${product.price.toLocaleString('es-AR')}</span>

      <button
        className="btn-comprar"
        onClick={() => addItem(product)}                                 // agrega esta joya al carrito
        disabled={sinStock}                                              // sin stock, apagado
      >
        {sinStock ? 'Sin stock' : 'Añadir al carrito'}
      </button>
    </article>
  )
}