import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import { useAuthStore } from '@/modules/gestion-usuarios-roles-permisos/store/authStore'
import {
  canCreateModule,
  canReadModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import type {
  Alerta,
  PuntoSerie,
  RankingAgencia,
  ResumenEjecutivo,
  TarifasPorProveedor,
} from '@/modules/reportes/types'
import {
  alertas as cargarAlertas,
  rankingAgencias as cargarRanking,
  rendimientoComercial as cargarRendimiento,
  resumenEjecutivo as cargarResumen,
  tarifasPorVencerPorProveedor as cargarTarifas,
} from '@/modules/reportes/services/reportesService'
import {
  NavAgenciasIcon,
  NavCatalogoIcon,
  NavCotizacionesIcon,
  NavPaquetesIcon,
  NavPanelIcon,
  NavProveedoresIcon,
  NavReportesIcon,
  NavTarifasIcon,
  NavUsuariosIcon,
  NavVentasIcon,
} from '@/components/navIcons'
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
} from '@/components/icons'

const ICONOS: Record<string, typeof NavPanelIcon> = {
  catalogo: NavCatalogoIcon,
  proveedores: NavProveedoresIcon,
  tarifas: NavTarifasIcon,
  paquetes: NavPaquetesIcon,
  cotizaciones: NavCotizacionesIcon,
  ventas: NavVentasIcon,
  'gestion-agencias': NavAgenciasIcon,
  reportes: NavReportesIcon,
  'gestion-usuarios-roles-permisos': NavUsuariosIcon,
}

/** Paleta pastel por modulo: icono + fondo suave, igual para la tarjeta y su halo. */
const TONOS: Record<string, { bg: string; fg: string; dot: string }> = {
  catalogo: { bg: 'bg-violet-50', fg: 'text-violet-600', dot: 'bg-violet-400' },
  proveedores: { bg: 'bg-sky-50', fg: 'text-sky-600', dot: 'bg-sky-400' },
  tarifas: { bg: 'bg-amber-50', fg: 'text-amber-600', dot: 'bg-amber-400' },
  paquetes: { bg: 'bg-orange-50', fg: 'text-orange-600', dot: 'bg-orange-400' },
  cotizaciones: { bg: 'bg-emerald-50', fg: 'text-emerald-600', dot: 'bg-emerald-400' },
  ventas: { bg: 'bg-rose-50', fg: 'text-rose-600', dot: 'bg-rose-400' },
  'gestion-agencias': { bg: 'bg-indigo-50', fg: 'text-indigo-600', dot: 'bg-indigo-400' },
  reportes: { bg: 'bg-blue-50', fg: 'text-blue-600', dot: 'bg-blue-400' },
  'gestion-usuarios-roles-permisos': { bg: 'bg-fuchsia-50', fg: 'text-fuchsia-600', dot: 'bg-fuchsia-400' },
}
const TONO_DEFECTO = { bg: 'bg-gray-100', fg: 'text-gray-500', dot: 'bg-gray-400' }

interface Atajo {
  modulo: string
  titulo: string
  detalle: string
  ruta: string
  exigeCrear: boolean
}

const ATAJOS: Atajo[] = [
  { modulo: 'cotizaciones', titulo: 'Nueva cotización', detalle: 'Propuesta para una agencia', ruta: '/cotizaciones', exigeCrear: true },
  { modulo: 'paquetes', titulo: 'Nuevo paquete', detalle: 'Combina tarifas vigentes', ruta: '/paquetes/nuevo', exigeCrear: true },
  { modulo: 'gestion-agencias', titulo: 'Nueva agencia', detalle: 'Registra un cliente B2B', ruta: '/gestion-agencias', exigeCrear: true },
  { modulo: 'tarifas', titulo: 'Nueva tarifa', detalle: 'Precio con vigencia', ruta: '/tarifas', exigeCrear: true },
  { modulo: 'proveedores', titulo: 'Nuevo proveedor', detalle: 'Hotel, transporte u operador', ruta: '/proveedores', exigeCrear: true },
  { modulo: 'catalogo', titulo: 'Ver catálogo', detalle: 'Destinos y servicios', ruta: '/catalogo', exigeCrear: false },
  { modulo: 'ventas', titulo: 'Ver ventas', detalle: 'Ventas confirmadas', ruta: '/ventas', exigeCrear: false },
  { modulo: 'reportes', titulo: 'Ver reportes', detalle: 'KPIs y ranking', ruta: '/reportes', exigeCrear: false },
]

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function iniciales(texto: string): string {
  const partes = texto.trim().split(/\s+/)
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return texto.slice(0, 2).toUpperCase()
}

function formatMoneda(valor: number): string {
  return `S/ ${valor.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`
}

