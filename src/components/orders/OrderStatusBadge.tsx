//src/components/orders/OrderStatusBadge.tsx
import type { OrderStatus } from '../../types/Order'                     // tipo del estado
import { ORDER_STATUS_LABELS } from '../../types/Order'                  // textos en español

export function OrderStatusBadge({ status }: { status: OrderStatus }) {  // etiqueta de color
  return (
    <span className={`order-status order-status--${status}`}>           {/* clase según el estado */}
      {ORDER_STATUS_LABELS[status]}                                      {/* ej: "Pendiente" */}
    </span>
  )
}