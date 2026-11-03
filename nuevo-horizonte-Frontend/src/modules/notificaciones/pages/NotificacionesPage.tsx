import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactElement, SVGProps } from 'react'

import type {
  FiltrosNotificaciones,
  KpisNotificaciones,
  Notificacion,
  PaginacionNotificaciones,
} from '../types'
import {
  eliminarNotificacion,
  eliminarNotificacionesLeidas,
  kpisNotificaciones,
  listarNotificacionesPaginadas,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../services/notificacionService'
import { extractErrorMessage } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog'
import { formatDate } from '@/utils/format'
import { useNotificacionesStore } from '@/store/notificacionesStore'
import { useToastStore } from '@/store/toastStore'
import {
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconInfo,
  IconMail,
  IconPencil,
  IconSearch,
  IconStar,
  IconTrash,
  IconUsers,
} from '@/components/icons'

const FILTROS_INICIALES: FiltrosNotificaciones = { q: '', leida: '', tipo: '' }
const TAMANOS_PAGINA = [10, 20, 50]
const TIPOS = [
  { valor: 'PROMOCION', etiqueta: 'Promociones' },
  { valor: 'ROL_PERMISOS', etiqueta: 'Cambios de permisos' },
  { valor: 'ROL_ASIGNADO', etiqueta: 'Roles asignados' },
  { valor: 'ROL_QUITADO', etiqueta: 'Roles retirados' },
  { valor: 'SISTEMA', etiqueta: 'Sistema' },
]

type IconoTipo = (props: SVGProps<SVGSVGElement>) => ReactElement

function estiloTipo(tipo: string): { bg: string; text: string; Icon: IconoTipo; etiqueta: string } {
  switch (tipo) {
    case 'PROMOCION':
      return { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', Icon: IconStar, etiqueta: 'Promoción' }
    case 'ROL_PERMISOS':
      return { bg: 'bg-amber-100', text: 'text-amber-700', Icon: IconPencil, etiqueta: 'Permisos' }
    case 'ROL_ASIGNADO':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', Icon: IconUsers, etiqueta: 'Rol asignado' }
    case 'ROL_QUITADO':
      return { bg: 'bg-red-100', text: 'text-red-700', Icon: IconTrash, etiqueta: 'Rol retirado' }
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-700', Icon: IconInfo, etiqueta: 'Sistema' }
  }
}

export default function NotificacionesPage() {
  const [filtros, setFiltros] = useState<FiltrosNotificaciones>(FILTROS_INICIALES)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState<PaginacionNotificaciones<Notificacion> | null>(null)
  const [kpis, setKpis] = useState<KpisNotificaciones | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [confirmarLimpiar, setConfirmarLimpiar] = useState(false)
  const [aEliminar, setAEliminar] = useState<Notificacion | null>(null)

  const refrescarContador = useNotificacionesStore((s) => s.refrescar)
  const toast = useToastStore((s) => s.show)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    Promise.all([listarNotificacionesPaginadas(filtros, page, size), kpisNotificaciones()])
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
    void refrescarContador()
  }, [refrescarContador])

  function aplicar() {
    recargar(true)
  }

  function limpiar() {
    setFiltros(FILTROS_INICIALES)
    recargar(true)
  }

  async function marcarLeida(notificacion: Notificacion) {
    if (notificacion.leida) return
    try {
      await marcarNotificacionLeida(notificacion.id)
      recargar(false)
    } catch (err) {
      toast(`No se pudo marcar la notificación: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function marcarTodas() {
    if (!kpis?.noLeidas) return
    try {
      const actualizadas = await marcarTodasNotificacionesLeidas()
      recargar(false)
      toast(
        actualizadas > 0
          ? `Se marcaron ${actualizadas} notificaciones como leídas`
          : 'No había notificaciones pendientes',
        'success',
      )
    } catch (err) {
      toast(`No se pudieron marcar las notificaciones: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function abrir(notificacion: Notificacion) {
    if (!notificacion.leida) {
      try {
        await marcarNotificacionLeida(notificacion.id)
        recargar(false)
      } catch (err) {
        toast(`No se pudo abrir la notificación: ${extractErrorMessage(err)}`, 'error')
        return
      }
    }
    if (notificacion.enlace) navigate(notificacion.enlace)
  }

  async function eliminar(notificacion: Notificacion) {
    try {
      await eliminarNotificacion(notificacion.id)
      recargar(false)
      toast('Notificación eliminada', 'success')
    } catch (err) {
      toast(`No se pudo eliminar la notificación: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function limpiarLeidas() {
    try {
      const eliminadas = await eliminarNotificacionesLeidas()
      recargar(true)
      toast(
        eliminadas > 0
          ? `Se eliminaron ${eliminadas} notificaciones leídas`
          : 'No había notificaciones leídas para eliminar',
        'success',
      )
    } catch (err) {
      toast(`No se pudieron eliminar las notificaciones: ${extractErrorMessage(err)}`, 'error')
    } finally {
      setConfirmarLimpiar(false)
    }
  }

  const hayFiltros = Boolean(filtros.q) || Boolean(filtros.leida) || Boolean(filtros.tipo)
  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0

  const cards = [
    {
      etiqueta: 'Total',
      valor: kpis?.total ?? 0,
      color: 'bg-blue-100 text-blue-600',
      Icon: IconMail,
    },
    {
      etiqueta: 'No leídas',
      valor: kpis?.noLeidas ?? 0,
      color: 'bg-rose-100 text-rose-600',
      Icon: IconInfo,
    },
    {
      etiqueta: 'Leídas',
      valor: kpis?.leidas ?? 0,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
    {
      etiqueta: 'De promociones',
      valor: kpis?.promociones ?? 0,
      color: 'bg-fuchsia-100 text-fuchsia-600',
      Icon: IconStar,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
          <p className="mt-1 text-sm text-gray-500">
            Historial completo de promociones y cambios en tus roles y permisos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void marcarTodas()}
            disabled={!kpis?.noLeidas}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconCheckCircle className="h-4 w-4" />
            Marcar todas como leídas
          </button>
          <button
            type="button"
            onClick={() => setConfirmarLimpiar(true)}
            disabled={!kpis?.leidas}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconTrash className="h-4 w-4" />
            Eliminar leídas
          </button>
        </div>
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
            placeholder="Buscar en título o mensaje..."
            className="w-72 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.q}
            onChange={(e) => setFiltros((prev) => ({ ...prev, q: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') aplicar()
            }}
          />
        </div>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.leida}
          onChange={(e) => {
            setFiltros((prev) => ({ ...prev, leida: e.target.value }))
            aplicar()
          }}
        >
          <option value="">Todas</option>
          <option value="false">No leídas</option>
          <option value="true">Leídas</option>
        </select>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.tipo}
          onChange={(e) => {
            setFiltros((prev) => ({ ...prev, tipo: e.target.value }))
            aplicar()
          }}
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white shadow-sm" />
          ))}
        </div>
      )}

      {!loading && (data?.content.length ?? 0) === 0 && (
        <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <IconMail className="h-7 w-7" />
          </span>
          <p className="mt-4 text-sm font-semibold text-gray-800">No hay notificaciones para mostrar</p>
          <p className="mt-1 text-[13px] text-gray-500">
            Aquí llegarán las promociones publicadas y los cambios de permisos de tu cuenta.
          </p>
        </div>
      )}

      {!loading && (data?.content.length ?? 0) > 0 && (
        <ul className="flex flex-col gap-2">
          {data?.content.map((n) => {
            const { bg, text, Icon, etiqueta } = estiloTipo(n.tipo)
            return (
              <li
                key={n.id}
                className={`flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 transition-shadow hover:shadow-md ${
                  n.leida ? 'ring-gray-100' : 'ring-brand/20'
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${text}`}>
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`truncate text-sm ${n.leida ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>
                      {n.titulo}
                    </p>
                    {!n.leida && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                      {etiqueta}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-gray-600">{n.mensaje}</p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {formatDate(n.fechaCreacion)}
                    {n.fechaLeida ? ` · Leída el ${formatDate(n.fechaLeida)}` : ''}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {n.enlace && (
                    <button
                      type="button"
                      onClick={() => void abrir(n)}
                      className="cursor-pointer rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-brand hover:bg-brand/5"
                    >
                      Abrir
                    </button>
                  )}
                  {!n.leida && (
                    <button
                      type="button"
                      onClick={() => void marcarLeida(n)}
                      className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                      aria-label="Marcar como leída"
                      title="Marcar como leída"
                    >
                      <IconCheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setAEliminar(n)}
                    className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Eliminar notificación"
                    title="Eliminar"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {(data?.totalElements ?? 0) > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <p className="text-[13px] text-gray-500">
            Mostrando {desde}–{hasta} de {data?.totalElements} notificaciones
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

      <ConfirmDialog
        open={confirmarLimpiar}
        tono="danger"
        title="Eliminar notificaciones leídas"
        description="Se borrarán todas las notificaciones que ya marcaste como leídas. Esta acción no se puede deshacer."
        confirmLabel="Eliminar leídas"
        onConfirm={limpiarLeidas}
        onCancel={() => setConfirmarLimpiar(false)}
      />

      <ConfirmDialog
        open={aEliminar !== null}
        tono="danger"
        title="Eliminar notificación"
        description={aEliminar ? `¿Eliminar "${aEliminar.titulo}"?` : ''}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (aEliminar) await eliminar(aEliminar)
          setAEliminar(null)
        }}
        onCancel={() => setAEliminar(null)}
      />
    </section>
  )
}
