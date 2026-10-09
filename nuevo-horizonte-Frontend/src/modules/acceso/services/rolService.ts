import { http } from '@/api/http'
import { ENDPOINTS } from '@/api/endpoints'
import type { Rol, RolRequest } from '../types'

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