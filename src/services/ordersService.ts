//src/services/ordersService.ts
import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { NewOrder, Order, OrderStatus } from '../types/Order'

const ordersRef = collection(db, 'orders')                         // la colección "orders"

export async function createOrder(order: NewOrder): Promise<string> { // guarda un pedido nuevo
  const ref = await addDoc(ordersRef, {                            // addDoc = documento con ID automático
    ...order,
    status: 'pending',                                             // todo pedido arranca "pendiente"
    createdAt: serverTimestamp(),                                  // hora del servidor de Firebase
  })
  return ref.id                                                    // devuelve el número de pedido
}

export async function getAllOrders(): Promise<Order[]> {           // todos los pedidos (para el admin)
  const snapshot = await getDocs(query(ordersRef, orderBy('createdAt', 'desc'))) // los más nuevos primero
  return snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      userId: data.userId,
      userEmail: data.userEmail,
      customerName: data.customerName,
      address: data.address,
      items: data.items,
      total: data.total,
      status: data.status,
      createdAt: data.createdAt?.toDate(),                         // Timestamp de Firestore → Date
    }
  })
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> { // cambia el estado
  await updateDoc(doc(db, 'orders', id), { status })
}