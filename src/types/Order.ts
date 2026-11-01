//src/types/Order.ts
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'   // estados posibles del pedido

export interface OrderItem {                 // una joya dentro del pedido
  productId: string                          // qué joya era
  name: string                               // su nombre en ese momento
  price: number                              // su precio en ese momento
  quantity: number                           // cuántas
}

export interface Order {                     // un pedido completo
  id: string                                 // ID automático de Firestore
  userId: string                             // quién compró
  userEmail: string                          // su email
  customerName: string                       // nombre del formulario de Pago
  address: string                            // dirección de envío
  items: OrderItem[]                         // las joyas
  total: number                              // total pagado
  status: OrderStatus                        // estado del pedido
  createdAt?: Date                           // cuándo se hizo
}

export type NewOrder = Omit<Order, 'id' | 'status' | 'createdAt'>  // lo que manda el checkout