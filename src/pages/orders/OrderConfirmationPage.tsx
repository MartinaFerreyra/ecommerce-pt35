//src/pages/orders/OrderConfirmationPage.tsx
import '../../components/orders/Orders.css'
import { Link, useParams } from 'react-router-dom'
import { useOrder } from '../../hooks/useOrder'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { OrderSummary } from '../../components/orders/OrderSummary'

export function OrderConfirmationPage() {
  const { orderId } = useParams()                                        // /orders/:orderId/confirmation
  const { order, loading, error } = useOrder(orderId)

  if (loading) return <p className="orders-estado">Cargando tu pedido...</p>

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
      <h2>¡Gracias por tu compra! 💍</h2>
      <p>Número de pedido: <code className="order-id">{order.id}</code></p>
      <p>Estado: <OrderStatusBadge status={order.status} /></p>
      <p className="order-datos">{order.address}</p>                       {/* domicilio o retiro */}
      <OrderSummary order={order} />
      <p className="orders-nota">Compra simulada: no se realizó ningún cobro.</p>
      <div className="orders-acciones">
        <Link to="/orders" className="orders-btn">Ver mis pedidos</Link>
        <Link to="/products" className="orders-link">Seguir comprando</Link>
      </div>
    </section>
  )
}