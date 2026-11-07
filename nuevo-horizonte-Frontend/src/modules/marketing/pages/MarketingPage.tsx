import { useCallback, useEffect, useState } from 'react'

import { extractErrorMessage } from '@/api/http'
import {
  IconAlertTriangle,
  IconCalendar,
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconPlus,
  IconSearch,
  IconSend,
  IconTrendingUp,
} from '@/components/icons'
import { canCreateModule } from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { formatDate } from '@/utils/format'
import { useToastStore } from '@/store/toastStore'
import MarketingPublicacionDetalleModal from '../components/MarketingPublicacionDetalleModal'
import MarketingPublicacionFormPanel from '../components/MarketingPublicacionFormPanel'
import { kpisMarketing, listarPublicaciones } from '../services/marketingService'
import type { FiltrosMarketing, KpisMarketing, MarketingPublicacion, PaginacionMarketing } from '../types'

const MODULO = 'marketing'
const TAMANOS_PAGINA = [10, 20, 50]

const FILTROS_INICIALES: FiltrosMarketing = {
  q: '',
  estado: '',
}

const CANAL_LABEL: Record<string, string> = {
  TELEGRAM: 'Telegram',
}

const ESTADO_ESTILOS: Record<string, string> = {
  PUBLICADO: 'bg-emerald-100 text-emerald-700',
  ERROR: 'bg-rose-100 text-rose-700',
}

const ESTADO_LABEL: Record<string, string> = {
  PUBLICADO: 'Publicado',
  ERROR: 'Con error',
}

function extracto(texto: string, maximo = 60): string {
  return texto.length > maximo ? `${texto.slice(0, maximo)}…` : texto
}

export default function MarketingPage() {
  const [filtros, setFiltros] = useState<FiltrosMarketing>(FILTROS_INICIALES)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState<PaginacionMarketing<MarketingPublicacion> | null>(null)
  const [kpis, setKpis] = useState<KpisMarketing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const puedeCrear = canCreateModule(MODULO)
  const toast = useToastStore((s) => s.show)

  useEffect(() => {
    setLoading(true)
    Promise.all([listarPublicaciones(filtros, page, size), kpisMarketing()])
      .then(([lista, kpi]) => {
        setData(lista)
        setKpis(kpi)
        setError(null)
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, refreshKey])

  const recargar = useCallback((resetPagina = false) => {
    if (resetPagina) setPage(0)
    setRefreshKey((k) => k + 1)
  }, [])

  function setFiltro<K extends keyof FiltrosMarketing>(campo: K, valor: FiltrosMarketing[K]) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  function aplicar() {
    recargar(true)
  }

  function limpiar() {
    setFiltros(FILTROS_INICIALES)
    recargar(true)
  }

  const hayFiltros = Boolean(filtros.q) || Boolean(filtros.estado)

  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0

  const cards = [
    {
      etiqueta: 'Publicaciones',
      valor: kpis?.total ?? 0,
      color: 'bg-blue-100 text-blue-600',
      Icon: IconTrendingUp,
    },
    {
      etiqueta: 'Publicadas con éxito',
      valor: kpis?.publicadas ?? 0,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
    {
      etiqueta: 'Con error',
      valor: kpis?.conError ?? 0,
      color: 'bg-rose-100 text-rose-600',
      Icon: IconAlertTriangle,
    },
    {
      etiqueta: 'Hoy',
      valor: kpis?.hoy ?? 0,
      color: 'bg-sky-100 text-sky-600',
      Icon: IconCalendar,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Difusión y Marketing</h2>
          <p className="mt-1 text-sm text-gray-500">
            Registra qué material se publicó, en qué canal y cuándo.
          </p>
        </div>
        {puedeCrear && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            <IconPlus />
            Registrar publicación
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.etiqueta} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
              <card.Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-tight text-gray-900">{card.valor}</p>
              <p className="truncate text-[12px] text-gray-500">{card.etiqueta}</p>
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
            placeholder="Buscar historial de publicaciones..."
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
          value={filtros.estado}
          onChange={(e) => {
            setFiltro('estado', e.target.value)
            aplicar()
          }}
        >
          <option value="">Estado</option>
          <option value="PUBLICADO">Publicado</option>
          <option value="ERROR">Con error</option>
        </select>

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      {loading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white shadow-sm" />
          ))}
        </div>
      )}

      {!loading && (data?.content.length ?? 0) === 0 && (
        <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <IconSend className="h-7 w-7" />
          </span>
          <p className="mt-4 text-sm font-semibold text-gray-800">No hay publicaciones para mostrar</p>
          <p className="mt-1 text-[13px] text-gray-500">
            Registra una publicación con imagen y descripción para verla aquí.
          </p>
          {puedeCrear && (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              <IconPlus /> Registrar publicación
            </button>
          )}
        </div>
      )}

      {!loading && (data?.content.length ?? 0) > 0 && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[12px] uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Material</th>
                <th className="px-4 py-3 font-medium">Canal</th>
                <th className="px-4 py-3 font-medium">Fecha de publicación</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.content.map((publicacion) => (
                <tr key={publicacion.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-gray-800">{extracto(publicacion.textoOriginal)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-medium text-sky-700">
                      {CANAL_LABEL[publicacion.canal] ?? publicacion.canal}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(publicacion.fechaPublicacion)}</td>
                  <td className="px-4 py-3 text-gray-500">{publicacion.responsableNombre ?? 'Automático'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        ESTADO_ESTILOS[publicacion.estado] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ESTADO_LABEL[publicacion.estado] ?? publicacion.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDetalleId(publicacion.id)}
                      className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Ver cómo se envió"
                      title="Ver cómo se envió"
                    >
                      <IconEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(data?.totalElements ?? 0) > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <p className="text-[13px] text-gray-500">
            Mostrando {desde}–{hasta} de {data?.totalElements} publicaciones
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

      {formOpen && (
        <MarketingPublicacionFormPanel
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false)
            recargar(true)
            toast('Publicación registrada en el historial', 'success')
          }}
        />
      )}

      {detalleId !== null && (
        <MarketingPublicacionDetalleModal id={detalleId} onClose={() => setDetalleId(null)} />
      )}
    </section>
  )
}