const card = 'rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const nombre = user?.username ?? 'Usuario'
  const roles = user?.roles ?? []
  const rolPrincipal = roles[0]

  const hoy = useMemo(() => new Date(), [])
  const [mes, setMes] = useState({ y: hoy.getFullYear(), m: hoy.getMonth() })

  const celdas = useMemo(() => {
    const primer = (new Date(mes.y, mes.m, 1).getDay() + 6) % 7 // lunes = 0
    const total = new Date(mes.y, mes.m + 1, 0).getDate()
    const previas: (number | null)[] = Array.from({ length: primer }, () => null)
    const dias = Array.from({ length: total }, (_, i) => i + 1)
    return [...previas, ...dias]
  }, [mes])

  const esHoy = (d: number) =>
    d === hoy.getDate() && mes.m === hoy.getMonth() && mes.y === hoy.getFullYear()

  function moverMes(dir: 1 | -1) {
    setMes((p) => {
      const f = new Date(p.y, p.m + dir, 1)
      return { y: f.getFullYear(), m: f.getMonth() }
    })
  }

  const atajos = useMemo(
    () => ATAJOS.filter((a) => (a.exigeCrear ? canCreateModule(a.modulo) : canReadModule(a.modulo))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  )

  const veReportes = canReadModule('reportes')

  const [resumen, setResumen] = useState<ResumenEjecutivo | null>(null)
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [tarifas, setTarifas] = useState<TarifasPorProveedor[]>([])
  const [ranking, setRanking] = useState<RankingAgencia[]>([])
  const [serie, setSerie] = useState<PuntoSerie[]>([])

  useEffect(() => {
    if (!user || !veReportes) return
    Promise.all([cargarResumen(), cargarAlertas(), cargarTarifas(4), cargarRanking(5), cargarRendimiento('7D')])
      .then(([r, a, t, rk, s]) => {
        setResumen(r)
        setAlertas(a)
        setTarifas(t)
        setRanking(rk)
        setSerie(s)
      })
      .catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const pendientes: { icono: 'alerta' | 'vencimiento'; titulo: string; detalle: string; tono: keyof typeof TONOS | 'default' }[] = useMemo(() => {
    const items: typeof pendientes = []
    for (const a of alertas.slice(0, 2)) {
      items.push({
        icono: 'alerta',
        titulo: a.mensaje,
        detalle: a.severidad === 'WARNING' ? 'Requiere atención' : 'Informativo',
        tono: a.severidad === 'WARNING' ? 'tarifas' : 'reportes',
      })
    }
    for (const t of tarifas.slice(0, 4 - items.length)) {
      items.push({
        icono: 'vencimiento',
        titulo: `${t.cantidad} tarifas por vencer`,
        detalle: t.proveedor,
        tono: 'proveedores',
      })
    }
    return items.slice(0, 4)
  }, [alertas, tarifas])

  const destacada = ranking[0]
  const valorMaximo = Math.max(1, ...serie.map((p) => p.valor))
  const totalVentasSerie = serie.reduce((s, p) => s + p.valor, 0)
  const totalAlertas = alertas.reduce((s, a) => s + a.cantidad, 0)
  const totalTarifasPorVencer = tarifas.reduce((s, t) => s + t.cantidad, 0)
  /** Piso visual para dias sin ventas: una barra en 0 no se ve, esto deja un trazo minimo. */
  const serieGrafico = serie.map((p) => ({ ...p, valorVisible: p.valor > 0 ? p.valor : valorMaximo * 0.1 }))

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado */}
      <div>
        <h2 className="text-[23px] font-bold leading-tight tracking-tight text-gray-900">
          Bienvenido, {nombre} <span aria-hidden="true">👋</span>
        </h2>
        <p className="mt-0.5 text-[13px] text-gray-500">
          {hoy.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          {rolPrincipal ? ` · ${rolPrincipal.nombre}` : ''}
        </p>
      </div>

      {/* Fila superior: accesos rapidos compactos a la izquierda, agencia destacada a la derecha */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-gray-900">Accesos rápidos</h3>
          </div>
          {atajos.length === 0 ? (
            <div className={`${card} flex-1`}>
              <p className="py-4 text-center text-[13px] text-gray-500">
                Tienes acceso de solo lectura. Si necesitas crear o editar, solicita el permiso a un administrador.
              </p>
            </div>
          ) : (
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              {atajos.slice(0, 3).map((a) => {
                const Icon = ICONOS[a.modulo] ?? NavPanelIcon
                const tono = TONOS[a.modulo] ?? TONO_DEFECTO
                return (
                  <Link
                    key={a.titulo}
                    to={a.ruta}
                    className={`${card} group flex h-full flex-col items-start justify-center gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,24,40,0.08)]`}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tono.bg} ${tono.fg}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-gray-900">{a.titulo}</p>
                      <p className="truncate text-[11.5px] text-gray-500">{a.detalle}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Agencia destacada, estilo "promo" oscura de la referencia */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#143b72] to-[#0b1f42] p-5 text-white shadow-[0_8px_24px_rgba(20,59,114,0.25)]">
          <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/[0.06]" aria-hidden="true" />
          <span className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/[0.05]" aria-hidden="true" />
          {/* Ilustracion de marca, con un halo claro detras para que resalte sobre el fondo oscuro */}
          <span className="absolute -bottom-12 -right-12 h-60 w-60 rounded-full bg-white/90" aria-hidden="true" />
          <img
            src="/brand/bienvenida-panel.png"
            alt=""
            aria-hidden="true"
            className="absolute -bottom-6 -right-7 h-56 w-56 object-contain drop-shadow-sm"
          />
          <div className="relative max-w-[54%]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              {destacada ? 'Agencia destacada' : 'Tu resumen'}
            </p>
            {destacada ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-[13px] font-bold">
                    {iniciales(destacada.agencia)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold">{destacada.agencia}</p>
                    <p className="text-[12px] text-white/70">
                      Top 1 · {formatMoneda(destacada.monto)}
                    </p>
                  </div>
                </div>
                <Link
                  to="/gestion-agencias"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#143b72] transition-colors hover:bg-white/90"
                >
                  Ver agencias <IconChevronRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-[15px] font-bold leading-snug">
                  {atajos.length > 0 ? atajos[0].titulo : 'Explora tus módulos'}
                </p>
                <p className="mt-1 text-[12px] text-white/70">
                  {atajos.length > 0 ? atajos[0].detalle : 'Revisa qué tienes disponible desde el menú.'}
                </p>
                <Link
                  to={atajos[0]?.ruta ?? '/gestion-usuarios-roles-permisos/perfil'}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#143b72] transition-colors hover:bg-white/90"
                >
                  Empezar <IconChevronRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Cuerpo: actividad + pendientes lado a lado (mismo ancho que accesos rapidos), calendario a la derecha */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
          <section className={card}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className="text-[14px] font-bold text-gray-900">Actividad comercial</h3>
              {resumen?.ventasDeltaPct != null && (
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                    resumen.ventasDeltaPct >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                  }`}
                >
                  {resumen.ventasDeltaPct >= 0 ? '↑' : '↓'} {Math.abs(resumen.ventasDeltaPct).toFixed(0)}% vs. semana anterior
                </span>
              )}
            </div>
            {!veReportes ? (
              <p className="py-10 text-center text-[13px] text-gray-400">
                No tienes permiso para ver reportes comerciales.
              </p>
            ) : serie.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-gray-400">Sin datos en los últimos 7 días.</p>
            ) : (
              <>
                <p className="mt-1 text-[22px] font-bold leading-none text-gray-900">
                  {formatMoneda(totalVentasSerie)}
                  <span className="ml-1.5 text-[12px] font-medium text-gray-400">últimos 7 días</span>
                </p>
                <div className="mt-3 h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serieGrafico} barCategoryGap="32%" margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        dy={6}
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        formatter={(_valor, _nombre, props) => formatMoneda((props.payload as PuntoSerie).valor)}
                        contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 12.5 }}
                        labelStyle={{ fontWeight: 600, color: '#111827' }}
                      />
                      <Bar dataKey="valorVisible" radius={[6, 6, 0, 0]} maxBarSize={28}>
                        {serieGrafico.map((p, i) => (
                          <Cell
                            key={i}
                            fill={p.valor === valorMaximo && p.valor > 0 ? '#143b72' : p.valor > 0 ? '#bfdbfe' : '#e2e8f0'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </section>

          <section className={card}>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-gray-900">Pendientes</h3>
              {veReportes && (
                <Link to="/reportes" className="text-[12.5px] font-semibold text-blue-700 hover:text-blue-800">
                  Ver todo
                </Link>
              )}
            </div>
            {pendientes.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-emerald-700">Todo al día, sin pendientes.</p>
            ) : (
              <ul className="mt-1 divide-y divide-gray-50">
                {pendientes.map((p, i) => {
                  const tono = TONOS[p.tono] ?? TONO_DEFECTO
                  return (
                    <li key={i} className="flex items-center gap-3 py-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tono.bg} ${tono.fg}`}>
                        <IconAlertTriangle className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-gray-800">{p.titulo}</span>
                        <span className="block text-[11.5px] text-gray-400">{p.detalle}</span>
                      </span>
                      <IconChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className={`${card} flex h-full flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => moverMes(-1)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Mes anterior"
              >
                <IconChevronLeft />
              </button>
              <p className="text-[13px] font-bold text-gray-900">
                {MESES[mes.m]}, {mes.y}
              </p>
              <button
                type="button"
                onClick={() => moverMes(1)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Mes siguiente"
              >
                <IconChevronRight />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center">
              {DIAS_SEMANA.map((d, i) => (
                <span key={`${d}-${i}`} className="text-[11px] font-semibold text-gray-300">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid flex-1 grid-cols-7 content-evenly text-center">
              {celdas.map((d, i) =>
                d === null ? (
                  <span key={`v-${i}`} />
                ) : (
                  <span
                    key={d}
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] transition-colors ${
                      esHoy(d)
                        ? 'bg-[#143b72]/10 font-bold text-[#143b72]'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {d}
                  </span>
                ),
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Ranking + alertas: dos tarjetas lado a lado, estilo "cursos/tareas" de la referencia */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <section className={card}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-gray-900">Ranking de agencias</h3>
            {veReportes && (
              <Link to="/reportes" className="text-[12.5px] font-semibold text-blue-700 hover:text-blue-800">
                Ver todo
              </Link>
            )}
          </div>
          {!veReportes ? (
            <p className="py-8 text-center text-[13px] text-gray-400">No tienes permiso para ver reportes comerciales.</p>
          ) : ranking.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-gray-400">Todavía no hay ventas registradas.</p>
          ) : (
            <ul className="mt-1 divide-y divide-gray-50">
              {ranking.slice(0, 5).map((r, i) => (
                <li key={r.agenciaId} className="flex items-center gap-3 py-2.5">
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-[12px] font-bold text-indigo-600">
                    {iniciales(r.agencia)}
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-gray-500 shadow-sm">
                      {i + 1}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/gestion-agencias"
                      className="block truncate text-[13px] font-semibold text-gray-800 hover:text-[#143b72]"
                    >
                      {r.agencia}
                    </Link>
                    <p className="truncate text-[11.5px] text-gray-400">Top {i + 1} en ventas</p>
                  </div>
                  <span className="shrink-0 text-[13px] font-bold text-gray-900">{formatMoneda(r.monto)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-gray-900">Resumen ejecutivo</h3>
            {veReportes && (
              <Link to="/reportes" className="text-[12.5px] font-semibold text-blue-700 hover:text-blue-800">
                Ver todo
              </Link>
            )}
          </div>
          {!veReportes ? (
            <p className="py-8 text-center text-[13px] text-gray-400">No tienes permiso para ver reportes comerciales.</p>
          ) : !resumen ? (
            <p className="py-8 text-center text-[13px] text-gray-400">Cargando indicadores…</p>
          ) : (
            <ul className="mt-1 divide-y divide-gray-50">
              {[
                {
                  key: 'ventas',
                  icono: NavVentasIcon,
                  tono: TONOS.ventas,
                  titulo: 'Ventas del periodo',
                  subtitulo: 'Monto confirmado',
                  valor: formatMoneda(resumen.ventasDelPeriodo),
                  delta: resumen.ventasDeltaPct,
                },
                {
                  key: 'cotizaciones',
                  icono: NavCotizacionesIcon,
                  tono: TONOS.cotizaciones,
                  titulo: 'Cotizaciones cerradas',
                  subtitulo: 'Tasa de cierre',
                  valor: `${resumen.cotizacionesCerradasPct.toFixed(0)}%`,
                  delta: null,
                },
                {
                  key: 'respuesta',
                  icono: NavReportesIcon,
                  tono: TONOS.reportes,
                  titulo: 'Tiempo de respuesta',
                  subtitulo: 'Promedio de atención',
                  valor: resumen.tiempoRespuestaHoras != null ? `${resumen.tiempoRespuestaHoras.toFixed(1)}h` : '—',
                  delta: resumen.tiempoRespuestaDeltaPct,
                },
                {
                  key: 'alertas',
                  icono: IconAlertTriangle,
                  tono: TONOS.tarifas,
                  titulo: 'Alertas activas',
                  subtitulo: 'Requieren atención',
                  valor: String(totalAlertas),
                  delta: null,
                },
                {
                  key: 'tarifas',
                  icono: ICONOS.tarifas ?? NavPanelIcon,
                  tono: TONOS.proveedores,
                  titulo: 'Tarifas por vencer',
                  subtitulo: 'En los próximos días',
                  valor: String(totalTarifasPorVencer),
                  delta: null,
                },
              ].map((fila) => {
                const Icon = fila.icono
                const tono = fila.tono ?? TONO_DEFECTO
                return (
                  <li key={fila.key} className="flex items-center gap-3 py-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tono.bg} ${tono.fg}`}>
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-gray-800">{fila.titulo}</p>
                      <p className="truncate text-[11.5px] text-gray-400">{fila.subtitulo}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[14px] font-bold text-gray-900">{fila.valor}</p>
                      {fila.delta != null && (
                        <p
                          className={`text-[11px] font-semibold ${
                            fila.delta >= 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {fila.delta >= 0 ? '↑' : '↓'} {Math.abs(fila.delta).toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
