//src/pages/admin/AdminUsersPage.tsx
import './AdminProductsPage.css'                                          // mismos estilos de tabla
import { useEffect, useState } from 'react'
import { getAllUsers, updateUserRole } from '../../services/usersService'
import type { UserListItem } from '../../services/usersService'
import type { UserRole } from '../../types/User'
import { useAuth } from '../../contexts/auth/useAuth'                     // para saber quién soy yo
import { Spinner } from '../../components/common/Spinner'                // círculo de carga

export function AdminUsersPage() {
  const { user: yo } = useAuth()                                          // el admin logueado
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)                            // LOADING
  const [error, setError] = useState<string | null>(null)                 // ERROR
  const [updatingId, setUpdatingId] = useState<string | null>(null)       // UPDATING
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let cancelado = false
    getAllUsers()
      .then((data) => { if (!cancelado) setUsers(data) })
      .catch(() => { if (!cancelado) setError('No se pudieron cargar los usuarios.') })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [recarga])

  const reintentar = () => {
    setError(null)
    setLoading(true)
    setRecarga((n) => n + 1)
  }

  const cambiarRol = async (u: UserListItem, role: UserRole) => {         // al cambiar el desplegable
    if (!window.confirm(`¿Cambiar el rol de ${u.name} a "${role}"?`)) return
    setUpdatingId(u.id)
    try {
      await updateUserRole(u.id, role)                                    // guarda en Firestore
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x))) // y en la tabla
    } catch {
      setError('No se pudo cambiar el rol.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <Spinner texto="Cargando usuarios..." />            // LOADING

  if (error) {                                                            // ERROR
    return (
      <div className="admin-estado">
        <p className="admin-error">{error}</p>
        <button className="admin-btn" onClick={reintentar}>Reintentar</button>
      </div>
    )
  }

  if (users.length === 0) return <p className="admin-estado">Todavía no hay usuarios.</p> // EMPTY

  const cantidadAdmins = users.filter((u) => u.role === 'admin').length

  return (
    <div>
      <div className="admin-encabezado">
        <h2>Usuarios ({users.length})</h2>
        <span>👑 {cantidadAdmins} admin · 🛍️ {users.length - cantidadAdmins} clientes</span>
      </div>

      <div className="tabla-scroll">
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Registro</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const soyYo = u.id === yo?.id                               // ¿es mi propia cuenta?
              return (
                <tr key={u.id} className={updatingId === u.id ? 'fila-borrando' : ''}>
                  <td>{u.name}{soyYo && ' (vos)'}</td>
                  <td>{u.email}</td>
                  <td>{u.createdAt?.toLocaleDateString('es-AR') ?? '—'}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => cambiarRol(u, e.target.value as UserRole)}
                      disabled={soyYo || updatingId !== null}             // no podés cambiar tu propio rol
                      title={soyYo ? 'No podés cambiar tu propio rol' : ''}
                    >
                      <option value="customer">Cliente</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}