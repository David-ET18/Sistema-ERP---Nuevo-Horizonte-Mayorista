import { useEffect, useState } from 'react'

import type { Alerta, PeriodoRendimiento, PuntoSerie, RankingAgencia, ResumenEjecutivo, TarifasPorProveedor } from '../types'
import {
  alertas as cargarAlertas,
  rankingAgencias as cargarRanking,
  rendimientoComercial as cargarRendimiento,
  resumenEjecutivo as cargarResumen,
  tarifasPorVencerPorProveedor as cargarTarifasPorVencer,
} from '../services/reportesService'
import { extractErrorMessage } from '@/api/http'
import { IconAlertTriangle, IconInfo, IconTrendingUp } from '@/components/icons'

const TABS: { label: string; valor: PeriodoRendimiento }[] = [
  { label: '7 días', valor: '7D' },
  { label: '30 días', valor: '30D' },
  { label: 'Mes', valor: 'MES' },
  { label: 'Año', valor: 'ANIO' },
]

export default function ReportesPage() {
  const [resumen, setResumen] = useState<ResumenEjecutivo | null>(null)
  const [periodo, setPeriodo] = useState<PeriodoRendimiento>('MES')
  const [serie, setSerie] = useState<PuntoSerie[]>([])
  const [ranking, setRanking] = useState<RankingAgencia[]>([])
  const [tarifasPorVencer, setTarifasPorVencer] = useState<TarifasPorProveedor[]>([])
  const [alertasList, setAlertasList] = useState<Alerta[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([cargarResumen(), cargarRanking(5), cargarTarifasPorVencer(4), cargarAlertas()])
      .then(([r, rk, tv, al]) => {
        setResumen(r)
        setRanking(rk)
        setTarifasPorVencer(tv)
        setAlertasList(al)
        setError(null)
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    cargarRendimiento(periodo)
      .then(setSerie)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [periodo])

  function formatMoneda(valor: number) {
    return `S/ ${valor.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`
  }

  function formatDelta(valor: number | null, invertido = false) {
    if (valor == null) return null
    const positivo = invertido ? valor < 0 : valor > 0
    const signo = valor > 0 ? '+' : ''
    return (
      <span className={`text-[12px] font-medium ${positivo ? 'text-emerald-600' : 'text-red-500'}`}>
        {valor < 0 ? '↓' : '↑'} {signo}
        {Math.abs(valor).toFixed(0)}% <span className="font-normal text-gray-400">mes anterior</span>
      </span>
    )
  }

  const maxRanking = Math.max(...ranking.map((r) => r.monto), 1)
  const maxTarifas = Math.max(...tarifasPorVencer.map((t) => t.cantidad), 1)
  const maxSerie = Math.max(...serie.map((p) => p.valor), 1)

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Resumen Ejecutivo</h2>
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-400">Cargando indicadores...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
              <div>
                <p className="text-[13px] text-gray-500">Cotizaciones cerradas</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {resumen?.cotizacionesCerradasPct.toFixed(0)}%
                </p>
              </div>
              <Donut porcentaje={resumen?.cotizacionesCerradasPct ?? 0} />
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-[13px] text-gray-500">Tiempo promedio de respuesta</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {resumen?.tiempoRespuestaHoras != null ? `${resumen.tiempoRespuestaHoras.toFixed(1)} horas` : '-'}
              </p>
              <div className="mt-1">{formatDelta(resumen?.tiempoRespuestaDeltaPct ?? null, true)}</div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
              <div>
                <p className="text-[13px] text-gray-500">Ventas del período</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatMoneda(resumen?.ventasDelPeriodo ?? 0)}</p>
                <div className="mt-1">{formatDelta(resumen?.ventasDeltaPct ?? null)}</div>
              </div>
              <span className="text-emerald-500">
                <IconTrendingUp />
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Rendimiento comercial</h3>
              <div className="flex rounded-lg bg-gray-100 p-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.valor}
                    type="button"
                    onClick={() => setPeriodo(tab.valor)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      periodo === tab.valor ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <LineChart puntos={serie} max={maxSerie} formatValor={formatMoneda} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-gray-900">Ranking de agencias por volumen</h3>
              <div className="flex flex-col gap-3">
                {ranking.length === 0 && <p className="text-sm text-gray-400">Sin ventas registradas todavía</p>}
                {ranking.map((r) => (
                  <div key={r.agenciaId} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 truncate text-[13px] text-gray-700">{r.agencia}</span>
                    <div className="h-3 flex-1 rounded-full bg-gray-100">
                      <div
                        className="h-3 rounded-full bg-brand"
                        style={{ width: `${(r.monto / maxRanking) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right text-[13px] text-gray-600">
                      {formatMoneda(r.monto)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-gray-900">Tarifas próximas a vencer por proveedor</h3>
              {tarifasPorVencer.length === 0 ? (
                <p className="text-sm text-gray-400">Sin tarifas por vencer esta semana</p>
              ) : (
                <div className="flex h-36 items-end justify-between gap-3">
                  {tarifasPorVencer.map((t) => (
                    <div key={t.proveedorId} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full max-w-10 rounded-t bg-brand"
                        style={{ height: `${(t.cantidad / maxTarifas) * 100}%`, minHeight: '4px' }}
                      />
                      <span className="text-center text-[11px] text-gray-500">{t.proveedor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-gray-900">Alertas</h3>
              <div className="flex flex-col gap-2">
                {alertasList.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5 text-[13px] text-gray-700"
                  >
                    <span className={a.severidad === 'WARNING' ? 'text-amber-500' : 'text-blue-500'}>
                      {a.severidad === 'WARNING' ? <IconAlertTriangle /> : <IconInfo />}
                    </span>
                    <span>
                      <span className="font-semibold text-gray-900">{a.cantidad}</span> {a.mensaje}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

function Donut({ porcentaje }: { porcentaje: number }) {
  const radio = 32
  const circunferencia = 2 * Math.PI * radio
  const relleno = (porcentaje / 100) * circunferencia
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0 -rotate-90">
      <circle cx="40" cy="40" r={radio} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle
        cx="40"
        cy="40"
        r={radio}
        fill="none"
        stroke="var(--color-brand, #1d4ed8)"
        strokeWidth="10"
        strokeDasharray={`${relleno} ${circunferencia - relleno}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

function LineChart({
  puntos,
  max,
  formatValor,
}: {
  puntos: PuntoSerie[]
  max: number
  formatValor: (v: number) => string
}) {
  if (puntos.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">Sin datos en este periodo</p>
  }

  const ancho = 1000
  const alto = 240
  const paso = puntos.length > 1 ? ancho / (puntos.length - 1) : 0
  const puntosSvg = puntos.map((p, i) => {
    const x = puntos.length > 1 ? i * paso : ancho / 2
    const y = alto - (p.valor / max) * (alto - 20) - 10
    return `${x},${y}`
  })

  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="h-56 w-full" preserveAspectRatio="none">
        <polyline
          points={puntosSvg.join(' ')}
          fill="none"
          stroke="var(--color-brand, #1d4ed8)"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between text-[11px] text-gray-400">
        {puntos.map((p, i) => (
          <span key={i} title={formatValor(p.valor)}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}
