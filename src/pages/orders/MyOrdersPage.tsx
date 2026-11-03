//src/pages/orders/MyOrdersPage.tsx
import '../../components/orders/Orders.css'                              // estilos
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/auth/useAuth'                    // quién está logueado
import { getMyOrders } from '../../services/ordersService'               // where + orderBy
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { formatDate, formatPrice } from '../../utils/format'
import type { Order } from '../../types/Order'

export function MyOrdersPage() {
  const { user } = useAuth()                                             // el usuario actual
  const [orders, setOrders] = useState<Order[]>([])                      // sus pedidos
  const [loading, setLoading] = useState(true)                           // LOADING
  const [error, setError] = useState<string | null>(null)                // ERROR

  useEffect(() => {
    if (!user) return                                                    // la ruta es protegida
    let cancelado = false
    getMyOrders(user.id)                                                 // SOLO los de este usuario
      .then((data) => { if (!cancelado) setOrders(data) })
      .catch((err) => {
        console.error('my orders error:', err)                           // acá aparece el link del índice
        if (!cancelado) setError('No se pudieron cargar tus pedidos.')
      })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [user])

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
      {orders.length === 0 ? (                                           // EMPTY
        <>
          <p>Todavía no hiciste ninguna compra.</p>
          <Link to="/products" className="orders-btn">Ver la colección</Link>
        </>
      ) : (
        <ul className="orders-lista">
          {orders.map((o) => (                                           // cada pedido
            <li key={o.id} className="orders-lista-item">
              <Link to={`/orders/${o.id}`}>                              {/* al detalle */}
                <div>
                  <strong>Pedido #{o.id.slice(0, 8)}</strong><br />      {/* número corto */}
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