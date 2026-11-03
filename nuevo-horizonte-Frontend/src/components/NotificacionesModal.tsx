import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactElement, SVGProps } from 'react'

import ModalMarca from '@/components/ModalMarca'
import ConfirmDialog from '@/components/ConfirmDialog'
import type { Notificacion } from '@/modules/notificaciones/types'
import {
  eliminarNotificacion,
  eliminarNotificacionesLeidas,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '@/modules/notificaciones/services/notificacionService'
import { useNotificacionesStore } from '@/store/notificacionesStore'
import { useToastStore } from '@/store/toastStore'
import { extractErrorMessage } from '@/api/http'
import { formatDate } from '@/utils/format'
import { canReadModule } from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import {
  IconCheckCircle,
  IconInfo,
  IconPencil,
  IconStar,
  IconTrash,
  IconUsers,
  IconX,
} from '@/components/icons'

function tiempoRelativo(isoDate: string): string {
  const fecha = new Date(isoDate)
  const diffMs = Date.now() - fecha.getTime()
  const minutos = Math.floor(diffMs / 60000)
  if (minutos < 1) return 'ahora mismo'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return `hace ${dias} d`
  return formatDate(isoDate)
}

type IconoTipo = (props: SVGProps<SVGSVGElement>) => ReactElement

function estiloTipo(tipo: string): { bg: string; text: string; Icon: IconoTipo } {
  switch (tipo) {
    case 'PROMOCION':
      return { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', Icon: IconStar }
    case 'ROL_PERMISOS':
      return { bg: 'bg-amber-100', text: 'text-amber-700', Icon: IconPencil }
    case 'ROL_ASIGNADO':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', Icon: IconUsers }
    case 'ROL_QUITADO':
      return { bg: 'bg-red-100', text: 'text-red-700', Icon: IconTrash }
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-700', Icon: IconInfo }
  }
}

export default function NotificacionesModal({ onClose }: { onClose: () => void }) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [trabajando, setTrabajando] = useState(false)
  const [confirmarEliminarLeidas, setConfirmarEliminarLeidas] = useState(false)
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

  async function sincronizar() {
    await Promise.all([cargar(), refrescar()])
  }

  async function abrirNotificacion(notificacion: Notificacion) {
    try {
      if (!notificacion.leida) {
        await marcarNotificacionLeida(notificacion.id)
        await sincronizar()
      }
      if (notificacion.enlace) {
        onClose()
        navigate(notificacion.enlace)
      }
    } catch (err) {
      toast(`No se pudo abrir la notificación: ${extractErrorMessage(err)}`, 'error')
    }
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

  async function eliminarUna(notificacion: Notificacion) {
    setTrabajando(true)
    try {
      await eliminarNotificacion(notificacion.id)
      await sincronizar()
      toast('Notificación eliminada', 'success')
    } catch (err) {
      toast(`No se pudo eliminar la notificación: ${extractErrorMessage(err)}`, 'error')
    } finally {
      setTrabajando(false)
    }
  }

  async function eliminarLeidas() {
    setTrabajando(true)
    try {
      const eliminadas = await eliminarNotificacionesLeidas()
      await sincronizar()
      toast(
        eliminadas > 0
          ? `Se eliminaron ${eliminadas} notificaciones leídas`
          : 'No había notificaciones leídas para eliminar',
        'success',
      )
    } catch (err) {
      toast(`No se pudieron eliminar las notificaciones: ${extractErrorMessage(err)}`, 'error')
    } finally {
      setTrabajando(false)
      setConfirmarEliminarLeidas(false)
    }
  }

  const hayNoLeidas = notificaciones?.some((n) => !n.leida) ?? false
  const hayLeidas = notificaciones?.some((n) => n.leida) ?? false

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
        className="animate-modal-pop flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div>
            <h3 id="notificaciones-titulo" className="text-[15px] font-semibold text-gray-900">
              Notificaciones
            </h3>
            <p className="text-xs text-gray-400">Promociones, roles y avisos de tu cuenta</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <IconX />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 pb-3 pt-2">
          <button
            type="button"
            onClick={() => void marcarTodasLeidas()}
            disabled={!hayNoLeidas || trabajando}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconCheckCircle className="h-3.5 w-3.5" />
            Marcar todas
          </button>
          <button
            type="button"
            onClick={() => setConfirmarEliminarLeidas(true)}
            disabled={!hayLeidas || trabajando}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconTrash className="h-3.5 w-3.5" />
            Eliminar leídas
          </button>
          {puedeVerPagina && (
            <button
              type="button"
              onClick={() => {
                onClose()
                navigate('/notificaciones')
              }}
              className="ml-auto inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              Ver todas
            </button>
          )}
        </div>

        <div className="flex flex-col overflow-y-auto px-3 pb-3">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </p>
          )}

          {!notificaciones && !error && (
            <div className="py-10 text-center text-sm text-gray-400">Cargando notificaciones...</div>
          )}

          {notificaciones && notificaciones.length === 0 && (
            <div className="px-5 py-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <IconInfo className="h-6 w-6" />
              </span>
              <p className="mt-3 text-sm font-medium text-gray-700">No tienes notificaciones</p>
              <p className="mt-1 text-[13px] text-gray-400">
                Aquí verás las promociones y los cambios de permisos de tu cuenta
              </p>
            </div>
          )}

          {notificaciones && notificaciones.length > 0 && (
            <ul className="flex flex-col overflow-hidden">
              {notificaciones.map((n, i) => {
                const { bg, text, Icon } = estiloTipo(n.tipo)
                return (
                  <li
                    key={n.id}
                    className={`flex items-start gap-1 px-1 transition-colors hover:bg-gray-50 ${
                      i > 0 ? 'border-t border-gray-100' : ''
                    } ${n.leida ? 'bg-white' : 'bg-brand/[0.04]'}`}
                  >
                    <button
                      type="button"
                      onClick={() => void abrirNotificacion(n)}
                      className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 px-2.5 py-3.5 text-left"
                    >
                      {!n.leida && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg} ${text}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-gray-900">
                            {n.titulo}
                          </span>
                          <span className="shrink-0 text-[11px] text-gray-400">
                            {tiempoRelativo(n.fechaCreacion)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-gray-600">
                          {n.mensaje}
                        </span>
                        {n.enlace && (
                          <span className="mt-1 inline-block text-[11px] font-semibold text-brand">
                            Ver módulo →
                          </span>
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void eliminarUna(n)}
                      disabled={trabajando}
                      className="mt-3 shrink-0 cursor-pointer rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      aria-label={`Eliminar ${n.titulo}`}
                      title="Eliminar notificación"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>

      <ConfirmDialog
        open={confirmarEliminarLeidas}
        tono="danger"
        title="Eliminar notificaciones leídas"
        description="Se borrarán todas las notificaciones que ya marcaste como leídas. Esta acción no se puede deshacer."
        confirmLabel="Eliminar leídas"
        onConfirm={eliminarLeidas}
        onCancel={() => setConfirmarEliminarLeidas(false)}
      />
    </>
  )
}
