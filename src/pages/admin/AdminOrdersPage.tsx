//src/pages/admin/AdminOrdersPage.tsx
import './AdminProductsPage.css'                                           // mismos estilos de tabla
import '../../components/orders/Orders.css'                               // etiquetas de estado
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllOrders, updateOrderStatus } from '../../services/ordersService'
import { ORDER_STATUS_LABELS } from '../../types/Order'                    // textos en español
import type { Order, OrderStatus } from '../../types/Order'
import { formatDate, formatPrice } from '../../utils/format'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge' // etiqueta de color

const ESTADOS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]          // ['pending','paid','shipped','cancelled']
type Filtro = OrderStatus | 'todos'                                        // filtro elegido

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])                        // todos los pedidos
  const [loading, setLoading] = useState(true)                             // LOADING
  const [error, setError] = useState<string | null>(null)                  // ERROR
  const [updatingId, setUpdatingId] = useState<string | null>(null)        // cuál se está guardando
  const [filtro, setFiltro] = useState<Filtro>('todos')                    // FILTRO por estado
  const [recarga, setRecarga] = useState(0)                                // para reintentar

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

  const visibles = useMemo(                                                // pedidos que pasan el filtro
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

  const cambiarEstado = async (id: string, status: OrderStatus) => {       // al cambiar el desplegable
    setUpdatingId(id)
    try {
      await updateOrderStatus(id, status)                                  // guarda status + updatedAt
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date() } : o)))
    } catch (err) {
      console.error('update order error:', err)
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

    return (
    <div>
      <div className="admin-encabezado">
        <h2>Lista de órdenes ({visibles.length})</h2>                       {/* título */}
      </div>

      <select                                                              // FILTRO por estado
        className="admin-filtro"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value as Filtro)}
      >
        <option value="todos">Todas ({contar('todos')})</option>
        {ESTADOS.map((s) => (
          <option key={s} value={s}>{ORDER_STATUS_LABELS[s]} ({contar(s)})</option>
        ))}
      </select>

      {visibles.length === 0 ? (                                          // EMPTY
        <p className="admin-estado">No hay órdenes con ese estado.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>ID</th>                                               {/* número de orden */}
                <th>Usuario</th>                                          {/* quién compró */}
                <th>Total</th>                                            {/* cuánto */}
                <th>Estado</th>                                           {/* etiqueta de color */}
                <th>Acción</th>                                           {/* cambiar estado */}
              </tr>
            </thead>
            <tbody>
              {visibles.map((o) => (
                <tr key={o.id} className={updatingId === o.id ? 'fila-borrando' : ''}>
                  <td>
                    <Link to={`/orders/${o.id}`} className="admin-id">   {/* clic → detalle */}
                      {o.id}
                    </Link>
                    <br />
                    <small>{formatDate(o.createdAt)}</small>              {/* fecha debajo */}
                  </td>
                  <td>
                    {o.customerName}<br />
                    <small>{o.userEmail}</small>                          {/* email más legible que el uid */}
                  </td>
                  <td>{formatPrice(o.total)}</td>
                  <td><OrderStatusBadge status={o.status} /></td>         {/* Pendiente / Enviado... */}
                  <td>
                    <select
                      className="admin-filtro"
                      value={o.status}
                      onChange={(e) => cambiarEstado(o.id, e.target.value as OrderStatus)}
                      disabled={updatingId === o.id}                      // mientras guarda, bloqueado
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