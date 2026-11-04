//src/hooks/useOrder.ts
import { useEffect, useState } from 'react'
import { getOrderById } from '../services/ordersService'
import type { Order } from '../types/Order'

export function useOrder(orderId: string | undefined) {                  // carga un pedido por ID
  const [order, setOrder] = useState<Order | null>(null)                 // el pedido
  const [loading, setLoading] = useState(true)                           // ¿cargando?
  const [error, setError] = useState<string | null>(null)                // ¿falló?

  useEffect(() => {
    if (!orderId) return
    let cancelado = false                                                // por si se va antes
    getOrderById(orderId)
      .then((data) => {
        if (cancelado) return
        if (data) setOrder(data)
        else setError('No encontramos ese pedido.')
      })
      .catch((err) => {
        console.error('order error:', err)
        if (!cancelado) setError('No se pudo cargar el pedido.')
      })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [orderId])

  return { order, loading, error }
}