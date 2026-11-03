//src/pages/orders/OrderConfirmationPage.tsx
import '../../components/orders/Orders.css'                              // estilos
import { Link, useParams } from 'react-router-dom'                       // leer :orderId de la URL
import { useOrder } from '../../hooks/useOrder'                          // cargar el pedido
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { OrderSummary } from '../../components/orders/OrderSummary'

export function OrderConfirmationPage() {
  const { orderId } = useParams()                                        // ej: /orders/abc123/confirmation
  const { order, loading, error } = useOrder(orderId)                    // lo trae de Firestore

  if (loading) return <p className="orders-estado">Cargando tu pedido...</p> // LOADING

  if (error || !order) {                                                 // ERROR
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
      <p>Número de pedido: <code className="order-id">{order.id}</code></p>  {/* el orderId */}
      <p>Estado: <OrderStatusBadge status={order.status} /></p>             {/* estado */}
      <OrderSummary order={order} />                                         {/* resumen de joyas */}
      <p className="orders-nota">Compra simulada: no se realizó ningún cobro.</p>
      <div className="orders-acciones">
        <Link to="/orders" className="orders-btn">Ver mis pedidos</Link>
        <Link to="/products" className="orders-link">Seguir comprando</Link>
      </div>
    </section>
  )
}