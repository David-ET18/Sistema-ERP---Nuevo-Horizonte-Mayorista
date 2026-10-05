import { http } from '@/api/http'
import type { Agencia } from '../types'
import type { AgenciaFichaResumen, HistorialComercialItem, NotaSeguimiento, ResumenComercial } from '../ficha-types'

const BASE = '/gestion-agencias'

export function listarFicha(q: string): Promise<AgenciaFichaResumen[]> {
  const params = q.trim() ? { q: q.trim() } : undefined
  return http.get(`${BASE}/ficha`, { params }).then((r) => r.data)
}

export function detalleAgenciaFicha(id: number): Promise<Agencia> {
  return http.get(`${BASE}/${id}`).then((r) => r.data)
}

export function resumenComercial(id: number): Promise<ResumenComercial> {
  return http.get(`${BASE}/ficha/${id}/resumen-comercial`).then((r) => r.data)
}

export function historialComercial(id: number): Promise<HistorialComercialItem[]> {
  return http.get(`${BASE}/ficha/${id}/historial-comercial`).then((r) => r.data)
}

export function notasSeguimiento(id: number): Promise<NotaSeguimiento[]> {
  return http.get(`${BASE}/ficha/${id}/notas-seguimiento`).then((r) => r.data)
}
