//src/pages/admin/AdminOrdersPage.tsx
import './AdminProductsPage.css'                                           // mismos estilos de tabla
import { useEffect, useState } from 'react'
import { getAllOrders, updateOrderStatus } from '../../services/ordersService'
import type { Order, OrderStatus } from '../../types/Order'

const ESTADOS: { valor: OrderStatus; texto: string }[] = [                 // opciones del desplegable
  { valor: 'pending', texto: 'Pendiente' },
  { valor: 'paid', texto: 'Pagado' },
  { valor: 'shipped', texto: 'Enviado' },
  { valor: 'cancelled', texto: 'Cancelado' },
]

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)                             // LOADING
  const [error, setError] = useState<string | null>(null)                  // ERROR
  const [updatingId, setUpdatingId] = useState<string | null>(null)        // UPDATING: qué pedido se está guardando
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let cancelado = false
    getAllOrders()
      .then((data) => { if (!cancelado) setOrders(data) })
      .catch(() => { if (!cancelado) setError('No se pudieron cargar los pedidos.') })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [recarga])

  const reintentar = () => {
    setError(null)
    setLoading(true)
    setRecarga((n) => n + 1)
  }

  const cambiarEstado = async (id: string, status: OrderStatus) => {       // al cambiar el desplegable
    setUpdatingId(id)
    try {
      await updateOrderStatus(id, status)                                  // guarda en Firestore
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))) // y en la tabla
    } catch {
      setError('No se pudo actualizar el pedido.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <p className="admin-estado">Cargando pedidos...</p>  // LOADING

  if (error) {                                                             // ERROR
    return (
      <div className="admin-estado">
        <p className="admin-error">{error}</p>
        <button className="admin-btn" onClick={reintentar}>Reintentar</button>
      </div>
    )
  }

  if (orders.length === 0) {                                               // EMPTY
    return <p className="admin-estado">Todavía no hay pedidos.</p>
  }

  return (
    <div>
      <div className="admin-encabezado">
        <h2>Pedidos ({orders.length})</h2>
      </div>

      <div className="tabla-scroll">
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Joyas</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className={updatingId === o.id ? 'fila-borrando' : ''}>
                <td>{o.createdAt?.toLocaleDateString('es-AR') ?? '—'}</td>
                <td>
                  {o.customerName}<br />
                  <small>{o.userEmail}</small><br />
                  <small>{o.address}</small>
                </td>
                <td>
                  {o.items.map((item) => (
                    <div key={item.productId}>{item.name} × {item.quantity}</div>
                  ))}
                </td>
                <td>${o.total.toLocaleString('es-AR')}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => cambiarEstado(o.id, e.target.value as OrderStatus)}
                    disabled={updatingId === o.id}                         // mientras guarda, no deja tocar
                  >
                    {ESTADOS.map((s) => (
                      <option key={s.valor} value={s.valor}>{s.texto}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}