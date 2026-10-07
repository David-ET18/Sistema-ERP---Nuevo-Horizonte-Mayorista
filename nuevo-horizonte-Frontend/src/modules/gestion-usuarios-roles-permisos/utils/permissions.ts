import { MODULOS, RUTA_PERFIL } from '@/config/modulos'
import { useAuthStore } from '../store/authStore'
import type { Permiso } from '../types'

export function userHasRole(userRole: string): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false
  return (user.roles ?? []).some((rol) => rol?.nombre === userRole)
}

export function userCanManage(): boolean {
  return userHasRole('Administración') || userHasRole('Gerencia')
}

function canModule(modulo: string, check: (permiso: Permiso) => boolean): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false
  return (user.roles ?? []).some((rol) =>
    (rol?.permisos ?? []).some(
      (permiso) => permiso?.modulo === modulo && check(permiso),
    ),
  )
}

export function canReadModule(modulo: string): boolean {
  return canModule(modulo, (permiso) => Boolean(permiso?.puedeLeer))
}

export function canCreateModule(modulo: string): boolean {
  return canModule(modulo, (permiso) => Boolean(permiso?.puedeCrear))
}

export function canUpdateModule(modulo: string): boolean {
  return canModule(modulo, (permiso) => Boolean(permiso?.puedeActualizar))
}

export function canDeleteModule(modulo: string): boolean {
  return canModule(modulo, (permiso) => Boolean(permiso?.puedeEliminar))
}

/**
 * Primera ruta de menu a la que el usuario tiene permiso de lectura.
 *
 * Se usa al redireccionar desde un 403: si el panel tambien esta restringido,
 * `navigate('/dashboard')` volveria a mostrar el mismo 403 en bucle.
 */
export function primeraRutaAccesible(): string {
  const permitida = MODULOS.find((m) => m.desarrollado && canReadModule(m.clave))
  return permitida?.ruta ?? RUTA_PERFIL
}