//src/utils/shipping.ts
import type { ShippingMethod } from '../types/Order'                     // 'delivery' | 'pickup'

export const PICKUP_POINTS = [                                           // puntos de retiro (editalos)
  'Local M Lady Centro — Mendoza Capital',
  'Punto de retiro Las Heras',
  'Punto de retiro Godoy Cruz',
]

export const SHIPPING_OPTIONS: Record<ShippingMethod, { label: string; detail: string; cost: number }> = {
  delivery: { label: '🚚 Envío a domicilio', detail: '3 a 5 días hábiles', cost: 3500 },
  pickup: { label: '🏬 Retiro en punto de entrega', detail: 'Listo en 48 hs', cost: 0 },
}

export const FREE_SHIPPING_FROM = 50000                                  // envío gratis desde $50.000

export function getShippingCost(method: ShippingMethod, subtotal: number): number {
  if (method === 'pickup') return 0                                      // retiro: gratis
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_OPTIONS.delivery.cost
}