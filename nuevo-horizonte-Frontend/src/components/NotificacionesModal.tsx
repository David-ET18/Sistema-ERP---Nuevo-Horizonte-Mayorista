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
import { estiloTipo } from '@/modules/notificaciones/utils/estilos'
import { tiempoRelativo } from '@/modules/notificaciones/utils/tiempo'
import { useNotificacionesStore } from '@/store/notificacionesStore'
import { extractErrorMessage } from '@/api/http'
import { canReadModule } from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { IconCheckCircle, IconInfo, IconTrash, IconX } from '@/components/icons'

export default function NotificacionesModal({ onClose }: { onClose: () => void }) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const refrescar = useNotificacionesStore((state) => state.refrescar)
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

  async function abrir(notificacion: Notificacion) {
    try {
      if (!notificacion.leida) {
        await marcarNotificacionLeida(notificacion.id)
        await Promise.all([cargar(), refrescar()])
      }
      if (notificacion.enlace) {
        navigate(notificacion.enlace)
        onClose()
      }
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function marcarTodasLeidas() {
    try {
      await marcarTodasNotificacionesLeidas()
      await Promise.all([cargar(), refrescar()])
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function borrar(notificacion: Notificacion) {
    try {
      await eliminarNotificacion(notificacion.id)
      await Promise.all([cargar(), refrescar()])
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const hayNoLeidas = notificaciones?.some((n) => !n.leida) ?? false

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notificaciones-titulo"
        className="animate-modal-pop flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div>
            <h3 id="notificaciones-titulo" className="text-[15px] font-semibold text-gray-900">
              Notificaciones
            </h3>
            <p className="text-xs text-gray-400">Roles, permisos y promociones del sistema</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void marcarTodasLeidas()}
              disabled={!hayNoLeidas}
              className="mr-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconCheckCircle className="h-3.5 w-3.5" />
              Marcar todas
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar"
            >
              <IconX />
            </button>
          </div>
        </div>

        <div className="flex flex-col overflow-y-auto px-3 pb-3 pt-3">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
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
                Aquí verás los cambios de permisos, roles y nuevas promociones
              </p>
            </div>
          )}

          {notificaciones && notificaciones.length > 0 && (
            <ul className="flex flex-col overflow-hidden">
              {notificaciones.map((n, i) => {
                const { bg, text, Icon, etiqueta } = estiloTipo(n.tipo)
                return (
                  <li
                    key={n.id}
                    className={`flex items-start gap-2 px-2 py-2 transition-colors hover:bg-gray-50 ${
                      i > 0 ? 'border-t border-gray-100' : ''
                    } ${n.leida ? 'bg-white' : 'bg-brand/[0.04]'}`}
                  >
                    <button
                      type="button"
                      onClick={() => void abrir(n)}
                      className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 px-1.5 py-1.5 text-left"
                    >
                      {!n.leida && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg} ${text}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-gray-900">{n.titulo}</span>
                          <span className="shrink-0 text-[11px] text-gray-400">{tiempoRelativo(n.fechaCreacion)}</span>
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-gray-600">{n.mensaje}</span>
                        <span className="mt-1 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${bg} ${text}`}>
                            {etiqueta}
                          </span>
                          {n.enlace && (
                            <span className="text-[10px] font-medium text-brand">Abrir módulo →</span>
                          )}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void borrar(n)}
                      className="mt-1 shrink-0 cursor-pointer rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Eliminar notificación ${n.titulo}`}
                      title="Eliminar"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {puedeVerPagina && (
          <div className="border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={() => {
                navigate('/notificaciones')
                onClose()
              }}
              className="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
