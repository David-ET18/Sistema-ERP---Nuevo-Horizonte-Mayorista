import { useEffect, useState } from 'react'

import type {
  Destino,
  FiltrosProveedores,
  KpisProveedores,
  PaginacionProveedores,
  Proveedor,
  ProveedorLista,
} from '../types'
import {
  activarProveedor,
  detalleProveedor,
  eliminarProveedor,
  kpisProveedores,
  listarCondicionesComerciales,
  listarDestinos,
  listarProveedores,
  listarTiposServicio,
} from '../services/proveedorService'
import { extractErrorMessage } from '@/api/http'
import {
  canCreateModule,
  canDeleteModule,
  canUpdateModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { formatDate } from '@/utils/format'
import ProveedorFormModal from '../components/ProveedorFormModal'
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconCheckCircle,
  IconPencil,
  IconPower,
  IconSearch,
  IconUsers,
} from '@/components/icons'

const MODULO = 'proveedores'

/** Por defecto solo se listan los proveedores activos; los desactivados quedan en una lista aparte (filtro "Inactivo"). */
const FILTROS_INICIALES: FiltrosProveedores = {
  q: '',
  tipoProveedor: '',
  activo: 'true',
  destinoId: '',
}

const TAMANOS_PAGINA = [5, 10, 25, 50]

export default function ProveedoresPage() {
  const [filtros, setFiltros] = useState<FiltrosProveedores>(FILTROS_INICIALES)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState<PaginacionProveedores<ProveedorLista> | null>(null)
  const [kpis, setKpis] = useState<KpisProveedores | null>(null)
  const [tiposServicio, setTiposServicio] = useState<string[]>([])
  const [condicionesComerciales, setCondicionesComerciales] = useState<string[]>([])
  const [destinos, setDestinos] = useState<Destino[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Proveedor | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const puedeCrear = canCreateModule(MODULO)
  const puedeEditar = canUpdateModule(MODULO)
  const puedeEliminar = canDeleteModule(MODULO)

  useEffect(() => {
    listarTiposServicio().then(setTiposServicio).catch(() => undefined)
    listarCondicionesComerciales().then(setCondicionesComerciales).catch(() => undefined)
    listarDestinos().then(setDestinos).catch(() => undefined)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([listarProveedores(filtros, page, size), kpisProveedores()])
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

  function setFiltro<K extends keyof FiltrosProveedores>(campo: K, valor: FiltrosProveedores[K]) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  function aplicar() {
    recargar(true)
  }

  function limpiar() {
    setFiltros(FILTROS_INICIALES)
    recargar(true)
  }

  async function abrirEdicion(id: number) {
    try {
      setEditando(await detalleProveedor(id))
      setShowForm(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function eliminar(id: number, razonSocial: string) {
    if (!window.confirm(`¿Desactivar el proveedor ${razonSocial}? Sus tarifas e historial no se eliminan.`)) return
    try {
      await eliminarProveedor(id)
      recargar(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function reactivar(id: number) {
    try {
      await activarProveedor(id)
      recargar(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const hayFiltros =
    Boolean(filtros.q) ||
    Boolean(filtros.tipoProveedor) ||
    filtros.activo !== FILTROS_INICIALES.activo ||
    Boolean(filtros.destinoId)

  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0

  const cards = [
    {
      etiqueta: 'Proveedores activos',
      valor: kpis?.activos ?? 0,
      color: 'bg-blue-100 text-blue-600',
      Icon: IconUsers,
    },
    {
      etiqueta: 'Nuevos este mes',
      valor: kpis?.nuevosEsteMes ?? 0,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
    {
      etiqueta: 'Sin tarifas cargadas',
      valor: kpis?.sinTarifas ?? 0,
      color: 'bg-amber-100 text-amber-600',
      Icon: IconAlertTriangle,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Gestión de Proveedores</h2>
        <p className="mt-1 text-sm text-gray-500">Administra los operadores y proveedores turísticos</p>
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
            placeholder="Buscar proveedor..."
            className="w-72 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.q}
            onChange={(e) => setFiltro('q', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') aplicar()
            }}
          />
        </div>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.tipoProveedor}
          onChange={(e) => {
            setFiltro('tipoProveedor', e.target.value)
            aplicar()
          }}
        >
          <option value="">Tipo de servicio</option>
          {tiposServicio.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.activo}
          onChange={(e) => {
            setFiltro('activo', e.target.value)
            aplicar()
          }}
        >
          <option value="true">Activos</option>
          <option value="false">Desactivados</option>
          <option value="">Todos</option>
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

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Limpiar Filtros
          </button>
        )}

        <div className="ml-auto">
          {puedeCrear && (
            <button
              type="button"
              onClick={() => {
                setEditando(null)
                setShowForm(true)
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Nuevo Proveedor
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
                <th className="px-4 py-3 font-semibold">Proveedor</th>
                <th className="px-4 py-3 font-semibold">Tipo de servicio</th>
                <th className="px-4 py-3 font-semibold">Contacto</th>
                <th className="px-4 py-3 font-semibold">Condiciones Comerciales</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Última actualización</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                data?.content.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {p.nombreComercial || p.razonSocial}
                        </span>
                        <span className="text-xs text-gray-400">RUC {p.ruc}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.tipoProveedor || '-'}</td>
                    <td className="px-4 py-3">
                      {p.contactoNombre ? (
                        <div className="flex flex-col">
                          <span className="text-gray-700">{p.contactoNombre}</span>
                          {p.contactoTelefono && (
                            <span className="text-xs text-gray-400">{p.contactoTelefono}</span>
                          )}
                          {p.contactoEmail && (
                            <span className="text-xs text-gray-400">{p.contactoEmail}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.condicionesComerciales || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(p.fechaActualizacion)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {puedeEditar && (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            onClick={() => abrirEdicion(p.id)}
                            aria-label="Editar"
                          >
                            <IconPencil />
                          </button>
                        )}
                        {puedeEliminar && (p.activo ? (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() => eliminar(p.id, p.razonSocial)}
                            aria-label={`Desactivar ${p.razonSocial}`}
                            title="Desactivar"
                          >
                            <IconPower />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                            onClick={() => reactivar(p.id)}
                            aria-label={`Reactivar ${p.razonSocial}`}
                            title="Reactivar"
                          >
                            <IconCheckCircle />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}

              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    Cargando proveedores...
                  </td>
                </tr>
              )}
              {!loading && (data?.content.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    No hay proveedores que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(data?.totalElements ?? 0) > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <p className="text-[13px] text-gray-500">
              Mostrando {desde}–{hasta} de {data?.totalElements} proveedores
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
        <ProveedorFormModal
          proveedor={editando}
          tiposServicio={tiposServicio}
          condicionesComerciales={condicionesComerciales}
          destinos={destinos}
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
