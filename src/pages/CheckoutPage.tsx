//src/pages/CheckoutPage.tsx
import './AuthPages.css'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/cart/useCart'
import { useAuth } from '../contexts/auth/useAuth'
import { createOrder } from '../services/ordersService'                     // 🆕 guardar el pedido

export function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const [nombre, setNombre] = useState(user?.name ?? '')
  const [direccion, setDireccion] = useState('')
  const [pedidoId, setPedidoId] = useState<string | null>(null)             // 🆕 número de pedido (si ya compró)
  const [enviando, setEnviando] = useState(false)                           // 🆕 mientras guarda
  const [error, setError] = useState<string | null>(null)                   // 🆕 si falla

  if (pedidoId) {                                                           // después de comprar
    return (
      <section className="auth-card">
        <h2>¡Gracias por tu compra! 💍</h2>
        <p>Tu número de pedido es <strong>{pedidoId}</strong>.</p>
        <p>Compra simulada: no se realizó ningún cobro.</p>
        <Link to="/products">Seguir comprando</Link>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="auth-card">
        <h2>Tu carrito está vacío</h2>
        <Link to="/products">Ver la colección</Link>
      </section>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return                                                       // la ruta es protegida, pero por las dudas
    setError(null)
    setEnviando(true)
    try {
      const id = await createOrder({                                        // 🆕 guarda en Firestore
        userId: user.id,
        userEmail: user.email,
        customerName: nombre,
        address: direccion,
        items: items.map(({ product, quantity }) => ({                      // la "foto" de cada joya
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })),
        total,
      })
      clearCart()                                                           // vacía el carrito
      setPedidoId(id)                                                       // muestra el agradecimiento
    } catch {
      setError('No se pudo registrar el pedido. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="auth-card">
      <h2>💳 Pago</h2>
      <ul className="checkout-lista">
        {items.map(({ product, quantity }) => (
          <li key={product.id}>
            {product.name} × {quantity} — ${(product.price * quantity).toLocaleString('es-AR')}
          </li>
        ))}
      </ul>
      <p><strong>Total: ${total.toLocaleString('es-AR')}</strong></p>
      <form onSubmit={handleSubmit}>
        <label>Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>Dirección de envío
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-btn" disabled={enviando}>
          {enviando ? 'Procesando...' : 'Confirmar compra'}
        </button>
      </form>
    </section>
  )
}