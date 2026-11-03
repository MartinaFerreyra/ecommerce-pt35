//src/components/orders/OrderSummary.tsx
import './Orders.css'                                                    // estilos de pedidos
import type { Order } from '../../types/Order'                           // contrato
import { formatPrice } from '../../utils/format'                         // $1.500

export function OrderSummary({ order }: { order: Order }) {              // lista de joyas del ticket
  return (
    <div className="order-summary">
      <ul className="order-items">
        {order.items.map((item) => (                                     // cada joya del snapshot
          <li key={item.productId} className="order-item">
            {item.imageUrl
              ? <img src={item.imageUrl} alt={item.name} />              // foto guardada en el ticket
              : <div className="order-item-sin-foto">💍</div>}           {/* si no tenía foto */}
            <div className="order-item-info">
              <strong>{item.name}</strong>                               {/* nombre del ticket */}
              <small>{item.quantity} × {formatPrice(item.price)}</small> {/* cantidad × precio */}
            </div>
            <span className="order-item-subtotal">{formatPrice(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      <p className="order-total">
        Total ({order.itemCount} {order.itemCount === 1 ? 'joya' : 'joyas'}):{' '}
        <strong>{formatPrice(order.total)}</strong>
      </p>
    </div>
  )
}