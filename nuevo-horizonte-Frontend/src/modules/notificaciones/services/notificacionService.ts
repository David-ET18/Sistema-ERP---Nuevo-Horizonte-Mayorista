import { http } from '@/api/http'
import { ENDPOINTS } from './endpoints'
import type { Notificacion } from '../types'

export async function listarNotificaciones(): Promise<Notificacion[]> {
  const { data } = await http.get<Notificacion[]>(ENDPOINTS.notificaciones.base)
  return data
}

export async function contarNoLeidas(): Promise<number> {
  const { data } = await http.get<number>(ENDPOINTS.notificaciones.noLeidas)
  return data
}

export async function marcarNotificacionesLeidas(ids: number[]): Promise<void> {
  await http.post(ENDPOINTS.notificaciones.leidas, { ids })
}