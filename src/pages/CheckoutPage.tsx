//src/pages/CheckoutPage.tsx
import './AuthPages.css'                                                    // estilos de tarjeta
import { useRef, useState } from 'react'                                    // useRef: candado anti doble click
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/cart/useCart'
import { useAuth } from '../contexts/auth/useAuth'
import { createOrder } from '../services/ordersService'                     // guardar el pedido
import { formatPrice } from '../utils/format'                               // $1.500

export function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart()                  // el carrito
  const { user } = useAuth()                                                // quién compra
  const navigate = useNavigate()                                            // para ir a la confirmación
  const [nombre, setNombre] = useState(user?.name ?? '')                    // campo Nombre
  const [direccion, setDireccion] = useState('')                            // campo Dirección
  const [enviando, setEnviando] = useState(false)                           // para el botón (se VE)
  const [error, setError] = useState<string | null>(null)                   // mensaje de error
  const enviandoRef = useRef(false)                                         // candado (se actualiza AL INSTANTE)

  if (items.length === 0) {                                                 // carrito vacío
    return (
      <section className="auth-card">
        <h2>Tu carrito está vacío</h2>
        <Link to="/products">Ver la colección</Link>
      </section>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()                                                      // no recargar la página
    if (!user || enviandoRef.current) return                                // DOBLE SUBMIT: si ya está enviando, ignora

    if (!nombre.trim() || !direccion.trim()) {                              // validación
      setError('Completá tu nombre y dirección.')
      return
    }

    enviandoRef.current = true                                              // cierra el candado
    setError(null)
    setEnviando(true)                                                       // deshabilita el botón
    try {
      const orderId = await createOrder({                                   // guarda en Firestore
        userId: user.id,
        userEmail: user.email,
        customerName: nombre.trim(),
        address: direccion.trim(),
        items: items.map(({ product, quantity }) => ({                      // SNAPSHOT de cada joya
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          subtotal: product.price * quantity,
          imageUrl: product.imageUrl ?? null,                               // null, nunca undefined
          category: product.category,
        })),
        itemCount,                                                          // total de unidades
        total,                                                              // total en pesos
      })
      navigate(`/orders/${orderId}/confirmation`, { replace: true })        // va a la confirmación
      clearCart()                                                           // vacía el carrito
    } catch (err) {
      console.error('checkout error:', err)                                 // detalle técnico
      setError('No se pudo registrar el pedido. Intentá de nuevo.')         // mensaje amigable
      enviandoRef.current = false                                           // abre el candado para reintentar
      setEnviando(false)
    }
  }

  return (
    <section className="auth-card">
      <h2>💳 Pago</h2>
      <ul className="checkout-lista">
        {items.map(({ product, quantity }) => (
          <li key={product.id}>
            {product.name} × {quantity} — {formatPrice(product.price * quantity)}
          </li>
        ))}
      </ul>
      <p><strong>Total: {formatPrice(total)}</strong></p>
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