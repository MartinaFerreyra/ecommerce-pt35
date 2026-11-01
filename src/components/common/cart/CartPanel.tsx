//src/components/common/cart/CartPanel.tsx
import './CartPanel.css'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../contexts/cart/useCart'

export function CartPanel({ onClose, asPage = false }: { onClose?: () => void; asPage?: boolean }) {
  const { items, total, itemCount, addItem, updateQuantity, removeItem, clearCart } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {                           // "Finalizar compra" → página de Pago
    onClose?.()
    navigate('/checkout')
  }

  return (
    <aside className={asPage ? 'carrito-panel como-pagina' : 'carrito-panel'}>
      <div className="carrito-header">
        <h3>Tu carrito ({itemCount})</h3>
        {onClose && (
          <button className="carrito-x" onClick={onClose} aria-label="Cerrar carrito">✕</button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío.</p>
      ) : (
        <ul className="carrito-lista">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="carrito-item">
              <img src={product.imageUrl} alt={product.name} className="carrito-img" />
              <div className="carrito-info">
                <div className="carrito-fila">
                  <span className="carrito-nombre">{product.name}</span>
                  <button className="carrito-eliminar" onClick={() => removeItem(product.id)} aria-label="Eliminar">🗑</button>
                </div>
                <span className="carrito-categoria">{product.category}</span>
                <p className="carrito-descripcion">{product.description}</p>
                <div className="carrito-fila">
                  <span className="carrito-precio">${(product.price * quantity).toLocaleString('es-AR')}</span>
                  <div className="carrito-cantidad">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => addItem(product)} disabled={quantity >= product.stock}>+</button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="carrito-footer">
        <div className="carrito-subtotal">
          <span>Subtotal</span>
          <span>${total.toLocaleString('es-AR')}</span>
        </div>
        <p className="carrito-nota">Los descuentos se aplicarán al finalizar la compra</p>
        <button className="carrito-finalizar" onClick={handleCheckout} disabled={items.length === 0}>
          Finalizar compra
        </button>
        <button className="carrito-vaciar" onClick={clearCart} disabled={items.length === 0}>
          Vaciar carrito
        </button>
      </div>
    </aside>
  )
}