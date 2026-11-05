import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ModalMarca from '@/components/ModalMarca'
import type { Notificacion } from '@/modules/notificaciones/types'
import {
  eliminarNotificacion,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '@/modules/notificaciones/services/notificacionService'
import NotificacionDetallePanel from '@/modules/notificaciones/components/NotificacionDetallePanel'
import { estiloTipo, tiempoRelativo } from '@/modules/notificaciones/utils/formato'
import { useNotificacionesStore } from '@/store/notificacionesStore'
import { useToastStore } from '@/store/toastStore'
import { extractErrorMessage } from '@/api/http'
import { canReadModule } from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import {
  BellIcon,
  IconCheckCircle,
  IconChevronRight,
  IconInfo,
  IconX,
} from '@/components/icons'

type Pestana = 'todas' | 'sin-leer'

/** Agrupa por cercania de fecha para que la lista se lea como una bandeja. */
function grupoFecha(isoDate: string): string {
  const fecha = new Date(isoDate)
  const hoy = new Date()
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const inicioFecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  const dias = Math.round((inicioHoy.getTime() - inicioFecha.getTime()) / 86400000)
  if (dias <= 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return 'Esta semana'
  return 'Anteriores'
}

export default function NotificacionesModal({ onClose }: { onClose: () => void }) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [trabajando, setTrabajando] = useState(false)
  const [pestana, setPestana] = useState<Pestana>('todas')
  const [detalle, setDetalle] = useState<Notificacion | null>(null)
  const refrescar = useNotificacionesStore((state) => state.refrescar)
  const toast = useToastStore((state) => state.show)
  const navigate = useNavigate()
  const puedeVerPagina = canReadModule('notificaciones')

  const cargar = useCallback(async () => {
    try {
      const data = await listarNotificaciones()
      setNotificaciones(data)
      setError(null)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  // Semiautomatico: mientras el panel esta abierto se refresca solo cada 10 s,
  // sin recargar la pagina. Al volver a la pestana tambien se actualiza.
  useEffect(() => {
    const actualizar = () => {
      if (document.visibilityState === 'visible') void cargar()
    }
    const timer = setInterval(actualizar, 10000)
    window.addEventListener('focus', actualizar)
    document.addEventListener('visibilitychange', actualizar)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', actualizar)
      document.removeEventListener('visibilitychange', actualizar)
    }
  }, [cargar])

  async function sincronizar() {
    await Promise.all([cargar(), refrescar()])
  }

  async function abrirNotificacion(notificacion: Notificacion) {
    setDetalle(notificacion)
    if (notificacion.leida) return
    try {
      await marcarNotificacionLeida(notificacion.id)
      setDetalle((actual) =>
        actual && actual.id === notificacion.id
          ? { ...actual, leida: true, fechaLeida: new Date().toISOString() }
          : actual,
      )
      await sincronizar()
    } catch (err) {
      toast(`No se pudo abrir la notificación: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function marcarDesdePanel(notificacion: Notificacion) {
    try {
      await marcarNotificacionLeida(notificacion.id)
      setDetalle((actual) =>
        actual && actual.id === notificacion.id
          ? { ...actual, leida: true, fechaLeida: new Date().toISOString() }
          : actual,
      )
      await sincronizar()
      toast('Notificación marcada como leída', 'success')
    } catch (err) {
      toast(`No se pudo marcar la notificación: ${extractErrorMessage(err)}`, 'error')
    }
  }

  function irAlModulo(notificacion: Notificacion) {
    setDetalle(null)
    if (!notificacion.enlace) return
    onClose()
    navigate(notificacion.enlace)
  }

  function verTodas() {
    onClose()
    navigate('/notificaciones')
  }

  async function marcarTodasLeidas() {
    if (!notificaciones?.some((n) => !n.leida)) return
    setTrabajando(true)
    try {
      await marcarTodasNotificacionesLeidas()
      await sincronizar()
    } catch (err) {
      toast(`No se pudieron marcar las notificaciones: ${extractErrorMessage(err)}`, 'error')
    } finally {
      setTrabajando(false)
    }
  }

  async function eliminarDesdePanel(notificacion: Notificacion) {
    try {
      await eliminarNotificacion(notificacion.id)
      setDetalle(null)
      await sincronizar()
      toast('Notificación eliminada', 'success')
    } catch (err) {
      toast(`No se pudo eliminar la notificación: ${extractErrorMessage(err)}`, 'error')
    }
  }

  const hayNoLeidas = notificaciones?.some((n) => !n.leida) ?? false
  const totalNoLeidas = notificaciones?.filter((n) => !n.leida).length ?? 0

  const visibles = (notificaciones ?? []).filter((n) => pestana === 'todas' || !n.leida)
  const grupos = visibles.reduce<{ titulo: string; items: Notificacion[] }[]>((acc, n) => {
    const titulo = grupoFecha(n.fechaCreacion)
    const ultimo = acc[acc.length - 1]
    if (ultimo && ultimo.titulo === titulo) ultimo.items.push(n)
    else acc.push({ titulo, items: [n] })
    return acc
  }, [])

  return (
    <>
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notificaciones-titulo"
          className="animate-modal-pop flex max-h-[86vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalMarca />

          {/* Cabecera */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/10">
              <BellIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3
                id="notificaciones-titulo"
                className="text-[16px] font-semibold text-gray-900"
              >
                Notificaciones
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                {hayNoLeidas ? `${totalNoLeidas} sin leer` : 'Estás al día'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar"
            >
              <IconX />
            </button>
          </div>

          {/* Pestanas + accion */}
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5">
            <div className="flex rounded-lg bg-gray-100 p-0.5">
              <button
                type="button"
                onClick={() => setPestana('todas')}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  pestana === 'todas'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setPestana('sin-leer')}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  pestana === 'sin-leer'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sin leer
                {totalNoLeidas > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] text-white">
                    {totalNoLeidas > 99 ? '99+' : totalNoLeidas}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void marcarTodasLeidas()}
              disabled={!hayNoLeidas || trabajando}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-45"
              title="Marcar todas como leídas"
            >
              <IconCheckCircle className="h-3.5 w-3.5" />
              Marcar todas
            </button>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {error && (
              <p className="m-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                {error}
              </p>
            )}

            {!notificaciones && !error && (
              <div className="flex flex-col gap-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            )}

            {notificaciones && visibles.length === 0 && (
              <div className="px-6 py-12 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <IconInfo className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-semibold text-gray-800">
                  {pestana === 'sin-leer'
                    ? 'No tienes notificaciones sin leer'
                    : 'No tienes notificaciones'}
                </p>
                <p className="mt-1 text-[13px] text-gray-500">
                  {pestana === 'sin-leer'
                    ? 'Cuando llegue algo nuevo aparecerá aquí.'
                    : 'Aquí verás las promociones y los cambios de tu cuenta.'}
                </p>
              </div>
            )}

            {grupos.map((grupo) => (
              <div key={grupo.titulo}>
                <p className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-5 py-1.5 text-[10.5px] font-semibold tracking-wider text-gray-400 uppercase backdrop-blur">
                  {grupo.titulo}
                </p>
                <ul>
                  {grupo.items.map((n) => {
                    const { bg, text, Icon, etiqueta } = estiloTipo(n.tipo)
                    return (
                      <li
                        key={n.id}
                        className={`relative border-b border-gray-50 last:border-b-0 ${
                          n.leida ? 'bg-white' : 'bg-brand/[0.035]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => void abrirNotificacion(n)}
                          className="flex w-full cursor-pointer items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50"
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg} ${text}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-3">
                              <span
                                className={`text-sm leading-snug ${
                                  n.leida ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'
                                }`}
                              >
                                {n.titulo}
                              </span>
                              <span className="shrink-0 pt-0.5 text-[11px] whitespace-nowrap text-gray-400">
                                {tiempoRelativo(n.fechaCreacion)}
                              </span>
                            </span>
                            <span className="mt-0.5 line-clamp-2 block text-[13px] leading-relaxed text-gray-600">
                              {n.mensaje}
                            </span>
                            <span className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-gray-500 uppercase">
                                {etiqueta}
                              </span>
                              {n.actorNombre && (
                                <span className="text-[11px] text-gray-400">por {n.actorNombre}</span>
                              )}
                            </span>
                          </span>
                          {!n.leida && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Pie */}
          {puedeVerPagina && (
            <div className="border-t border-gray-100 p-3">
              <button
                type="button"
                onClick={verTodas}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#0b1b3a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#12305f]"
              >
                Ver todas las notificaciones
                <IconChevronRight width={16} height={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {detalle && (
        <NotificacionDetallePanel
          notificacion={detalle}
          onClose={() => setDetalle(null)}
          onMarcarLeida={marcarDesdePanel}
          onEliminar={eliminarDesdePanel}
          onIrAlModulo={irAlModulo}
        />
      )}
    </>
  )
}
