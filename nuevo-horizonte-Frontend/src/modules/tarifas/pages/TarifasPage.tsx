import { Fragment, useEffect, useState } from 'react'

import type {
  Destino,
  FiltrosTarifas,
  KpisTarifas,
  PaginacionTarifas,
  ProveedorRef,
  Servicio,
  Tarifa,
  TarifaLista,
} from '../types'
import {
  detalleTarifa,
  eliminarTarifa,
  kpisTarifas,
  listarDestinos,
  listarMonedas,
  listarProveedores,
  listarServicios,
  listarTarifas,
  listarTiposTarifa,
} from '../services/tarifaService'
import { extractErrorMessage } from '@/api/http'
import {
  canCreateModule,
  canDeleteModule,
  canUpdateModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { formatDate } from '@/utils/format'
import TarifaFormModal from '../components/TarifaFormModal'
import {
  IconCalendar,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconInfo,
  IconMoney,
  IconPencil,
  IconSearch,
  IconTrash,
} from '@/components/icons'

const MODULO = 'tarifas'

const FILTROS_INICIALES: FiltrosTarifas = {
  q: '',
  proveedorId: '',
  destinoId: '',
  servicioId: '',
  estado: '',
}

const TAMANOS_PAGINA = [5, 10, 25, 50]

const ESTADO_ESTILOS: Record<string, string> = {
  VIGENTE: 'bg-emerald-100 text-emerald-700',
  POR_VENCER: 'bg-amber-100 text-amber-700',
  VENCIDA: 'bg-red-100 text-red-600',
}

const ESTADO_LABEL: Record<string, string> = {
  VIGENTE: 'Vigente',
  POR_VENCER: 'Por vencer',
  VENCIDA: 'Vencida',
}

export default function TarifasPage() {
  const [filtros, setFiltros] = useState<FiltrosTarifas>(FILTROS_INICIALES)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState<PaginacionTarifas<TarifaLista> | null>(null)
  const [kpis, setKpis] = useState<KpisTarifas | null>(null)
  const [proveedores, setProveedores] = useState<ProveedorRef[]>([])
  const [destinos, setDestinos] = useState<Destino[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [tiposTarifa, setTiposTarifa] = useState<string[]>([])
  const [monedas, setMonedas] = useState<string[]>(['PEN', 'USD', 'EUR'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Tarifa | null>(null)
  const [expandidoId, setExpandidoId] = useState<number | null>(null)
  const [detalleExpandido, setDetalleExpandido] = useState<Tarifa | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const puedeCrear = canCreateModule(MODULO)
  const puedeEditar = canUpdateModule(MODULO)
  const puedeEliminar = canDeleteModule(MODULO)

  useEffect(() => {
    listarProveedores().then(setProveedores).catch(() => undefined)
    listarDestinos().then(setDestinos).catch(() => undefined)
    listarServicios().then(setServicios).catch(() => undefined)
    listarTiposTarifa().then(setTiposTarifa).catch(() => undefined)
    listarMonedas().then(setMonedas).catch(() => undefined)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([listarTarifas(filtros, page, size), kpisTarifas()])
      .then(([lista, kpi]) => {
        setData(lista)
        setKpis(kpi)
        setError(null)
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, refreshKey])

  function recargar(resetPagina: boolean) {
    if (resetPagina && page !== 0) setPage(0)
    setRefreshKey((k) => k + 1)
  }

  function setFiltro<K extends keyof FiltrosTarifas>(campo: K, valor: FiltrosTarifas[K]) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  function aplicar() {
    recargar(true)
  }

  function limpiar() {
    setFiltros(FILTROS_INICIALES)
    recargar(true)
  }

  async function toggleExpandir(id: number) {
    if (expandidoId === id) {
      setExpandidoId(null)
      setDetalleExpandido(null)
      return
    }
    setExpandidoId(id)
    try {
      setDetalleExpandido(await detalleTarifa(id))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function abrirEdicion(id: number) {
    try {
      setEditando(await detalleTarifa(id))
      setShowForm(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function eliminar(id: number, etiqueta: string) {
    if (!window.confirm(`¿Eliminar la tarifa de ${etiqueta}?`)) return
    try {
      await eliminarTarifa(id)
      recargar(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const hayFiltros =
    Boolean(filtros.q) ||
    Boolean(filtros.proveedorId) ||
    Boolean(filtros.destinoId) ||
    Boolean(filtros.servicioId) ||
    Boolean(filtros.estado)

  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0

  const cards = [
    {
      etiqueta: 'Tarifas vigentes',
      valor: kpis?.vigentes ?? 0,
      color: 'bg-blue-100 text-blue-600',
      Icon: IconMoney,
    },
    {
      etiqueta: 'Por vencer esta semana',
      valor: kpis?.porVencer ?? 0,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCalendar,
    },
    {
      etiqueta: 'Tarifas vencidas',
      valor: kpis?.vencidas ?? 0,
      color: 'bg-amber-100 text-amber-600',
      Icon: IconMoney,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Gestión de Tarifas</h2>
        <p className="mt-1 text-sm text-gray-500">Controla precios, vigencias y actualizaciones de los proveedores</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.etiqueta} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
              <card.Icon />
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
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar tarifa..."
            className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.q}
            onChange={(e) => setFiltro('q', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') aplicar()
            }}
          />
        </div>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.proveedorId}
          onChange={(e) => {
            setFiltro('proveedorId', e.target.value)
            aplicar()
          }}
        >
          <option value="">Proveedor</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.destinoId}
          onChange={(e) => {
            setFiltro('destinoId', e.target.value)
            aplicar()
          }}
        >
          <option value="">Destino</option>
          {destinos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.servicioId}
          onChange={(e) => {
            setFiltro('servicioId', e.target.value)
            aplicar()
          }}
        >
          <option value="">Servicio</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.estado}
          onChange={(e) => {
            setFiltro('estado', e.target.value)
            aplicar()
          }}
        >
          <option value="">Estado</option>
          <option value="VIGENTE">Vigente</option>
          <option value="POR_VENCER">Por vencer</option>
          <option value="VENCIDA">Vencida</option>
        </select>

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Limpiar Filtros
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {puedeCrear && (
            <button
              type="button"
              onClick={() => {
                setEditando(null)
                setShowForm(true)
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              + Nueva Tarifa
            </button>
          )}
          <button
            type="button"
            disabled
            title="Disponible próximamente"
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-400"
          >
            Importar Excel/CSV
          </button>
        </div>
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="w-8 px-4 py-3" />
                <th className="px-4 py-3 font-semibold">Proveedor</th>
                <th className="px-4 py-3 font-semibold">Servicio</th>
                <th className="px-4 py-3 font-semibold">Destino</th>
                <th className="px-4 py-3 font-semibold">Tarifa</th>
                <th className="px-4 py-3 font-semibold">Vigencias</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Última actualización</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                data?.content.map((t) => (
                  <Fragment key={t.id}>
                    <tr className="border-t border-gray-100 hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleExpandir(t.id)}
                          className={`cursor-pointer text-gray-400 transition-transform hover:text-gray-700 ${
                            expandidoId === t.id ? 'rotate-180' : ''
                          }`}
                          aria-label="Ver historial"
                        >
                          <IconChevronDown />
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{t.proveedor}</td>
                      <td className="px-4 py-3 text-gray-700">{t.servicio}</td>
                      <td className="px-4 py-3 text-gray-700">{t.destino}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {t.moneda} {t.precio.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(t.fechaDesde)} - {formatDate(t.fechaHasta)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ESTADO_ESTILOS[t.estado] ?? 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {ESTADO_LABEL[t.estado] ?? t.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(t.fechaActualizacion)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {puedeEditar && (
                            <button
                              type="button"
                              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              onClick={() => abrirEdicion(t.id)}
                              aria-label="Editar"
                            >
                              <IconPencil />
                            </button>
                          )}
                          {puedeEliminar && (
                            <button
                              type="button"
                              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              onClick={() => eliminar(t.id, `${t.proveedor} - ${t.servicio}`)}
                              aria-label="Eliminar"
                            >
                              <IconTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandidoId === t.id && (
                      <tr className="border-t border-gray-100 bg-gray-50/60">
                        <td colSpan={9} className="px-8 py-4">
                          <p className="mb-3 text-sm font-semibold text-gray-900">Historial de versiones</p>
                          {!detalleExpandido ? (
                            <p className="text-sm text-gray-400">Cargando historial...</p>
                          ) : detalleExpandido.historial.length === 0 ? (
                            <p className="text-sm text-gray-400">Sin cambios de precio registrados todavía</p>
                          ) : (
                            <>
                              <div className="flex flex-col gap-3 text-sm">
                                {detalleExpandido.historial.map((h, i) => (
                                  <div key={i} className="grid grid-cols-2 gap-6">
                                    <div>
                                      <p className="text-xs text-gray-400">
                                        {i === detalleExpandido.historial.length - 1
                                          ? 'Version anterior'
                                          : 'Version previa'}
                                      </p>
                                      <p className="font-medium text-gray-700">
                                        {h.precioAnterior != null
                                          ? `${detalleExpandido.moneda} ${h.precioAnterior.toFixed(2)}`
                                          : 'Primera version'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">Nueva versión</p>
                                      <p className="font-medium text-gray-900">
                                        {detalleExpandido.moneda} {h.precioNuevo.toFixed(2)}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {formatDate(h.fechaCambio)}
                                        {h.usuarioCambio ? ` (Actualizada por ${h.usuarioCambio})` : ''}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-[13px] text-blue-700">
                                <IconInfo /> Esta tarifa fue actualizada recientemente.
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}

              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    Cargando tarifas...
                  </td>
                </tr>
              )}
              {!loading && (data?.content.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    No hay tarifas que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(data?.totalElements ?? 0) > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <p className="text-[13px] text-gray-500">
              Mostrando {desde}–{hasta} de {data?.totalElements} tarifas
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
                  disabled={(data?.number ?? 0) <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="cursor-pointer rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Página anterior"
                >
                  <IconChevronLeft />
                </button>
                <span className="text-[13px] text-gray-600">
                  Página {(data?.number ?? 0) + 1} de {Math.max(data?.totalPages ?? 1, 1)}
                </span>
                <button
                  type="button"
                  disabled={(data?.number ?? 0) + 1 >= (data?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="cursor-pointer rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Página siguiente"
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <TarifaFormModal
          tarifa={editando}
          proveedores={proveedores}
          servicios={servicios}
          destinos={destinos}
          tiposTarifa={tiposTarifa}
          monedas={monedas}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            recargar(true)
          }}
        />
      )}
    </section>
  )
}
