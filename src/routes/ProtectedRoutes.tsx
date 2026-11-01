//src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/auth/useAuth'

export function ProtectedRoute() {                         // guardia: solo con sesión
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p>Cargando...</p>                   // todavía revisando
  if (!user) {                                             // sin sesión → a Ingresar (recordando a dónde iba)
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }
  return <Outlet />                                        // pasó: muestra la página
}