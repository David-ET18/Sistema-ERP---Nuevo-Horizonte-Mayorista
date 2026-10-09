import { useAuthStore } from '../store/authStore'
import type { Rol } from '../types'

export function userHasRole(userRole: string): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false
  return user.roles.some((rol: Rol) => rol.nombre === userRole)
}

export function userCanManage(): boolean {
  return userHasRole('Administración') || userHasRole('Gerencia')
}

export function canReadModule(modulo: string): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false
  return user.roles.some((rol) =>
    rol.permisos.some(
      (permiso) => permiso.modulo === modulo && permiso.puedeLeer,
    ),
  )
}

export function canWriteModule(modulo: string): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false
  return user.roles.some((rol) =>
    rol.permisos.some(
      (permiso) => permiso.modulo === modulo && permiso.puedeEscribir,
    ),
  )
}