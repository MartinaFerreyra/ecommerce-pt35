//src/services/productsService.ts
import type { Product, CategoryFilter } from '../types/Product'           // formularios
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore' // herramientas de consulta
import type { QueryDocumentSnapshot, DocumentData, QueryConstraint } from 'firebase/firestore'     // tipos de Firestore
import { db } from './firebase'                                            // tu base de datos

export type ProductsCursor = QueryDocumentSnapshot<DocumentData> | null    // marcador: dónde terminó la página anterior

export type ProductsPage = {                                               // lo que devuelve una página
  items: Product[]                                                         // las joyas de esta página
  lastDoc: ProductsCursor                                                  // marcador para la siguiente
  hasMore: boolean                                                         // ¿hay otra página?
}

type ListOptions = {                                                       // opciones para pedir una página
  pageSize?: number                                                        // cuántas por página
  cursor?: ProductsCursor                                                  // desde dónde empezar
  category?: CategoryFilter                                                // filtro de categoría
  search?: string                                                          // 🆕 texto buscado
}

function toProduct(documento: QueryDocumentSnapshot<DocumentData>): Product { // convierte un documento en Product
  const data = documento.data()
  return {
    id: documento.id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    imageUrl: data.imageUrl,
    stock: data.stock,
  }
}

export async function listProducts({
  pageSize = 6,
  cursor = null,
  category = 'todas',
  search = '',
}: ListOptions = {}): Promise<ProductsPage> {
  const filtros: QueryConstraint[] = []                                    // condiciones de la consulta
  if (category !== 'todas') filtros.push(where('category', '==', category)) // solo esa categoría
  if (search) {                                                            // 🆕 si escribió algo...
    filtros.push(where('name', '>=', search))                              // ...nombres que empiezan con el texto
    filtros.push(where('name', '<=', search + '\uf8ff'))                   // ...(\uf8ff = "cualquier cosa después")
  }
  filtros.push(orderBy('name'))                                            // ordenadas por nombre
  if (cursor) filtros.push(startAfter(cursor))                             // empezar después del marcador
  filtros.push(limit(pageSize + 1))                                        // una de más para saber si hay otra página

  const snapshot = await getDocs(query(collection(db, 'products'), ...filtros)) // ejecuta la consulta
  const docs = snapshot.docs.slice(0, pageSize)                            // solo las de esta página

  return {
    items: docs.map(toProduct),
    lastDoc: docs[docs.length - 1] ?? null,
    hasMore: snapshot.docs.length > pageSize,
  }
}