//src/pages/admin/AdminOrdersPage.tsx
import './AdminProductsPage.css'                                           // estilos de tabla
import '../../components/orders/Orders.css'                               // etiquetas y desplegables
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllOrders, updateOrderStatus } from '../../services/ordersService'
import { ORDER_STATUS_LABELS } from '../../types/Order'
import type { Order, OrderStatus } from '../../types/Order'
import { formatDate, formatPrice } from '../../utils/format'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { Spinner } from '../../components/common/Spinner'                 // círculo de carga

const ESTADOS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]          // los 4 estados
type Filtro = OrderStatus | 'todos'

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)        // cuál se está guardando
  const [filtro, setFiltro] = useState<Filtro>('todos')                    // FILTRO
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let cancelado = false
    getAllOrders()
      .then((data) => { if (!cancelado) setOrders(data) })
      .catch((err) => {
        console.error('admin orders error:', err)
        if (!cancelado) setError('No se pudieron cargar los pedidos.')
      })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [recarga])

  const visibles = useMemo(                                                // pedidos filtrados
    () => (filtro === 'todos' ? orders : orders.filter((o) => o.status === filtro)),
    [orders, filtro],
  )

  const contar = (estado: Filtro) =>                                       // cuántos hay de cada estado
    estado === 'todos' ? orders.length : orders.filter((o) => o.status === estado).length

  const reintentar = () => {
    setError(null)
    setLoading(true)
    setRecarga((n) => n + 1)
  }

  const cambiarEstado = async (id: string, status: OrderStatus) => {       // al cambiar Acción
    setUpdatingId(id)
    try {
      await updateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date() } : o)))
    } catch (err) {
      console.error('update order error:', err)
      setError('No se pudo actualizar el pedido.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <Spinner texto="Cargando pedidos..." />              // LOADING

  if (error) {
    return (
      <div className="admin-estado">
        <p className="admin-error">{error}</p>
        <button className="admin-btn" onClick={reintentar}>Reintentar</button>
      </div>
    )
  }

  return (
    <div>
      <div className="admin-encabezado">
        <h2>Lista de órdenes ({visibles.length})</h2>
      </div>

      <select className="admin-filtro" value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)}>
        <option value="todos">Todas ({contar('todos')})</option>
        {ESTADOS.map((s) => (
          <option key={s} value={s}>{ORDER_STATUS_LABELS[s]} ({contar(s)})</option>
        ))}
      </select>

      {visibles.length === 0 ? (
        <p className="admin-estado">No hay órdenes con ese estado.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((o) => (
                <tr key={o.id} className={updatingId === o.id ? 'fila-borrando' : ''}>
                  <td>
                    <Link to={`/orders/${o.id}`} className="admin-id">{o.id}</Link> {/* clic → detalle */}
                    <br />
                    <small>{formatDate(o.createdAt)}</small>
                  </td>
                  <td>
                    {o.customerName}<br />
                    <small>{o.userEmail}</small><br />
                    <small>{o.address}</small>                            {/* localidad o retiro */}
                  </td>
                  <td>{formatPrice(o.total)}</td>
                  <td><OrderStatusBadge status={o.status} /></td>
                  <td>
                    <select
                      className="admin-filtro"
                      value={o.status}
                      onChange={(e) => cambiarEstado(o.id, e.target.value as OrderStatus)}
                      disabled={updatingId === o.id}
                    >
                      {ESTADOS.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}