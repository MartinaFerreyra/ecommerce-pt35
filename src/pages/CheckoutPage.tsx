//src/pages/CheckoutPage.tsx
import './AuthPages.css'                                                    // .auth-btn y .auth-error
import './CheckoutPage.css'                                                 // estilos del checkout
import { useRef, useState } from 'react'                                    // useRef = candado anti doble click
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/cart/useCart'
import { useAuth } from '../contexts/auth/useAuth'
import { createOrder } from '../services/ordersService'
import { formatPrice } from '../utils/format'
import { FREE_SHIPPING_FROM, PICKUP_POINTS, SHIPPING_OPTIONS, getShippingCost } from '../utils/shipping'
import type { ShippingMethod } from '../types/Order'

export function CheckoutPage() {
  const { items, total: subtotal, itemCount, clearCart } = useCart()        // total del carrito = subtotal
  const { user } = useAuth()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState(user?.name ?? '')                    // nombre
  const [metodo, setMetodo] = useState<ShippingMethod>('delivery')          // domicilio o retiro
  const [localidad, setLocalidad] = useState('')                            // solo para domicilio
  const [punto, setPunto] = useState(PICKUP_POINTS[0])                      // solo para retiro
  const [enviando, setEnviando] = useState(false)                           // botón deshabilitado
  const [error, setError] = useState<string | null>(null)                   // mensaje de error
  const enviandoRef = useRef(false)                                         // candado (cambia al instante)

  const envio = getShippingCost(metodo, subtotal)                           // costo del envío
  const totalFinal = subtotal + envio                                       // lo que paga

  if (items.length === 0) {                                                 // carrito vacío
    return (
      <section className="checkout-card">
        <h2>Tu carrito está vacío</h2>
        <Link to="/products">Ver la colección</Link>
      </section>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()                                                      // no recargar
    if (!user || enviandoRef.current) return                                // DOBLE SUBMIT bloqueado

    if (!nombre.trim()) { setError('Ingresá tu nombre.'); return }          // validación
    if (metodo === 'delivery' && !localidad.trim()) { setError('Ingresá tu localidad.'); return }

    enviandoRef.current = true                                              // cierra el candado
    setError(null)
    setEnviando(true)
    try {
      const orderId = await createOrder({
        userId: user.id,
        userEmail: user.email,
        customerName: nombre.trim(),
        address: metodo === 'delivery'                                      // resumen en una línea
          ? `Envío a domicilio — ${localidad.trim()}`
          : `Retiro en ${punto}`,
        shipping: {                                                         // detalle de la entrega
          method: metodo,
          cost: envio,
          locality: metodo === 'delivery' ? localidad.trim() : null,
          pickupPoint: metodo === 'pickup' ? punto : null,
        },
        items: items.map(({ product, quantity }) => ({                      // SNAPSHOT de cada joya
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          subtotal: product.price * quantity,
          imageUrl: product.imageUrl ?? null,
          category: product.category,
        })),
        itemCount,
        subtotal,
        total: totalFinal,
      })
      navigate(`/orders/${orderId}/confirmation`, { replace: true })        // a la confirmación
      clearCart()
    } catch (err) {
      console.error('checkout error:', err)
      setError('No se pudo registrar el pedido. Intentá de nuevo.')
      enviandoRef.current = false                                           // permite reintentar
      setEnviando(false)
    }
  }

  return (
    <form className="checkout-card" onSubmit={handleSubmit}>
      <h2>💳 Finalizar compra</h2>

      {/* ===== 1. TUS DATOS ===== */}
      <div className="checkout-seccion">
        <h3>1. Tus datos</h3>
        <label>Nombre y apellido
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
      </div>

      {/* ===== 2. ENTREGA ===== */}
      <div className="checkout-seccion">
        <h3>2. ¿Cómo querés recibirlo?</h3>

        {(Object.keys(SHIPPING_OPTIONS) as ShippingMethod[]).map((m) => {    // tarjeta por opción
          const opcion = SHIPPING_OPTIONS[m]
          const costo = getShippingCost(m, subtotal)
          return (
            <label key={m} className={`checkout-opcion ${metodo === m ? 'checkout-opcion--activa' : ''}`}>
              <input type="radio" name="metodo" checked={metodo === m} onChange={() => setMetodo(m)} />
              <span className="checkout-opcion-texto">
                <span>{opcion.label}</span>
                <small>{opcion.detail}</small>
              </span>
              <span className="checkout-opcion-precio">{costo === 0 ? 'Gratis' : formatPrice(costo)}</span>
            </label>
          )
        })}

        {metodo === 'delivery' && (                                         // SE EXPANDE: domicilio
          <div className="checkout-expande">
            <label>Localidad
              <input value={localidad} onChange={(e) => setLocalidad(e.target.value)}
                placeholder="Ej: Las Heras, Mendoza" />
            </label>
          </div>
        )}

        {metodo === 'pickup' && (                                           // SE EXPANDE: retiro
          <div className="checkout-expande">
            <label>Punto de retiro
              <select value={punto} onChange={(e) => setPunto(e.target.value)}>
                {PICKUP_POINTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>

      {/* ===== 3. RESUMEN ===== */}
      <div className="checkout-seccion checkout-resumen">
        <h3>3. Resumen</h3>
        {items.map(({ product, quantity }) => (
          <p key={product.id}>
            <span>{product.name} × {quantity}</span>
            <span>{formatPrice(product.price * quantity)}</span>
          </p>
        ))}
        <p><span>Subtotal</span><span>{formatPrice(subtotal)}</span></p>
        <p><span>Envío</span><span>{envio === 0 ? 'Gratis' : formatPrice(envio)}</span></p>
        {metodo === 'delivery' && subtotal < FREE_SHIPPING_FROM && (
          <p className="checkout-aviso">Te faltan {formatPrice(FREE_SHIPPING_FROM - subtotal)} para envío gratis 🎁</p>
        )}
        <p className="checkout-total"><strong>Total</strong><strong>{formatPrice(totalFinal)}</strong></p>
      </div>

      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="auth-btn" disabled={enviando} style={{ width: '100%' }}>
        {enviando ? 'Procesando...' : `Confirmar compra · ${formatPrice(totalFinal)}`}
      </button>
    </form>
  )
}