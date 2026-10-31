import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Notificacion } from '../types'
import {
  eliminarNotificacion,
  eliminarNotificacionesLeidas,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../services/notificacionService'
import { estiloTipo } from '../utils/estilos'
import { tiempoRelativo } from '../utils/tiempo'
import { useNotificacionesStore } from '@/store/notificacionesStore'
import { useToastStore } from '@/store/toastStore'
import { extractErrorMessage } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
  BellIcon,
  IconCheckCircle,
  IconChevronRight,
  IconInfo,
  IconSearch,
  IconStar,
  IconTrash,
} from '@/components/icons'

type FiltroLectura = 'todas' | 'no-leidas' | 'leidas'

const TIPOS_CONOCIDOS = ['PROMOCION', 'ROL_PERMISOS', 'ROL_ASIGNADO', 'ROL_QUITADO', 'SISTEMA']

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<FiltroLectura>('todas')
  const [tipo, setTipo] = useState('')
  const [q, setQ] = useState('')
  const [confirmarLimpiar, setConfirmarLimpiar] = useState(false)
  const refrescarContador = useNotificacionesStore((s) => s.refrescar)
  const toast = useToastStore((s) => s.show)
  const navigate = useNavigate()

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listarNotificaciones()
      setNotificaciones(data)
      setError(null)
      await refrescarContador()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [refrescarContador])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function marcarLeida(notificacion: Notificacion) {
    if (notificacion.leida) return
    try {
      await marcarNotificacionLeida(notificacion.id)
      await cargar()
    } catch (err) {
      toast(`No se pudo marcar como leída: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function marcarTodas() {
    try {
      await marcarTodasNotificacionesLeidas()
      toast('Todas las notificaciones quedaron como leídas', 'success')
      await cargar()
    } catch (err) {
      toast(`No se pudieron marcar: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function borrar(notificacion: Notificacion) {
    try {
      await eliminarNotificacion(notificacion.id)
      toast('Notificación eliminada', 'success')
      await cargar()
    } catch (err) {
      toast(`No se pudo eliminar: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function limpiarLeidas() {
    try {
      await eliminarNotificacionesLeidas()
      toast('Notificaciones leídas eliminadas', 'success')
      await cargar()
    } catch (err) {
      toast(`No se pudieron limpiar: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function abrir(notificacion: Notificacion) {
    if (!notificacion.leida) {
      await marcarLeida(notificacion)
    }
    if (notificacion.enlace) {
      navigate(notificacion.enlace)
    }
  }

  const total = notificaciones?.length ?? 0
  const noLeidas = notificaciones?.filter((n) => !n.leida).length ?? 0
  const leidas = total - noLeidas
  const promociones = notificaciones?.filter((n) => n.tipo === 'PROMOCION').length ?? 0

  const tipos = useMemo(() => {
    const presentes = new Set((notificaciones ?? []).map((n) => n.tipo))
    return Array.from(new Set([...TIPOS_CONOCIDOS, ...presentes]))
  }, [notificaciones])

  const filtradas = useMemo(() => {
    const texto = q.trim().toLowerCase()
    return (notificaciones ?? []).filter((n) => {
      if (filtro === 'no-leidas' && n.leida) return false
      if (filtro === 'leidas' && !n.leida) return false
      if (tipo && n.tipo !== tipo) return false
      if (texto && !`${n.titulo} ${n.mensaje}`.toLowerCase().includes(texto)) return false
      return true
    })
  }, [notificaciones, filtro, tipo, q])

  const cards = [
    {
      etiqueta: 'Total',
      valor: total,
      color: 'bg-blue-100 text-blue-600',
      Icon: BellIcon,
    },
    {
      etiqueta: 'No leídas',
      valor: noLeidas,
      color: 'bg-red-100 text-red-600',
      Icon: IconInfo,
    },
    {
      etiqueta: 'Leídas',
      valor: leidas,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
    {
      etiqueta: 'Promociones',
      valor: promociones,
      color: 'bg-amber-100 text-amber-600',
      Icon: IconStar,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
          <p className="mt-1 text-sm text-gray-500">
            Avisos de roles, permisos y promociones dirigidos a tu cuenta
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void marcarTodas()}
            disabled={noLeidas === 0}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconCheckCircle className="h-4 w-4" />
            Marcar todas
          </button>
          <button
            type="button"
            onClick={() => setConfirmarLimpiar(true)}
            disabled={leidas === 0}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconTrash className="h-4 w-4" />
            Limpiar leídas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
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
        <div className="flex rounded-lg bg-gray-100 p-1">
          {(
            [
              ['todas', 'Todas'],
              ['no-leidas', 'No leídas'],
              ['leidas', 'Leídas'],
            ] as const
          ).map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltro(valor)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                filtro === valor ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar notificación..."
            className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {estiloTipo(t).etiqueta}
            </option>
          ))}
        </select>

        <span className="ml-auto text-[13px] text-gray-500">
          {filtradas.length} de {total} notificaciones
        </span>
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-3.5 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filtradas.length === 0 && (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <BellIcon className="h-7 w-7" />
          </span>
          <p className="mt-4 text-base font-semibold text-gray-800">No hay notificaciones aquí</p>
          <p className="mt-1 text-sm text-gray-500">
            {total === 0
              ? 'Cuando ocurra un cambio de roles o se publique una promoción, aparecerá en esta bandeja.'
              : 'Prueba con otro filtro o limpia la búsqueda.'}
          </p>
        </div>
      )}

      {!loading && filtradas.length > 0 && (
        <ul className="flex flex-col gap-3">
          {filtradas.map((notificacion) => {
            const { bg, text, Icon, etiqueta } = estiloTipo(notificacion.tipo)
            return (
              <li
                key={notificacion.id}
                className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm transition-colors ${
                  notificacion.leida
                    ? 'border-gray-100 bg-white'
                    : 'border-brand/15 bg-brand/[0.03]'
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${text}`}>
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{notificacion.titulo}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${bg} ${text}`}>
                      {etiqueta}
                    </span>
                    {!notificacion.leida && (
                      <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                        Nueva
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-gray-600">{notificacion.mensaje}</p>
                  <p className="mt-1.5 text-[11px] text-gray-400">
                    {tiempoRelativo(notificacion.fechaCreacion)}
                    {notificacion.fechaLeida ? ' · leída' : ''}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {!notificacion.leida && (
                    <button
                      type="button"
                      onClick={() => void marcarLeida(notificacion)}
                      className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                      aria-label={`Marcar como leída ${notificacion.titulo}`}
                      title="Marcar como leída"
                    >
                      <IconCheckCircle />
                    </button>
                  )}
                  {notificacion.enlace && (
                    <button
                      type="button"
                      onClick={() => void abrir(notificacion)}
                      className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                      aria-label={`Abrir ${notificacion.titulo}`}
                      title="Abrir módulo"
                    >
                      <IconChevronRight />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void borrar(notificacion)}
                    className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Eliminar ${notificacion.titulo}`}
                    title="Eliminar"
                  >
                    <IconTrash />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={confirmarLimpiar}
        tono="danger"
        title="Limpiar notificaciones leídas"
        description="Se eliminarán de tu bandeja todas las notificaciones que ya marcaste como leídas. Esta acción no se puede deshacer."
        confirmLabel="Limpiar leídas"
        onConfirm={async () => {
          await limpiarLeidas()
          setConfirmarLimpiar(false)
        }}
        onCancel={() => setConfirmarLimpiar(false)}
      />
    </section>
  )
}
