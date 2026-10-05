import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/modules/gestion-usuarios-roles-permisos/store/authStore'
import { canReadModule } from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { moduloDeRuta } from '@/config/modulos'
import ForbiddenPage from './ForbiddenPage'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Primera barrera: exige sesion activa.
 * El bloqueo por permiso se hace mas abajo, con `<PermisoRequerido>`.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

interface PermisoRequeridoProps {
  /** Clave de modulo. Si se omite se deduce de la URL actual. */
  modulo?: string
  children: ReactNode
}

/**
 * Segunda barrera: valida el permiso de lectura del modulo.
 *
 * Impide que un usuario sin permiso abra la pantalla escribiendo la URL directamente,
 * no solo que la vea oculta en el menu lateral.
 */
export function PermisoRequerido({ modulo, children }: PermisoRequeridoProps) {
  const location = useLocation()
  const moduloActual = modulo ?? moduloDeRuta(location.pathname)?.clave

  // Rutas sin modulo registrado (por ejemplo /perfil): solo requieren sesion.
  if (!moduloActual) return children

  if (!canReadModule(moduloActual)) {
    return <ForbiddenPage modulo={moduloActual} />
  }

  return children
}