import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

const COLOR_BRAND = '#1d4ed8'
const COLOR_FONDO_DONUT = '#e5e7eb'

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

  function formatMoneda2(valor: number) {
    return `S/ ${(valor / 1000).toFixed(0)}K`
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

  const datosDonut = [
    { name: 'Cerradas', value: resumen?.cotizacionesCerradasPct ?? 0 },
    { name: 'Resto', value: 100 - (resumen?.cotizacionesCerradasPct ?? 0) },
  ]

  const rankingInvertido = [...ranking].reverse()

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
              <div className="h-20 w-20 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosDonut}
                      dataKey="value"
                      innerRadius={28}
                      outerRadius={38}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      <Cell fill={COLOR_BRAND} />
                      <Cell fill={COLOR_FONDO_DONUT} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
            {serie.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-400">Sin datos en este periodo</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={serie} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      tickFormatter={formatMoneda2}
                      width={56}
                    />
                    <Tooltip formatter={(valor) => formatMoneda(Number(valor))} labelClassName="text-gray-700" />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke={COLOR_BRAND}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: COLOR_BRAND }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-base font-semibold text-gray-900">Ranking de agencias por volumen</h3>
              {ranking.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">Sin ventas registradas todavía</p>
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rankingInvertido}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="agencia"
                        axisLine={false}
                        tickLine={false}
                        width={90}
                        tick={{ fontSize: 12, fill: '#374151' }}
                      />
                      <Tooltip formatter={(valor) => formatMoneda(Number(valor))} />
                      <Bar dataKey="monto" fill={COLOR_BRAND} radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-base font-semibold text-gray-900">Tarifas próximas a vencer por proveedor</h3>
              {tarifasPorVencer.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">Sin tarifas por vencer esta semana</p>
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tarifasPorVencer} margin={{ top: 10, right: 0, left: -16, bottom: 0 }}>
                      <XAxis
                        dataKey="proveedor"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        interval={0}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="cantidad" fill={COLOR_BRAND} radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
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
