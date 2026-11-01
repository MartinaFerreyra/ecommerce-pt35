//src/services/adminProductsService.ts
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'                                             // herramientas de Firestore
import type { DocumentData } from 'firebase/firestore'
import { db } from './firebase'
import type { Product } from '../types/Product'

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> // los datos que manda el formulario

const productsRef = collection(db, 'products')                          // la colección "products"

function toProduct(id: string, data: DocumentData): Product {           // documento → Product
  return {
    id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    imageUrl: data.imageUrl,
    stock: data.stock,
  }
}

// READ: todas (para la tabla)
export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(query(productsRef, orderBy('name')))
  return snapshot.docs.map((d) => toProduct(d.id, d.data()))
}

// READ: una sola (para precargar el formulario de edición)
export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id))                    // lee products/{id}
  return snap.exists() ? toProduct(snap.id, snap.data()) : null         // si no existe, null
}

// CREATE
export async function createProduct(data: ProductInput): Promise<string> {
  const ref = await addDoc(productsRef, {                               // documento con ID automático
    ...data,
    createdAt: serverTimestamp(),                                       // fecha de creación
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

// UPDATE
export async function updateProduct(id: string, data: ProductInput): Promise<void> {
  await updateDoc(doc(db, 'products', id), {                            // cambia solo esos campos
    ...data,
    updatedAt: serverTimestamp(),                                       // fecha de modificación
  })
}

// DELETE
export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id))
}