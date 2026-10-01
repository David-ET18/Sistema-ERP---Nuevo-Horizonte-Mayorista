import { useAuthStore } from '../store/authStore'
import type { Permiso } from '../types'

export function userHasRole(userRole: string): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false
  return user.roles.some((rol) => rol.nombre === userRole)
}

export function userCanManage(): boolean {
  return userHasRole('Administración') || userHasRole('Gerencia')
}

function canModule(modulo: string, check: (permiso: Permiso) => boolean): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false
  return user.roles.some((rol) =>
    rol.permisos.some((permiso) => permiso.modulo === modulo && check(permiso)),
  )
}

export function canReadModule(modulo: string): boolean {
  return canModule(modulo, (permiso) => permiso.puedeLeer)
}

export function canCreateModule(modulo: string): boolean {
  return canModule(modulo, (permiso) => permiso.puedeCrear)
}

export function canUpdateModule(modulo: string): boolean {
  return canModule(modulo, (permiso) => permiso.puedeActualizar)
}

export function canDeleteModule(modulo: string): boolean {
  return canModule(modulo, (permiso) => permiso.puedeEliminar)
}