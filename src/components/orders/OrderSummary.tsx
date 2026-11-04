//src/components/orders/OrderSummary.tsx
import './Orders.css'
import type { Order } from '../../types/Order'
import { formatPrice } from '../../utils/format'

export function OrderSummary({ order }: { order: Order }) {              // joyas + totales del ticket
  return (
    <div className="order-summary">
      <ul className="order-items">
        {order.items.map((item) => (                                     // cada joya del snapshot
          <li key={item.productId} className="order-item">
            {item.imageUrl
              ? <img src={item.imageUrl} alt={item.name} />
              : <div className="order-item-sin-foto">💍</div>}
            <div className="order-item-info">
              <strong>{item.name}</strong>
              <small>{item.quantity} × {formatPrice(item.price)}</small>
            </div>
            <span className="order-item-subtotal">{formatPrice(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      <div className="order-totales">
        <p>Subtotal ({order.itemCount} {order.itemCount === 1 ? 'joya' : 'joyas'}): {formatPrice(order.subtotal)}</p>
        <p>Envío: {order.shipping.cost === 0 ? 'Gratis' : formatPrice(order.shipping.cost)}</p>
        <p className="order-total">Total: <strong>{formatPrice(order.total)}</strong></p>
      </div>
    </div>
  )
}