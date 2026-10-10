import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Destino, FiltrosPaquetes, KpisPaquetes, PaginacionPaquetes, PaqueteLista } from '../types'
import {
  eliminarPaquete,
  kpisPaquetes,
  listarCategorias,
  listarDestinos,
  listarPaquetes,
} from '../services/paqueteService'
import { extractErrorMessage } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToastStore } from '@/store/toastStore'
import {
  canCreateModule,
  canDeleteModule,
  canUpdateModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { formatDate } from '@/utils/format'
import PaqueteDetalleModal from '../components/PaqueteDetalleModal'
import {
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconEye,
  IconPencil,
  IconSearch,
  IconStar,
  IconTrash,
} from '@/components/icons'

const MODULO = 'paquetes'

const FILTROS_INICIALES: FiltrosPaquetes = {
  q: '',
  categoria: '',
  estado: '',
  destacado: false,
  destinoId: '',
}

const TAMANOS_PAGINA = [5, 10, 25, 50]

const ESTADO_ESTILOS: Record<string, string> = {
  ACTIVO: 'bg-emerald-100 text-emerald-700',
  BORRADOR: 'bg-amber-100 text-amber-700',
  INACTIVO: 'bg-gray-100 text-gray-500',
}

const ESTADO_LABEL: Record<string, string> = {
  ACTIVO: 'Publicado',
  BORRADOR: 'Borrador',
  INACTIVO: 'Inactivo',
}

export default function PaquetesPage() {
  const navigate = useNavigate()
  const [filtros, setFiltros] = useState<FiltrosPaquetes>(FILTROS_INICIALES)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState<PaginacionPaquetes<PaqueteLista> | null>(null)
  const [kpis, setKpis] = useState<KpisPaquetes | null>(null)
  const [categorias, setCategorias] = useState<string[]>([])
  const [destinos, setDestinos] = useState<Destino[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aEliminar, setAEliminar] = useState<PaqueteLista | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const puedeCrear = canCreateModule(MODULO)
  const puedeEditar = canUpdateModule(MODULO)
  const puedeEliminar = canDeleteModule(MODULO)

  const toast = useToastStore((s) => s.show)

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => undefined)
    listarDestinos().then(setDestinos).catch(() => undefined)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([listarPaquetes(filtros, page, size), kpisPaquetes()])
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

  function setFiltro<K extends keyof FiltrosPaquetes>(campo: K, valor: FiltrosPaquetes[K]) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  function aplicar() {
    recargar(true)
  }

  function limpiar() {
    setFiltros(FILTROS_INICIALES)
    recargar(true)
  }

  async function eliminar(id: number) {
    try {
      await eliminarPaquete(id)
      recargar(true)
      toast(aEliminar ? `Paquete "${aEliminar.nombre}" eliminado` : 'Paquete eliminado correctamente', 'success')
    } catch (err) {
      setError(extractErrorMessage(err))
      toast(`No se pudo eliminar el paquete: ${extractErrorMessage(err)}`, 'error')
    }
  }

  const hayFiltros =
    Boolean(filtros.q) ||
    Boolean(filtros.categoria) ||
    Boolean(filtros.estado) ||
    filtros.destacado ||
    Boolean(filtros.destinoId)

  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0

  const cards = [
    {
      etiqueta: 'Paquetes publicados',
      valor: kpis?.publicados ?? 0,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
    {
      etiqueta: 'En borrador',
      valor: kpis?.borradores ?? 0,
      color: 'bg-amber-100 text-amber-600',
      Icon: IconClock,
    },
    {
      etiqueta: 'Destacados',
      valor: kpis?.destacados ?? 0,
      color: 'bg-blue-100 text-blue-600',
      Icon: IconStar,
    },
  ]

  function formatPrecio(moneda: string, precio: number | null) {
    if (precio == null) return '-'
    return `${moneda} ${precio.toFixed(2)}`
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Armado de Paquetes Turísticos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Composición de paquetes combinando tarifas de distintos proveedores
        </p>
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
            placeholder="Buscar paquete..."
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
          <option value="">Categoría</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
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
          <option value="ACTIVO">Publicado</option>
          <option value="BORRADOR">Borrador</option>
          <option value="INACTIVO">Inactivo</option>
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

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer accent-[var(--color-brand)]"
            checked={filtros.destacado}
            onChange={(e) => {
              setFiltro('destacado', e.target.checked)
              aplicar()
            }}
          />
          Solo destacados
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
              onClick={() => navigate('/paquetes/nuevo')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Nuevo Producto
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
                <th className="px-4 py-3 font-semibold">Paquete</th>
                <th className="px-4 py-3 font-semibold">Destino</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Duración</th>
                <th className="px-4 py-3 font-semibold">Precio desde</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Actualizado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                data?.content.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.destacado && (
                          <span className="inline-flex text-amber-500">
                            <IconStar width={14} height={14} />
                          </span>
                        )}
                        <span className="font-medium text-gray-900">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.destino || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.categoria || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.duracionTexto || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{formatPrecio(p.moneda, p.precioDesde)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          ESTADO_ESTILOS[p.estado] ?? 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {ESTADO_LABEL[p.estado] ?? p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(p.fechaActualizacion)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          onClick={() => setDetalleId(p.id)}
                          aria-label={`Ver ${p.nombre}`}
                          title="Ver"
                        >
                          <IconEye />
                        </button>
                        {puedeEditar && (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            onClick={() => navigate(`/paquetes/${p.id}/editar`)}
                            aria-label="Editar"
                          >
                            <IconPencil />
                          </button>
                        )}
                        {puedeEliminar && (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setAEliminar(p)}
                            aria-label="Eliminar"
                          >
                            <IconTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    Cargando paquetes...
                  </td>
                </tr>
              )}
              {!loading && (data?.content.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    No hay paquetes que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(data?.totalElements ?? 0) > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <p className="text-[13px] text-gray-500">
              Mostrando {desde}–{hasta} de {data?.totalElements} paquetes
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

      {detalleId !== null && (
        <PaqueteDetalleModal id={detalleId} onClose={() => setDetalleId(null)} />
      )}

      <ConfirmDialog
        open={aEliminar !== null}
        tono="danger"
        title="Eliminar paquete"
        description={
          aEliminar
            ? `¿Eliminar el paquete "${aEliminar.nombre}"? Si ya tiene ventas registradas, en vez de borrarlo se marcará como inactivo.`
            : ''
        }
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (aEliminar) await eliminar(aEliminar.id)
          setAEliminar(null)
        }}
        onCancel={() => setAEliminar(null)}
      />
    </section>
  )
}
