import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import {
  IconCheckCircle,
  IconChevronRight,
  IconClock,
  IconInfo,
  IconMail,
  IconTrash,
  IconUsers,
  IconX,
} from '@/components/icons'
import { formatDate } from '@/utils/format'
import type { Notificacion } from '../types'
import { estiloTipo, nombreModulo, tiempoRelativo } from '../utils/formato'
import type { IconoTipo } from '../utils/formato'

interface Props {
  notificacion: Notificacion
  onClose: () => void
  /** Marca la notificacion como leida; el padre actualiza su estado. */
  onMarcarLeida?: (notificacion: Notificacion) => void | Promise<void>
  onEliminar?: (notificacion: Notificacion) => void | Promise<void>
  /** Navega al modulo relacionado. Si no se pasa, usa el `enlace` interno. */
  onIrAlModulo?: (notificacion: Notificacion) => void
}

export default function NotificacionDetallePanel({
  notificacion,
  onClose,
  onMarcarLeida,
  onEliminar,
  onIrAlModulo,
}: Props) {
  const estilo = estiloTipo(notificacion.tipo)
  const modulo = nombreModulo(notificacion.enlace)
  const cerrarRef = useRef<HTMLButtonElement>(null)
  const [ocupado, setOcupado] = useState(false)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cerrarRef.current?.focus()

    function alPresionarTecla(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', alPresionarTecla)

    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', alPresionarTecla)
    }
  }, [onClose])

  async function ejecutar(accion?: (n: Notificacion) => void | Promise<void>) {
    if (!accion || ocupado) return
    setOcupado(true)
    try {
      await accion(notificacion)
    } finally {
      setOcupado(false)
    }
  }

  const detalle = notificacion.detalle?.trim()
  const mostrarDetalle = Boolean(detalle) && detalle !== notificacion.mensaje

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-gray-900/45 backdrop-blur-[1px]"
      onClick={onClose}
      role="presentation"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="notificacion-detalle-titulo"
        className="animate-panel-in flex h-full w-[540px] max-w-full flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-blue-600 uppercase">
              Detalle de la notificación
            </p>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Toda la información del aviso, sin resúmenes.
            </p>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label="Cerrar detalle"
          >
            <IconX />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <div className="flex items-start gap-4">
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-4 ${estilo.bg} ${estilo.text} ${estilo.ring}`}
            >
              <estilo.Icon width={26} height={26} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${estilo.bg} ${estilo.text}`}
                >
                  {estilo.etiqueta}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                    notificacion.leida
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-brand/10 text-brand'
                  }`}
                >
                  {notificacion.leida ? 'Leída' : 'Nueva'}
                </span>
              </div>
              <h2
                id="notificacion-detalle-titulo"
                className="mt-1.5 text-lg leading-snug font-semibold text-gray-900"
              >
                {notificacion.titulo}
              </h2>
              <p className="mt-1 text-[13px] text-gray-500">{estilo.descripcion}</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:grid-cols-2">
            <Dato Icon={IconMail} etiqueta="Recibida">
              {formatDate(notificacion.fechaCreacion)}
              <span className="ml-1 text-gray-400">· {tiempoRelativo(notificacion.fechaCreacion)}</span>
            </Dato>
            <Dato Icon={IconClock} etiqueta="Estado">
              {notificacion.leida ? 'Leída' : 'Pendiente de leer'}
              {notificacion.fechaLeida && (
                <span className="ml-1 text-gray-400">· {formatDate(notificacion.fechaLeida)}</span>
              )}
            </Dato>
            <Dato Icon={IconUsers} etiqueta="Realizado por">
              {notificacion.actorNombre || 'Sistema (automático)'}
            </Dato>
            <Dato Icon={IconInfo} etiqueta="Módulo relacionado">
              {modulo ?? 'Sin módulo asociado'}
            </Dato>
          </dl>

          <section>
            <h3 className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              Mensaje
            </h3>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-gray-800">
              {notificacion.mensaje}
            </p>
          </section>

          {mostrarDetalle && (
            <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <h3 className="text-[11px] font-semibold tracking-wider text-blue-700 uppercase">
                Detalle del cambio
              </h3>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-gray-800">
                {detalle}
              </p>
            </section>
          )}

          {!notificacion.leida && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              Esta notificación todavía figura como no leída.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-6 py-4">
          {notificacion.enlace && (
            <button
              type="button"
              onClick={() => {
                if (onIrAlModulo) onIrAlModulo(notificacion)
                else window.location.assign(notificacion.enlace as string)
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0b1b3a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#12305f]"
            >
              Ir a {modulo ?? 'el módulo'}
              <IconChevronRight width={16} height={16} />
            </button>
          )}

          {!notificacion.leida && onMarcarLeida && (
            <button
              type="button"
              onClick={() => void ejecutar(onMarcarLeida)}
              disabled={ocupado}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconCheckCircle width={16} height={16} />
              Marcar como leída
            </button>
          )}

          {onEliminar && !confirmandoEliminar && (
            <button
              type="button"
              onClick={() => setConfirmandoEliminar(true)}
              disabled={ocupado}
              className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconTrash width={16} height={16} />
              Eliminar
            </button>
          )}

          {onEliminar && confirmandoEliminar && (
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5">
              <span className="text-[12px] font-medium text-red-800">¿Eliminar esta notificación?</span>
              <button
                type="button"
                onClick={() => setConfirmandoEliminar(false)}
                disabled={ocupado}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void ejecutar(onEliminar)}
                disabled={ocupado}
                className="cursor-pointer rounded-md bg-red-600 px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Sí, eliminar
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

function Dato({
  Icon,
  etiqueta,
  children,
}: {
  Icon: IconoTipo
  etiqueta: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400 ring-1 ring-gray-200">
        <Icon width={14} height={14} />
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          {etiqueta}
        </dt>
        <dd className="text-[13px] leading-snug font-medium break-words text-gray-800">{children}</dd>
      </div>
    </div>
  )
}
