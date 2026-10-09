import { http } from '@/api/http'
import { ENDPOINTS } from './endpoints'
import type { Modulo, Rol, RolRequest } from '../types'

/** Catálogo real de módulos (ver GET /api/modulos en el backend): es la fuente
 * de verdad que alimenta la matriz de permisos del formulario de roles. */
export async function listarModulos(): Promise<Modulo[]> {
  const { data } = await http.get<Modulo[]>(ENDPOINTS.modulos.base)
  return data
}

export async function listarRoles(): Promise<Rol[]> {
  const { data } = await http.get<Rol[]>(ENDPOINTS.roles.base)
  return data
}

export async function obtenerRol(id: number): Promise<Rol> {
  const { data } = await http.get<Rol>(ENDPOINTS.roles.byId(id))
  return data
}

export async function crearRol(payload: RolRequest): Promise<Rol> {
  const { data } = await http.post<Rol>(ENDPOINTS.roles.base, payload)
  return data
}

export async function actualizarRol(
  id: number,
  payload: RolRequest,
): Promise<Rol> {
  const { data } = await http.put<Rol>(ENDPOINTS.roles.byId(id), payload)
  return data
}

export async function eliminarRol(id: number): Promise<void> {
  await http.delete(ENDPOINTS.roles.byId(id))
}