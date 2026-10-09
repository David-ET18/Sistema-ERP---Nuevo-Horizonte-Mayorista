import { http } from '@/api/http'
import { ENDPOINTS } from './endpoints'
import type {
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
} from '../types'

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await http.get<Usuario[]>(ENDPOINTS.usuarios.base)
  return data
}

export async function obtenerUsuario(id: number): Promise<Usuario> {
  const { data } = await http.get<Usuario>(ENDPOINTS.usuarios.byId(id))
  return data
}

export async function crearUsuario(
  payload: UsuarioCreateRequest,
): Promise<Usuario> {
  const { data } = await http.post<Usuario>(ENDPOINTS.usuarios.base, payload)
  return data
}

export async function actualizarUsuario(
  id: number,
  payload: UsuarioUpdateRequest,
): Promise<Usuario> {
  const { data } = await http.put<Usuario>(
    ENDPOINTS.usuarios.byId(id),
    payload,
  )
  return data
}

export async function desactivarUsuario(id: number): Promise<void> {
  await http.delete(ENDPOINTS.usuarios.byId(id))
}

export async function eliminarUsuarioDefinitivo(id: number): Promise<void> {
  await http.delete(`${ENDPOINTS.usuarios.byId(id)}/definitivo`)
}

export async function anonimizarUsuario(id: number): Promise<void> {
  await http.patch(`${ENDPOINTS.usuarios.byId(id)}/anonimizar`)
}