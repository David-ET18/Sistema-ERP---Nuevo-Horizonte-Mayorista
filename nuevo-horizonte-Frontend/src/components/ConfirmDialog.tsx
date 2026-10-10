import { useEffect, useRef, useState } from 'react'

import ModalMarca from '@/components/ModalMarca'
import { IconAlertTriangle } from '@/components/icons'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** 'danger' para acciones destructivas (eliminar); 'default' para confirmaciones neutras. */
  tono?: 'danger' | 'default'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

/**
 * Dialogo de confirmacion reutilizable, en reemplazo de window.confirm.
 * Se cierra con Escape, enfoca el boton de cancelar al abrir y bloquea el
 * boton de confirmar mientras la accion esta en curso (soporta onConfirm
 * asincrono sin que el modulo que lo usa tenga que manejar un loading aparte).
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tono = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const [procesando, setProcesando] = useState(false)
  const cancelarRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelarRef.current?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  async function confirmar() {
    setProcesando(true)
    try {
      await onConfirm()
    } finally {
      setProcesando(false)
    }
  }

  const esDanger = tono === 'danger'

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="animate-modal-pop w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="p-5">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              esDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}
          >
            <IconAlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0 pt-1">
            <h3 id="confirm-dialog-title" className="text-[15px] font-semibold text-gray-900">
              {title}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-500">{description}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelarRef}
            type="button"
            onClick={onCancel}
            disabled={procesando}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={procesando}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              esDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {procesando && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {procesando ? 'Procesando…' : confirmLabel}
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
