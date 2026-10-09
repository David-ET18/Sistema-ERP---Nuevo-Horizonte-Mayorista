import { http } from '@/api/http'
import type { Alerta, PeriodoRendimiento, PuntoSerie, RankingAgencia, ResumenEjecutivo, TarifasPorProveedor } from '../types'

const BASE = '/reportes'

export function resumenEjecutivo(): Promise<ResumenEjecutivo> {
  return http.get(`${BASE}/resumen-ejecutivo`).then((r) => r.data)
}

export function rendimientoComercial(periodo: PeriodoRendimiento): Promise<PuntoSerie[]> {
  return http.get(`${BASE}/rendimiento-comercial`, { params: { periodo } }).then((r) => r.data)
}

export function rankingAgencias(limite = 5): Promise<RankingAgencia[]> {
  return http.get(`${BASE}/ranking-agencias`, { params: { limite } }).then((r) => r.data)
}

export function tarifasPorVencerPorProveedor(limite = 5): Promise<TarifasPorProveedor[]> {
  return http.get(`${BASE}/tarifas-por-vencer-proveedor`, { params: { limite } }).then((r) => r.data)
}

export function alertas(): Promise<Alerta[]> {
  return http.get(`${BASE}/alertas`).then((r) => r.data)
}
