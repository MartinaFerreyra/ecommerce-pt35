//src/services/ordersService.ts
import {
  addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where,
} from 'firebase/firestore'                                               // funciones de Firestore
import type { DocumentData } from 'firebase/firestore'                   // tipo de un documento crudo
import { db } from './firebase'                                          // la base de datos
import type { NewOrder, Order, OrderItemSnapshot, OrderStatus } from '../types/Order' // contratos

const ordersRef = collection(db, 'orders')                               // la colección "orders"

function toOrder(id: string, data: DocumentData): Order {                // documento de Firestore → Order
  const items: OrderItemSnapshot[] = (data.items ?? []).map((item: DocumentData) => ({
    productId: item.productId,                                           // copia cada campo del ticket
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal ?? item.price * item.quantity,               // pedidos viejos no tenían subtotal
    imageUrl: item.imageUrl ?? null,                                     // pedidos viejos no tenían foto
    category: item.category,
  }))
  return {
    id,                                                                  // el orderId
    userId: data.userId,
    userEmail: data.userEmail,
    customerName: data.customerName,
    address: data.address,
    items,
    itemCount: data.itemCount ?? items.reduce((sum, item) => sum + item.quantity, 0), // calcula si falta
    total: data.total,
    status: data.status,
    createdAt: data.createdAt?.toDate(),                                 // Timestamp → Date
    updatedAt: data.updatedAt?.toDate(),
  }
}

export async function createOrder(order: NewOrder): Promise<string> {    // guarda un pedido nuevo
  const ref = await addDoc(ordersRef, {                                  // addDoc = ID automático
    ...order,                                                            // datos del checkout
    status: 'pending',                                                   // todo pedido arranca pendiente
    createdAt: serverTimestamp(),                                        // hora del SERVIDOR (no de la compu)
    updatedAt: serverTimestamp(),                                        // igual al crearse
  })
  return ref.id                                                          // devuelve el orderId
}

export async function getOrderById(orderId: string): Promise<Order | null> { // un pedido por su ID
  const snap = await getDoc(doc(db, 'orders', orderId))                  // lee el documento
  if (!snap.exists()) return null                                        // no existe
  return toOrder(snap.id, snap.data())                                   // lo convierte
}

export async function getMyOrders(userId: string): Promise<Order[]> {    // pedidos de UN usuario
  const q = query(
    ordersRef,
    where('userId', '==', userId),                                       // where: solo los míos
    orderBy('createdAt', 'desc'),                                        // orderBy: los más nuevos primero
  )
  const snapshot = await getDocs(q)                                      // ejecuta la consulta
  return snapshot.docs.map((d) => toOrder(d.id, d.data()))               // convierte cada uno
}

export async function getAllOrders(): Promise<Order[]> {                 // todos los pedidos (admin)
  const snapshot = await getDocs(query(ordersRef, orderBy('createdAt', 'desc')))
  return snapshot.docs.map((d) => toOrder(d.id, d.data()))
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> { // admin cambia estado
  await updateDoc(doc(db, 'orders', orderId), {
    status,                                                              // nuevo estado
    updatedAt: serverTimestamp(),                                        // cuándo cambió
  })                                                                     // SOLO estos 2 campos (lo exige la regla)
}