//src/pages/AdminPage.tsx
import './AdminPage.css'                                   // 🆕 sus propios estilos
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/auth/useAuth'

export function AdminPage() {                              // página /admin (Resumen)
  const { user } = useAuth()

  return (
    <section className="resumen-card">                     {/* caja blanca */}
      <h2>⚙️ Resumen</h2>
      <p className="resumen-saludo">
        Hola <strong>{user?.name}</strong> ({user?.email}) · Rol: <strong>{user?.role}</strong>
      </p>

      <div className="resumen-accesos">                    {/* las 3 tarjetas */}
        <Link to="/admin/products" className="resumen-item">
          <span className="resumen-icono">💍</span>
          <span className="resumen-titulo">Gestionar productos</span>
          <span className="resumen-texto">Crear, editar y eliminar joyas</span>
        </Link>
        <Link to="/admin/orders" className="resumen-item">
          <span className="resumen-icono">📦</span>
          <span className="resumen-titulo">Ver pedidos</span>
          <span className="resumen-texto">Compras y su estado</span>
        </Link>
        <Link to="/admin/users" className="resumen-item">
          <span className="resumen-icono">👥</span>
          <span className="resumen-titulo">Ver usuarios</span>
          <span className="resumen-texto">Clientes y administradores</span>
        </Link>
      </div>
    </section>
  )
}