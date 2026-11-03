//src/pages/orders/OrderDetailPage.tsx
import '../../components/orders/Orders.css'                              // estilos
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useOrder } from '../../hooks/useOrder'                          // cargar el pedido
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { OrderSummary } from '../../components/orders/OrderSummary'
import { formatDate } from '../../utils/format'

export function OrderDetailPage() {
  const { orderId } = useParams()                                        // ej: /orders/abc123
  const { order, loading, error } = useOrder(orderId)                    // lo trae de Firestore
  const navigate = useNavigate()                                         // para "Volver"

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
      <p>Estado: <OrderStatusBadge status={order.status} /></p>          {/* estado */}

      <div className="order-datos">                                       {/* datos del pedido */}
        <div>Número completo: <code className="order-id">{order.id}</code></div>
        <div>Fecha: {formatDate(order.createdAt)}</div>
        <div>Última actualización: {formatDate(order.updatedAt)}</div>
        <div>Cliente: {order.customerName} ({order.userEmail})</div>
        <div>Envío a: {order.address}</div>
      </div>

      <OrderSummary order={order} />                                      {/* items, cantidades, precios del snapshot */}
    </section>
  )
}