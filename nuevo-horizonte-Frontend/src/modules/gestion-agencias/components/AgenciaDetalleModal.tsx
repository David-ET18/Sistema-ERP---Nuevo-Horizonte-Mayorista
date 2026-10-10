import { useEffect, useState } from 'react'

import type { Agencia } from '../types'
import ModalMarca from '@/components/ModalMarca'
import { detalleAgencia, logoAgenciaUrl } from '../services/agenciaService'
import { extractErrorMessage } from '@/api/http'
import { formatDate } from '@/utils/format'
import {
  IconBriefcase,
  IconCalendar,
  IconInfo,
  IconMail,
  IconPhone,
  IconUsers,
  IconX,
} from '@/components/icons'

interface Props {
  id: number
  onClose: () => void
  onEditar: (agencia: Agencia) => void
  puedeEditar: boolean
}

export default function AgenciaDetalleModal({ id, onClose, onEditar, puedeEditar }: Props) {
  const [agencia, setAgencia] = useState<Agencia | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    detalleAgencia(id)
      .then(setAgencia)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [id])

  const logo = logoAgenciaUrl(agencia?.logoUrl ?? null)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      onClick={onClose}
    >
      <div
        className="animate-modal-pop flex max-h-[90vh] w-[560px] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="flex flex-col gap-4 overflow-y-auto p-6">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Detalle de la agencia</h3>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <IconX />
            </button>
          </div>

          {error && <p className="text-[13px] text-red-700">{error}</p>}
          {!agencia && !error && <p className="text-sm text-gray-400">Cargando agencia...</p>}

          {agencia && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  {logo ? (
                    <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[10px] uppercase text-gray-400">Sin logo</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-gray-900">{agencia.razonSocial}</p>
                  {agencia.nombreComercial && (
                    <p className="text-sm text-gray-500">{agencia.nombreComercial}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {agencia.esPrioritaria && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Prioritaria
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        agencia.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {agencia.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-2">
                <Fila etiqueta="RUC" valor={agencia.ruc} icono={<IconBriefcase className="h-3.5 w-3.5" />} />
                <Fila etiqueta="Registrada" valor={formatDate(agencia.fechaCreacion)} icono={<IconCalendar className="h-3.5 w-3.5" />} />
                <Fila etiqueta="Contacto" valor={agencia.contactoNombre || '-'} icono={<IconUsers className="h-3.5 w-3.5" />} />
                <Fila etiqueta="Teléfono" valor={agencia.contactoTelefono || '-'} icono={<IconPhone className="h-3.5 w-3.5" />} />
                <Fila etiqueta="Email" valor={agencia.contactoEmail || '-'} icono={<IconMail className="h-3.5 w-3.5" />} />
                <Fila etiqueta="Categoría" valor={agencia.categoria || '-'} icono={<IconInfo className="h-3.5 w-3.5" />} />
              </div>

              {puedeEditar && (
                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => onEditar(agencia)}
                    className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
                  >
                    Editar agencia
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Fila({ etiqueta, valor, icono }: { etiqueta: string; valor: string; icono?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      {icono && (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm ring-1 ring-black/5">
          {icono}
        </span>
      )}
      <p className="flex min-w-0 flex-col">
        <span className="text-[11px] uppercase tracking-wide text-gray-400">{etiqueta}</span>
        <span className="break-words font-medium text-gray-800">{valor}</span>
      </p>
    </div>
  )
}
