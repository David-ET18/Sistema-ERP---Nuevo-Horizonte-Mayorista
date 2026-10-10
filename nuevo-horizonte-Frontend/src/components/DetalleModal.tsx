import type { ReactNode } from 'react'

import ModalMarca from '@/components/ModalMarca'
import { IconX } from '@/components/icons'

export interface FilaDetalle {
  etiqueta: string
  valor: string
  icono?: ReactNode
}

interface Props {
  titulo: string
  subtitulo?: string
  filas: FilaDetalle[]
  onClose: () => void
  children?: ReactNode
}

export default function DetalleModal({ titulo, subtitulo, filas, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div
        className="animate-modal-pop flex max-h-[90vh] w-[560px] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="flex flex-col gap-4 overflow-y-auto p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
              {subtitulo && <p className="text-xs text-gray-400">{subtitulo}</p>}
            </div>
            <button
              type="button"
              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <IconX width={16} height={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-2">
            {filas.map((f) => (
              <div key={f.etiqueta} className="flex min-w-0 items-start gap-2.5">
                {f.icono && (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm ring-1 ring-black/5">
                    {f.icono}
                  </span>
                )}
                <div className="flex min-w-0 flex-col">
                  <span className="text-[11px] uppercase tracking-wide text-gray-400">{f.etiqueta}</span>
                  <span className="break-words font-medium text-gray-800">{f.valor}</span>
                </div>
              </div>
            ))}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}