//src/routes/AdminRoute.tsx
import '../pages/AuthPages.css'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/auth/useAuth'
import { Spinner } from '../components/common/Spinner'   // círculo de carga

export function AdminRoute() {                             // guardia: solo admins
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />                        // todavía revisando la sesión
  if (!user) {                                             // sin sesión → a Ingresar
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }
  if (!isAdmin) {                                          // con sesión pero no es admin
    return (
      <section className="auth-card">
        <h2>⛔ Acceso restringido</h2>
        <p>Esta sección es solo para administradores.</p>
        <Link to="/products">Volver a la tienda</Link>
      </section>
    )
  }
  return <Outlet />                                        // es admin: pasa
}