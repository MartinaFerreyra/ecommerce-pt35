//src/pages/orders/OrderDetailPage.tsx
import '../../components/orders/Orders.css'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useOrder } from '../../hooks/useOrder'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { OrderSummary } from '../../components/orders/OrderSummary'
import { formatDate } from '../../utils/format'

export function OrderDetailPage() {
  const { orderId } = useParams()                                        // /orders/:orderId
  const { order, loading, error } = useOrder(orderId)
  const navigate = useNavigate()

  if (loading) return <p className="orders-estado">Cargando pedido...</p>

  if (error || !order) {
    return (
      <section className="orders-card">
        <p className="orders-error">{error ?? 'No encontramos ese pedido.'}</p>
        <Link to="/orders" className="orders-link">Ver mis pedidos</Link>
      </section>
    )
  }

  return (
    <section className="orders-card">
      <button className="orders-link" onClick={() => navigate(-1)}>← Volver</button>
      <h2>Pedido #{order.id.slice(0, 8)}</h2>
      <p>Estado: <OrderStatusBadge status={order.status} /></p>

      <div className="order-datos">
        <div>Número completo: <code className="order-id">{order.id}</code></div>
        <div>Fecha: {formatDate(order.createdAt)}</div>
        <div>Última actualización: {formatDate(order.updatedAt)}</div>
        <div>Cliente: {order.customerName} ({order.userEmail})</div>
        <div>{order.shipping.method === 'pickup' ? '🏬' : '🚚'} {order.address}</div>
      </div>

      <OrderSummary order={order} />                                      {/* items, cantidades, precios */}
    </section>
  )
}