//src/routes/ProtectedRoutes.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/auth/useAuth'
import { Spinner } from '../components/common/Spinner'   // círculo de carga

export function ProtectedRoute() {                         // guardia: solo con sesión
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />                        // todavía revisando la sesión
  if (!user) {                                             // sin sesión → a Ingresar (recordando a dónde iba)
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }
  return <Outlet />                                        // pasó: muestra la página
}