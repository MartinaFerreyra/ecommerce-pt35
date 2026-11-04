//src/services/ordersService.ts
import {
  addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where,
} from 'firebase/firestore'                                               // funciones de Firestore
import type { DocumentData } from 'firebase/firestore'                   // documento crudo
import { db } from './firebase'                                          // la base de datos
import type { NewOrder, Order, OrderItemSnapshot, OrderStatus } from '../types/Order'

const ordersRef = collection(db, 'orders')                               // colección "orders"

function toOrder(id: string, data: DocumentData): Order {                // documento → Order
  const items: OrderItemSnapshot[] = (data.items ?? []).map((item: DocumentData) => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal ?? item.price * item.quantity,               // órdenes viejas: lo calcula
    imageUrl: item.imageUrl ?? null,                                     // órdenes viejas: sin foto
    category: item.category,
  }))
  return {
    id,                                                                  // el orderId
    userId: data.userId,
    userEmail: data.userEmail,
    customerName: data.customerName,
    address: data.address ?? '',
    shipping: data.shipping ?? {                                         // órdenes viejas: sin detalle
      method: 'delivery', cost: 0, locality: null, pickupPoint: null,
    },
    items,
    itemCount: data.itemCount ?? items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: data.subtotal ?? data.total,                               // órdenes viejas: subtotal = total
    total: data.total,
    status: data.status,
    createdAt: data.createdAt?.toDate(),                                 // Timestamp → Date
    updatedAt: data.updatedAt?.toDate(),
  }
}

export async function createOrder(order: NewOrder): Promise<string> {    // crea un pedido
  const ref = await addDoc(ordersRef, {                                  // ID único automático
    ...order,
    status: 'pending',                                                   // arranca pendiente
    createdAt: serverTimestamp(),                                        // hora del servidor
    updatedAt: serverTimestamp(),
  })
  return ref.id                                                          // devuelve el orderId
}

export async function getOrderById(orderId: string): Promise<Order | null> { // un pedido por ID
  const snap = await getDoc(doc(db, 'orders', orderId))
  if (!snap.exists()) return null
  return toOrder(snap.id, snap.data())
}

export async function getMyOrders(userId: string): Promise<Order[]> {    // pedidos de UN usuario
  const q = query(
    ordersRef,
    where('userId', '==', userId),                                       // where: solo los míos
    orderBy('createdAt', 'desc'),                                        // orderBy: más nuevos primero
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => toOrder(d.id, d.data()))
}

export async function getAllOrders(): Promise<Order[]> {                 // todos (admin)
  const snapshot = await getDocs(query(ordersRef, orderBy('createdAt', 'desc')))
  return snapshot.docs.map((d) => toOrder(d.id, d.data()))
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> { // admin cambia estado
  await updateDoc(doc(db, 'orders', orderId), {
    status,                                                              // nuevo estado
    updatedAt: serverTimestamp(),                                        // cuándo cambió
  })
}