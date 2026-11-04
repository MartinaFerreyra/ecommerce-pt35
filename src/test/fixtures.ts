// src/test/fixtures.ts
// Datos de mentira que reutilizan todos los tests (no tocan Firebase).
import type { User } from '../types/User'
import type { Product } from '../types/Product'

export const clienta: User = { id: 'uid-ana', name: 'Ana', email: 'ana@test.com', role: 'customer' }   // usuaria cliente
export const cliente2: User = { id: 'uid-beto', name: 'Beto', email: 'beto@test.com', role: 'customer' } // otro cliente
export const admin: User = { id: 'uid-admin', name: 'María', email: 'admin@test.com', role: 'admin' }   // administradora

export const collar: Product = {          // joya con stock 10
  id: 'p1',
  name: 'Collar Luna',
  description: 'Collar de prueba',
  price: 1000,
  category: 'collares',
  stock: 10,
}

export const anillo: Product = {          // joya con stock 2 (para probar el límite)
  id: 'p2',
  name: 'Anillo Sol',
  description: 'Anillo de prueba',
  price: 500,
  category: 'anillos',
  stock: 2,
}

export const agotado: Product = {         // joya sin stock
  id: 'p3',
  name: 'Pulsera Agotada',
  description: 'Pulsera sin stock',
  price: 800,
  category: 'pulseras',
  stock: 0,
}