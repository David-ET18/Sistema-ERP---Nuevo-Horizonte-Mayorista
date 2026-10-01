import { useEffect, useState } from 'react'

import type { Agencia } from '../types'
import { detalleAgencia, logoAgenciaUrl } from '../services/agenciaService'
import { extractErrorMessage } from '@/api/http'
import { formatDate } from '@/utils/format'
import { IconX } from '@/components/icons'

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
        className="flex max-h-[90vh] w-[560px] max-w-[95vw] flex-col gap-4 overflow-y-auto rounded-xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
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
                  {agencia.categoria && (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {agencia.categoria}
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

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
              <Fila etiqueta="RUC" valor={agencia.ruc} />
              <Fila etiqueta="Registrada" valor={formatDate(agencia.fechaCreacion)} />
              <Fila etiqueta="Contacto" valor={agencia.contactoNombre || '-'} />
              <Fila etiqueta="Teléfono" valor={agencia.contactoTelefono || '-'} />
              <Fila etiqueta="Email" valor={agencia.contactoEmail || '-'} />
              <Fila etiqueta="Categoría" valor={agencia.categoria || '-'} />
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
  )
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <p className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-gray-400">{etiqueta}</span>
      <span className="font-medium text-gray-800">{valor}</span>
    </p>
  )
}
