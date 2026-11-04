//src/types/Order.ts
import type { ProductCategory } from './Product'                       // categorías de joyas

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' // estados posibles

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {      // texto en español
  pending: 'Pendiente',                                                // recién creado
  processing: 'Procesando',                                            // el admin lo prepara
  shipped: 'Enviado',                                                  // en camino
  delivered: 'Entregado',                                              // llegó
  cancelled: 'Cancelado',                                              // anulado
}

export interface OrderItemSnapshot {        // "ticket": copia de la joya al momento de la compra
  productId: string                         // qué joya era
  name: string                              // nombre en ese momento
  price: number                             // precio unitario en ese momento
  quantity: number                          // cuántas unidades
  subtotal: number                          // price × quantity
  imageUrl: string | null                   // foto (null si no tenía)
  category: ProductCategory                 // categoría en ese momento
}

export type ShippingMethod = 'delivery' | 'pickup'   // envío a domicilio | retiro en punto

export interface ShippingInfo {             // cómo se entrega
  method: ShippingMethod                    // domicilio o retiro
  cost: number                              // costo del envío (0 = gratis)
  locality: string | null                   // localidad (solo si es domicilio)
  pickupPoint: string | null                // punto de retiro (solo si es retiro)
}

export interface Order {                    // un pedido completo
  id: string                                // ID único de Firestore (orderId)
  userId: string                            // quién compró
  userEmail: string                         // su email
  customerName: string                      // su nombre
  address: string                           // resumen de entrega en una línea
  shipping: ShippingInfo                    // detalle de la entrega
  items: OrderItemSnapshot[]                // las joyas (snapshot)
  itemCount: number                         // total de unidades
  subtotal: number                          // suma de las joyas
  total: number                             // subtotal + envío
  status: OrderStatus                       // estado
  createdAt?: Date                          // cuándo se hizo
  updatedAt?: Date                          // último cambio de estado
}

export type NewOrder = Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'> // lo que manda el checkout