import { useEffect, useState } from 'react'

import { extractErrorMessage } from '@/api/http'
import Alert from '@/components/Alert'
import { IconX } from '@/components/icons'
import { useFormDraft } from '@/hooks/useFormDraft'

export interface ValoresCatalogo {
  nombre: string
  grupo: string
  descripcion: string
  activo: boolean
}

interface Props {
  titulo: string
  /** Texto corto que explica para que sirve el registro (ej. "destino" o "servicio"). */
  subtitulo: string
  etiquetaNombre: string
  etiquetaGrupo: string
  grupoObligatorio: boolean
  sugerenciasGrupo: string[]
  inicial: ValoresCatalogo | null
  onSubmit: (valores: ValoresCatalogo) => Promise<void>
  onClose: () => void
}

const VACIO: ValoresCatalogo = { nombre: '', grupo: '', descripcion: '', activo: true }
const LIMITE_DESCRIPCION_VISUAL = 300

const inputClase =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10'

export default function CatalogoFormModal({
  titulo,
  subtitulo,
  etiquetaNombre,
  etiquetaGrupo,
  grupoObligatorio,
  sugerenciasGrupo,
  inicial,
  onSubmit,
  onClose,
}: Props) {
  const [valoresEdicion, setValoresEdicion] = useState<ValoresCatalogo>(inicial ?? VACIO)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const esEdicion = inicial !== null
  // El alta conserva borrador entre cierres; la edicion parte del registro real.
  const borrador = useFormDraft<ValoresCatalogo>(
    `catalogo:${etiquetaGrupo}:${esEdicion ? (inicial?.nombre ?? 'editar') : 'nuevo'}`,
    VACIO,
  )
  const valores = esEdicion ? valoresEdicion : borrador.valor

  useEffect(() => {
    if (inicial) setValoresEdicion(inicial)
    setError(null)
  }, [inicial])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function set<K extends keyof ValoresCatalogo>(campo: K, valor: ValoresCatalogo[K]) {
    if (esEdicion) setValoresEdicion((prev) => ({ ...prev, [campo]: valor }))
    else borrador.setCampo(campo, valor)
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
      if (!esEdicion) borrador.reset()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-gray-900/40 backdrop-blur-[1px]" onClick={onClose} role="presentation">
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalogo-form-titulo"
        className="animate-panel-in flex h-full w-[460px] max-w-full flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
              {esEdicion ? 'Editar registro' : 'Nuevo registro'}
            </p>
            <h3 id="catalogo-form-titulo" className="mt-0.5 text-[17px] font-semibold text-gray-900">
              {titulo}
            </h3>
            <p className="mt-0.5 text-[13px] text-gray-500">{subtitulo}</p>
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

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {error && <Alert type="error">{error}</Alert>}

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-gray-700">
              {etiquetaNombre} <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              autoFocus
              className={inputClase}
              value={valores.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              placeholder={`Ej. ${etiquetaNombre === 'Nombre' ? 'Cusco' : ''}`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-gray-700">
              {etiquetaGrupo}
              {grupoObligatorio && <span className="text-red-500"> *</span>}
              {!grupoObligatorio && <span className="ml-1 text-gray-400">(opcional)</span>}
            </span>
            <input
              type="text"
              list="sugerencias-grupo"
              className={inputClase}
              value={valores.grupo}
              onChange={(e) => set('grupo', e.target.value)}
              autoComplete="off"
            />
            <datalist id="sugerencias-grupo">
              {sugerenciasGrupo.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-gray-700">Descripción</span>
              <span className="text-[11px] text-gray-400">
                {valores.descripcion.length}/{LIMITE_DESCRIPCION_VISUAL}
              </span>
            </div>
            <textarea
              className={`${inputClase} min-h-[100px] resize-y`}
              value={valores.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              placeholder="Notas internas, referencias u observaciones (opcional)"
            />
          </label>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-gray-700">
                {valores.activo ? 'Activo' : 'Inactivo'}
              </span>
              <span className="text-[11.5px] leading-snug text-gray-500">
                {valores.activo
                  ? 'Disponible en los formularios de tarifas y paquetes.'
                  : 'Oculto en los formularios; conserva su historial.'}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={valores.activo}
              aria-label="Alternar estado activo"
              onClick={() => set('activo', !valores.activo)}
              className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 ${
                valores.activo ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                  valores.activo ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          {!esEdicion && (
            <span className="text-[11px] text-gray-400">
              {borrador.restaurado
                ? 'Borrador restaurado'
                : 'Los datos se guardan al cerrar el modal'}
            </span>
          )}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear registro'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
