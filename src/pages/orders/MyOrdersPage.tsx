//src/pages/orders/MyOrdersPage.tsx
import '../../components/orders/Orders.css'
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'                        // Navigate = redirigir
import { useAuth } from '../../contexts/auth/useAuth'
import { getMyOrders } from '../../services/ordersService'               // where + orderBy
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { formatDate, formatPrice } from '../../utils/format'
import type { Order } from '../../types/Order'

export function MyOrdersPage() {
  const { user, isAdmin } = useAuth()                                    // usuario y si es admin
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || isAdmin) return                                         // el admin no usa esta página
    let cancelado = false
    getMyOrders(user.id)                                                 // SOLO los de este usuario
      .then((data) => { if (!cancelado) setOrders(data) })
      .catch((err) => {
        console.error('my orders error:', err)                           // acá aparece el link del índice
        if (!cancelado) setError('No se pudieron cargar tus pedidos.')
      })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [user, isAdmin])

  if (isAdmin) return <Navigate to="/admin/orders" replace />            // admin → su panel
  if (loading) return <p className="orders-estado">Cargando tus pedidos...</p>

  if (error) {
    return (
      <section className="orders-card">
        <p className="orders-error">{error}</p>
      </section>
    )
  }

  return (
    <section className="orders-card">
      <h2>📦 Mis pedidos</h2>
      {orders.length === 0 ? (
        <>
          <p>Todavía no hiciste ninguna compra.</p>
          <Link to="/products" className="orders-btn">Ver la colección</Link>
        </>
      ) : (
        <ul className="orders-lista">
          {orders.map((o) => (
            <li key={o.id} className="orders-lista-item">
              <Link to={`/orders/${o.id}`}>                              {/* clic → detalle */}
                <div>
                  <strong>Pedido #{o.id.slice(0, 8)}</strong><br />
                  <small>{formatDate(o.createdAt)} · {o.itemCount} {o.itemCount === 1 ? 'joya' : 'joyas'}</small>
                </div>
                <strong>{formatPrice(o.total)}</strong>
                <OrderStatusBadge status={o.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}