import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import type { Agencia, AgenciaLista, FiltrosAgencias, KpisAgencias, PaginacionAgencias } from '../types'
import {
  detalleAgencia,
  eliminarAgencia,
  kpisAgencias,
  listarAgencias,
  listarCategorias,
  logoAgenciaUrl,
} from '../services/agenciaService'
import { extractErrorMessage } from '@/api/http'
import {
  canCreateModule,
  canDeleteModule,
  canUpdateModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { formatDate } from '@/utils/format'
import AgenciaFormModal from '../components/AgenciaFormModal'
import AgenciaDetalleModal from '../components/AgenciaDetalleModal'
import {
  IconBuilding,
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconPencil,
  IconPlus,
  IconSearch,
  IconStar,
  IconTrash,
} from '@/components/icons'

const MODULO = 'gestion-agencias'

const FILTROS_INICIALES: FiltrosAgencias = {
  q: '',
  categoria: '',
  activo: '',
  soloPrioritarias: false,
}

const TAMANOS_PAGINA = [5, 10, 25, 50]

export default function GestionAgenciasPage() {
  const [filtros, setFiltros] = useState<FiltrosAgencias>(FILTROS_INICIALES)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState<PaginacionAgencias<AgenciaLista> | null>(null)
  const [kpis, setKpis] = useState<KpisAgencias | null>(null)
  const [categorias, setCategorias] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Agencia | null>(null)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const puedeCrear = canCreateModule(MODULO)
  const puedeEditar = canUpdateModule(MODULO)
  const puedeEliminar = canDeleteModule(MODULO)

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => undefined)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([listarAgencias(filtros, page, size), kpisAgencias()])
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

  function setFiltro<K extends keyof FiltrosAgencias>(campo: K, valor: FiltrosAgencias[K]) {
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
      setEditando(await detalleAgencia(id))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function eliminar(id: number, razonSocial: string) {
    if (!window.confirm(`¿Eliminar la agencia ${razonSocial}?`)) return
    try {
      await eliminarAgencia(id)
      recargar(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const hayFiltros =
    Boolean(filtros.q) || Boolean(filtros.categoria) || Boolean(filtros.activo) || filtros.soloPrioritarias

  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0

  const cards = [
    {
      etiqueta: 'Total de agencias',
      valor: kpis?.total ?? 0,
      color: 'bg-blue-100 text-blue-600',
      Icon: IconBuilding,
    },
    {
      etiqueta: 'Agencias activas',
      valor: kpis?.activas ?? 0,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
    {
      etiqueta: 'Agencias prioritarias',
      valor: kpis?.prioritarias ?? 0,
      color: 'bg-amber-100 text-amber-600',
      Icon: IconStar,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Agencias</h2>
          <p className="mt-1 text-sm text-gray-500">
            Administra el registro de agencias B2B, su información de contacto y categoría
          </p>
        </div>
        <Link
          to="/gestion-agencias/panel"
          className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Panel comercial 360
        </Link>
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
            placeholder="Buscar por Razón Social o RUC..."
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
          value={filtros.categoria}
          onChange={(e) => {
            setFiltro('categoria', e.target.value)
            aplicar()
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
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
          <option value="">Todos los estados</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer accent-[var(--color-brand)]"
            checked={filtros.soloPrioritarias}
            onChange={(e) => {
              setFiltro('soloPrioritarias', e.target.checked)
              aplicar()
            }}
          />
          Solo prioritarias
        </label>

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
              <IconPlus />
              Nueva agencia
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
                <th className="px-4 py-3 font-semibold">Razón Social</th>
                <th className="px-4 py-3 font-semibold">Nombre Comercial</th>
                <th className="px-4 py-3 font-semibold">RUC</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Contacto</th>
                <th className="px-4 py-3 text-center font-semibold">Prioritaria</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Registrada</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                data?.content.map((a) => {
                  const logo = logoAgenciaUrl(a.logoUrl)
                  return (
                    <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            {logo ? (
                              <img src={logo} alt="" className="h-full w-full object-contain" />
                            ) : (
                              <span className="text-[10px] font-semibold uppercase text-gray-400">
                                {a.razonSocial.slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{a.razonSocial}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{a.nombreComercial || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{a.ruc}</td>
                      <td className="px-4 py-3 text-gray-600">{a.categoria || '-'}</td>
                      <td className="px-4 py-3">
                        {a.contactoNombre ? (
                          <div className="flex flex-col">
                            <span className="text-gray-700">{a.contactoNombre}</span>
                            {a.contactoEmail && (
                              <span className="text-xs text-gray-400">{a.contactoEmail}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {a.esPrioritaria && (
                          <span className="inline-flex text-amber-500">
                            <IconStar width={16} height={16} />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            a.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {a.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(a.fechaCreacion)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            onClick={() => setDetalleId(a.id)}
                            aria-label="Ver detalle"
                          >
                            <IconEye />
                          </button>
                          {puedeEditar && (
                            <button
                              type="button"
                              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              onClick={() => abrirEdicion(a.id)}
                              aria-label="Editar"
                            >
                              <IconPencil />
                            </button>
                          )}
                          {puedeEliminar && (
                            <button
                              type="button"
                              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              onClick={() => eliminar(a.id, a.razonSocial)}
                              aria-label="Eliminar"
                            >
                              <IconTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}

              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    Cargando agencias...
                  </td>
                </tr>
              )}
              {!loading && (data?.content.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    No hay agencias que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(data?.totalElements ?? 0) > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <p className="text-[13px] text-gray-500">
              Mostrando {desde}–{hasta} de {data?.totalElements} agencias
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
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                  aria-label="Página anterior"
                >
                  <IconChevronLeft />
                </button>
                <span className="text-[13px] text-gray-600">
                  Página {page + 1} de {data?.totalPages || 0}
                </span>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data || page + 1 >= data.totalPages || loading}
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
        <AgenciaFormModal
          agencia={null}
          registradasEsteMes={kpis?.registradasEsteMes ?? 0}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            recargar(true)
          }}
        />
      )}

      {editando && (
        <AgenciaFormModal
          agencia={editando}
          registradasEsteMes={kpis?.registradasEsteMes ?? 0}
          onClose={() => setEditando(null)}
          onSaved={() => {
            setEditando(null)
            recargar(true)
          }}
        />
      )}

      {detalleId !== null && (
        <AgenciaDetalleModal
          id={detalleId}
          onClose={() => setDetalleId(null)}
          onEditar={(a) => {
            setDetalleId(null)
            setEditando(a)
          }}
          puedeEditar={puedeEditar}
        />
      )}
    </section>
  )
}
