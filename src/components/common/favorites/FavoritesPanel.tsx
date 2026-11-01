//src/components/common/favorites/FavoritesPanel.tsx
import '../cart/CartPanel.css'
import './FavoritesPanel.css'
import { useFavorites } from '../../../contexts/favorites/useFavorites'
import { useCart } from '../../../contexts/cart/useCart'

export function FavoritesPanel({ onClose, asPage = false }: { onClose?: () => void; asPage?: boolean }) {
  const { favorites, favoritesCount, removeFavorite, clearFavorites } = useFavorites()
  const { addItem } = useCart()

  return (
    <aside className={asPage ? 'carrito-panel como-pagina' : 'carrito-panel'}>
      <div className="carrito-header">
        <h3>Tus favoritos ({favoritesCount})</h3>
        {onClose && (
          <button className="carrito-x" onClick={onClose} aria-label="Cerrar favoritos">✕</button>
        )}
      </div>

      {favorites.length === 0 ? (
        <p className="carrito-vacio">Todavía no marcaste joyas con ♡</p>
      ) : (
        <ul className="carrito-lista">
          {favorites.map((product) => (
            <li key={product.id} className="carrito-item">
              <img src={product.imageUrl} alt={product.name} className="carrito-img" />
              <div className="carrito-info">
                <div className="carrito-fila">
                  <span className="carrito-nombre">{product.name}</span>
                  <button className="carrito-eliminar" onClick={() => removeFavorite(product.id)} aria-label="Quitar de favoritos">✕</button>
                </div>
                <span className="carrito-categoria">{product.category}</span>
                <span className="carrito-precio">${product.price.toLocaleString('es-AR')}</span>
                <button className="favorito-agregar" onClick={() => addItem(product)} disabled={product.stock <= 0}>
                  {product.stock <= 0 ? 'Sin stock' : 'Añadir al carrito'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="carrito-footer">
        <button className="carrito-vaciar" onClick={clearFavorites} disabled={favorites.length === 0}>
          Vaciar favoritos
        </button>
      </div>
    </aside>
  )
}