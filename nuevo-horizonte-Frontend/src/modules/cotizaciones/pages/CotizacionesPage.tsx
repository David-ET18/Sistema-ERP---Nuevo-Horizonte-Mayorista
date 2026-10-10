import { useEffect, useState } from 'react'

import type {
  Agencia,
  Cotizacion,
  Destino,
  EstadoCotizacion,
  FiltrosCotizaciones,
  KpisCotizaciones,
  PaginacionCotizaciones,
} from '../types'
import {
  cambiarEstadoCotizacion,
  detalleCotizacion,
  kpisCotizaciones,
  listarAgencias,
  listarDestinos,
  listarCotizaciones,
} from '../services/cotizacionService'
import {
  ESTADOS_COTIZACION,
  estadoInfo,
  formatDateDDMMYYYY,
  formatMonto,
} from '../utils'
import { extractErrorMessage } from '@/api/http'
import { useToastStore } from '@/store/toastStore'
import {
  canCreateModule,
  canUpdateModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import EstadoBadge from '../components/EstadoBadge'
import CotizacionFormModal from '../components/CotizacionFormModal'
import CotizacionDetailModal from '../components/CotizacionDetailModal'
import {
  IconCalendar,
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconDots,
  IconEye,
  IconHandshake,
  IconPencil,
  IconPlus,
  IconSearch,
} from '@/components/icons'
import MenuContextual from '@/components/MenuContextual'

const FILTROS_INICIALES: FiltrosCotizaciones = {
  q: '',
  estado: '',
  agenciaId: '',
  destinoId: '',
  desde: '',
  hasta: '',
}

const TAMANOS_PAGINA = [5, 10, 25, 50]

export default function CotizacionesPage() {
  const [filtros, setFiltros] = useState<FiltrosCotizaciones>(FILTROS_INICIALES)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState<PaginacionCotizaciones | null>(null)
  const [kpis, setKpis] = useState<KpisCotizaciones | null>(null)
  const [agencias, setAgencias] = useState<Agencia[]>([])
  const [destinos, setDestinos] = useState<Destino[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Cotizacion | null>(null)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [menuAncla, setMenuAncla] = useState<{ id: number; elemento: HTMLElement } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const puedeCrear = canCreateModule('cotizaciones')
  const puedeEditar = canUpdateModule('cotizaciones')

  const toast = useToastStore((s) => s.show)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [lista, kpi] = await Promise.all([
        listarCotizaciones(filtros, page, size),
        kpisCotizaciones(),
      ])
      setData(lista)
      setKpis(kpi)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listarAgencias()
      .then(setAgencias)
      .catch((err) => setError(extractErrorMessage(err)))
    listarDestinos()
      .then(setDestinos)
      .catch((err) => setError(extractErrorMessage(err)))
    window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, refreshKey])

  function recargar(resetPagina: boolean) {
    if (resetPagina && page !== 0) setPage(0)
    setRefreshKey((k) => k + 1)
  }

  function setFiltro(campo: keyof FiltrosCotizaciones, valor: string) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  function aplicarFiltros() {
    recargar(true)
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES)
    recargar(true)
  }

  function cambiarPagina(nuevaPagina: number) {
    if (data && nuevaPagina >= 0 && nuevaPagina < data.totalPages) {
      setPage(nuevaPagina)
    }
  }

  async function abrirEdicion(id: number) {
    try {
      const detalle = await detalleCotizacion(id)
      setEditando(detalle)
      cerrarMenu()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function cambioRapidoEstado(id: number, estado: EstadoCotizacion) {
    cerrarMenu()
    try {
      await cambiarEstadoCotizacion(id, estado)
      recargar(false)
      toast(`Cotización actualizada a "${estadoInfo(estado).etiqueta}"`, 'success')
    } catch (err) {
      setError(extractErrorMessage(err))
      toast(`No se pudo actualizar el estado: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function refrescarDespuesDeCambio() {
    recargar(false)
  }

  function cerrarMenu() {
    setMenuAncla(null)
  }

  function alternarMenu(id: number, elemento: HTMLElement) {
    setMenuAncla((prev) => (prev?.id === id ? null : { id, elemento }))
  }

  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data
    ? Math.min((data.number + 1) * data.size, data.totalElements)
    : 0

  const cards = [
    {
      etiqueta: 'Pendientes',
      valor: kpis?.pendientes ?? 0,
      colorIcono: 'bg-amber-100 text-amber-600',
      Icon: IconClock,
    },
    {
      etiqueta: 'En negociación',
      valor: kpis?.enNegociacion ?? 0,
      colorIcono: 'bg-blue-100 text-blue-600',
      Icon: IconHandshake,
    },
    {
      etiqueta: 'Cerradas este mes',
      valor: kpis?.cerradasMes ?? 0,
      colorIcono: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Gestión de Cotizaciones</h2>
        <p className="mt-1 text-sm text-gray-500">
          Administra y realiza seguimiento de las cotizaciones enviadas a agencias
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.etiqueta}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.colorIcono}`}
            >
              <card.Icon width={22} height={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.valor}</p>
              <p className="text-[13px] text-gray-500">{card.etiqueta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch width={15} height={15} />
          </span>
          <input
            type="text"
            placeholder="Buscar cotización..."
            className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.q}
            onChange={(e) => setFiltro('q', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') aplicarFiltros()
            }}
          />
        </div>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.estado}
          onChange={(e) => {
            setFiltro('estado', e.target.value)
            aplicarFiltros()
          }}
        >
          <option value="">Estado: todos</option>
          {ESTADOS_COTIZACION.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.agenciaId}
          onChange={(e) => {
            setFiltro('agenciaId', e.target.value)
            aplicarFiltros()
          }}
        >
          <option value="">Agencia: todas</option>
          {agencias.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.destinoId}
          onChange={(e) => {
            setFiltro('destinoId', e.target.value)
            aplicarFiltros()
          }}
        >
          <option value="">Destino: todos</option>
          {destinos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-[13px] text-gray-500">
          <IconCalendar width={14} height={14} />
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.desde}
            onChange={(e) => {
              setFiltro('desde', e.target.value)
              aplicarFiltros()
            }}
          />
          <span>a</span>
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.hasta}
            onChange={(e) => {
              setFiltro('hasta', e.target.value)
              aplicarFiltros()
            }}
          />
        </label>

        {(filtros.q || filtros.estado || filtros.agenciaId || filtros.destinoId || filtros.desde || filtros.hasta) && (
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            onClick={limpiarFiltros}
          >
            Limpiar Filtros
          </button>
        )}

        <div className="ml-auto">
          {puedeCrear && (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              onClick={() => {
                setEditando(null)
                setShowForm(true)
              }}
            >
              <IconPlus width={15} height={15} />
              Nueva cotización
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Agencia</th>
                <th className="px-4 py-3 font-semibold">Destino</th>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 text-right font-semibold">Monto</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                data?.content.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.numero}</td>
                    <td className="px-4 py-3 text-gray-700">{c.agencia}</td>
                    <td className="px-4 py-3 text-gray-700">{c.destino || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{c.producto || '-'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatMonto(c.monto)}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={c.estado} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDateDDMMYYYY(c.fechaCreacion)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          onClick={() => setDetalleId(c.id)}
                          aria-label="Ver detalle"
                        >
                          <IconEye width={16} height={16} />
                        </button>
                        {puedeEditar && (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            onClick={() => abrirEdicion(c.id)}
                            aria-label="Editar"
                          >
                            <IconPencil width={16} height={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          onClick={(e) => alternarMenu(c.id, e.currentTarget)}
                          aria-label="Opciones"
                          aria-haspopup="menu"
                          aria-expanded={menuAncla?.id === c.id}
                        >
                          <IconDots width={16} height={16} />
                        </button>

                        {menuAncla?.id === c.id && (
                          <MenuContextual
                            ancora={menuAncla.elemento}
                            onClose={cerrarMenu}
                          >
                            <button
                              type="button"
                              className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                cerrarMenu()
                                setDetalleId(c.id)
                              }}
                            >
                              <IconEye width={14} height={14} />
                              Ver detalle
                            </button>
                            {puedeEditar && (
                              <button
                                type="button"
                                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => abrirEdicion(c.id)}
                              >
                                <IconPencil width={14} height={14} />
                                Editar
                              </button>
                            )}
                            {puedeEditar && (
                              <>
                                <div className="my-1 border-t border-gray-100" />
                                {ESTADOS_COTIZACION.filter((e) => e.valor !== c.estado).map((e) => (
                                  <button
                                    key={e.valor}
                                    type="button"
                                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => cambioRapidoEstado(c.id, e.valor)}
                                  >
                                    <span className={`h-2 w-2 rounded-full ${e.dot}`} />
                                    Marcar {estadoInfo(e.valor).etiqueta.toLowerCase()}
                                  </button>
                                ))}
                              </>
                            )}
                          </MenuContextual>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    Cargando cotizaciones...
                  </td>
                </tr>
              )}
              {!loading && (data?.content.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    No hay cotizaciones que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(data?.totalElements ?? 0) > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <p className="text-[13px] text-gray-500">
              Mostrando {desde}–{hasta} de {data?.totalElements} cotizaciones
            </p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-[13px] text-gray-500">
                <span>Filas</span>
                <select
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-800 focus:outline-none"
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value))
                    setPage(0)
                  }}
                >
                  {TAMANOS_PAGINA.map((t) => (
                    <option key={t} value={t}>
                      {t} por página
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => cambiarPagina(page - 1)}
                  disabled={page === 0 || loading}
                  aria-label="Página anterior"
                >
                  <IconChevronLeft width={15} height={15} />
                </button>
                <span className="text-[13px] text-gray-600">
                  Página {page + 1} de {data?.totalPages || 0}
                </span>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => cambiarPagina(page + 1)}
                  disabled={!data || page + 1 >= data.totalPages || loading}
                  aria-label="Página siguiente"
                >
                  <IconChevronRight width={15} height={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <CotizacionFormModal
          cotizacion={null}
          onClose={() => setShowForm(false)}
          onSaved={() => recargar(true)}
        />
      )}

      {editando && (
        <CotizacionFormModal
          cotizacion={editando}
          onClose={() => setEditando(null)}
          onSaved={() => recargar(true)}
        />
      )}

      {detalleId !== null && (
        <CotizacionDetailModal
          id={detalleId}
          onClose={() => setDetalleId(null)}
          onEstadoCambiado={refrescarDespuesDeCambio}
          puedeEditar={puedeEditar}
        />
      )}
    </section>
  )
}