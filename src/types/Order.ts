//src/types/Order.ts
import type { ProductCategory } from './Product'                       // categorías de joyas

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled' // estados posibles del pedido

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {      // texto en español de cada estado
  pending: 'Pendiente',                                                // recién creado
  paid: 'Pagado',                                                      // pago confirmado
  shipped: 'Enviado',                                                  // en camino
  cancelled: 'Cancelado',                                              // anulado
}

export interface OrderItemSnapshot {        // "ticket": copia de la joya en el momento de la compra
  productId: string                         // qué joya era (solo como referencia)
  name: string                              // nombre en ese momento
  price: number                             // precio unitario en ese momento
  quantity: number                          // cuántas unidades
  subtotal: number                          // price × quantity, ya calculado
  imageUrl: string | null                   // foto en ese momento (null si no tenía)
  category: ProductCategory                 // categoría en ese momento
}

export interface Order {                    // un pedido completo
  id: string                                // ID automático de Firestore (el orderId)
  userId: string                            // quién compró
  userEmail: string                         // su email
  customerName: string                      // nombre del formulario de Pago
  address: string                           // dirección de envío
  items: OrderItemSnapshot[]                // las joyas (copias, no links)
  itemCount: number                         // total de unidades
  total: number                             // total pagado
  status: OrderStatus                       // estado del pedido
  createdAt?: Date                          // cuándo se hizo (hora del servidor)
  updatedAt?: Date                          // último cambio de estado
}

export type NewOrder = Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'> // lo que manda el checkout