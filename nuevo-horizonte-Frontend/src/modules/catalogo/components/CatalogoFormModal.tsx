import { useEffect, useState } from 'react'

import { extractErrorMessage } from '@/api/http'
import { IconX } from '@/components/icons'

export interface ValoresCatalogo {
  nombre: string
  grupo: string
  descripcion: string
  activo: boolean
}

interface Props {
  titulo: string
  etiquetaNombre: string
  etiquetaGrupo: string
  grupoObligatorio: boolean
  sugerenciasGrupo: string[]
  inicial: ValoresCatalogo | null
  onSubmit: (valores: ValoresCatalogo) => Promise<void>
  onClose: () => void
}

const VACIO: ValoresCatalogo = { nombre: '', grupo: '', descripcion: '', activo: true }

const inputClase =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand'

export default function CatalogoFormModal({
  titulo,
  etiquetaNombre,
  etiquetaGrupo,
  grupoObligatorio,
  sugerenciasGrupo,
  inicial,
  onSubmit,
  onClose,
}: Props) {
  const [valores, setValores] = useState<ValoresCatalogo>(inicial ?? VACIO)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    setValores(inicial ?? VACIO)
    setError(null)
  }, [inicial])

  function set<K extends keyof ValoresCatalogo>(campo: K, valor: ValoresCatalogo[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }))
  }

  async function guardar() {
    if (!valores.nombre.trim()) {
      setError(`${etiquetaNombre} es obligatorio`)
      return
    }
    if (grupoObligatorio && !valores.grupo.trim()) {
      setError(`${etiquetaGrupo} es obligatorio`)
      return
    }
    setGuardando(true)
    setError(null)
    try {
      await onSubmit(valores)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={onClose}>
      <aside
        className="flex h-full w-[440px] max-w-full flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <IconX />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-gray-600">
              {etiquetaNombre} <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              className={inputClase}
              value={valores.nombre}
              onChange={(e) => set('nombre', e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-gray-600">
              {etiquetaGrupo}
              {grupoObligatorio && <span className="text-red-500"> *</span>}
            </span>
            <input
              type="text"
              list="sugerencias-grupo"
              className={inputClase}
              value={valores.grupo}
              onChange={(e) => set('grupo', e.target.value)}
            />
            <datalist id="sugerencias-grupo">
              {sugerenciasGrupo.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-gray-600">Descripción</span>
            <textarea
              className={`${inputClase} min-h-[90px] resize-y`}
              value={valores.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
            />
          </label>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-gray-700">Activo</span>
              <span className="text-[11px] text-gray-400">Si se desactiva, deja de ofrecerse en los formularios</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={valores.activo}
              onClick={() => set('activo', !valores.activo)}
              className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                valores.activo ? 'bg-brand' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  valores.activo ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </aside>
    </div>
  )
}
