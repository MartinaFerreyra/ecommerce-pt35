//src/types/Product.ts
export type ProductCategory = 'collares' | 'pulseras' | 'anillos'   // categorías posibles
export type CategoryFilter = ProductCategory | 'todas'              // para la barra de filtros

export interface Product {          // "formulario" de una joya
  id: string                        // id único (ej: 'p1')
  name: string                      // nombre
  description: string               // descripción
  price: number                     // precio como número
  category: ProductCategory         // categoría
  imageUrl?: string                 // imagen (opcional)
  active?: boolean                  // 🆕 visible en la tienda (el admin puede "ocultar" sin borrar)
  stock: number                     // 🆕 opcional: unidades disponibles
  createdAt?: Date                  // 🆕 cuándo se creó (lo completa el panel admin)
  updatedAt?: Date                  // 🆕 cuándo se editó por última vez
}