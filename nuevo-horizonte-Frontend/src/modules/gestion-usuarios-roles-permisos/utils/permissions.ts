import { useMemo } from 'react'

import { MODULOS, RUTA_PERFIL } from '@/config/modulos'
import { useAuthStore } from '../store/authStore'
import type { Permiso, Usuario } from '../types'

/** Logica pura: no lee el store, solo evalua el usuario que se le pase. */
function tieneAcceso(user: Usuario | null, modulo: string, check: (permiso: Permiso) => boolean): boolean {
  if (!user) return false
  return (user.roles ?? []).some((rol) =>
    (rol?.permisos ?? []).some(
      (permiso) => permiso?.modulo === modulo && check(permiso),
    ),
  )
}

function canModule(modulo: string, check: (permiso: Permiso) => boolean): boolean {
  return tieneAcceso(useAuthStore.getState().user, modulo, check)
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

const MODULO_SEGURIDAD = 'gestion-usuarios-roles-permisos'

/**
 * Puede crear, editar o eliminar roles/usuarios. Antes esto dependia de un
 * allowlist de nombres de rol hardcodeado ('Administración', 'Gerencia'),
 * desincronizado del backend (que ya usa permisos por modulo para los GET).
 * Ahora usa el mismo permiso de escritura sobre el modulo de seguridad que
 * exige el backend en POST/PUT/DELETE de /api/roles y /api/usuarios.
 */
export function userCanManage(): boolean {
  return (
    canCreateModule(MODULO_SEGURIDAD) ||
    canUpdateModule(MODULO_SEGURIDAD) ||
    canDeleteModule(MODULO_SEGURIDAD)
  )
}

/**
 * Primera ruta de menu a la que el usuario tiene permiso de lectura: se usa
 * al redireccionar desde la raiz o desde un 403 (si el panel tambien esta
 * restringido, `navigate('/dashboard')` volveria a mostrar el mismo 403 en
 * bucle).
 *
 * Es un hook (suscrito de verdad al store, no un `getState()` suelto) a
 * proposito: usado dentro del render para decidir un `<Navigate>`, un simple
 * snapshot podia ejecutarse en un momento intermedio justo despues del
 * login, antes de que React terminara de propagar el `user` nuevo, y
 * devolver el fallback de Perfil con datos todavia no asentados.
 */
export function usePrimeraRutaAccesible(): string {
  const user = useAuthStore((state) => state.user)
  return useMemo(() => {
    const permitida = MODULOS.find((m) => m.desarrollado && tieneAcceso(user, m.clave, (p) => Boolean(p?.puedeLeer)))
    return permitida?.ruta ?? RUTA_PERFIL
  }, [user])
}