import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Loading } from './States'

export default function PrivateRoute() {
  const { status } = useAuth()
  const location = useLocation()

  // Mientras se valida el token no mostramos el login
  if (status === 'checking') return <Loading text="Restaurando sesión..." />

  // Guardamos a dónde quería ir para volver ahí después del login
  if (status === 'out') return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
