//src/hooks/useOrder.ts
import { useEffect, useState } from 'react'                              // estado y efectos
import { getOrderById } from '../services/ordersService'                 // leer un pedido
import type { Order } from '../types/Order'                              // contrato

export function useOrder(orderId: string | undefined) {                  // carga un pedido por ID
  const [order, setOrder] = useState<Order | null>(null)                 // el pedido
  const [loading, setLoading] = useState(true)                           // ¿cargando?
  const [error, setError] = useState<string | null>(null)                // ¿falló?

  useEffect(() => {
    if (!orderId) return                                                 // sin ID no hay nada que buscar
    let cancelado = false                                                // por si el usuario se va antes
    getOrderById(orderId)
      .then((data) => {
        if (cancelado) return
        if (data) setOrder(data)                                         // lo encontró
        else setError('No encontramos ese pedido.')                      // no existe
      })
      .catch((err) => {
        console.error('order error:', err)                               // detalle técnico en consola
        if (!cancelado) setError('No se pudo cargar el pedido.')         // mensaje amigable
      })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }                                    // limpieza
  }, [orderId])

  return { order, loading, error }                                       // lo que devuelve el hook
}