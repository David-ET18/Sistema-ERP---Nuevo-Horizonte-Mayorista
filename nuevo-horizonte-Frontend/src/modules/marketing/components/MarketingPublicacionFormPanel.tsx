import { useRef, useState } from 'react'

import { extractErrorMessage } from '@/api/http'
import ModalMarca from '@/components/ModalMarca'
import { IconSend, IconTrash, IconUpload, IconX } from '@/components/icons'
import { useToastStore } from '@/store/toastStore'
import { publicarMarketing } from '../services/marketingService'

interface Props {
  onClose: () => void
  onSaved: () => void
}

const MAX_IMAGEN_BYTES = 5 * 1024 * 1024
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_TEXTO = 500

export default function MarketingPublicacionFormPanel({ onClose, onSaved }: Props) {
  const [texto, setTexto] = useState('')
  const [imagen, setImagen] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [publicando, setPublicando] = useState(false)
  const inputArchivo = useRef<HTMLInputElement>(null)
  const toast = useToastStore((state) => state.show)

  function seleccionarImagen(archivo: File | null) {
    setError(null)
    if (!archivo) return
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      setError('Formato no soportado. Usa JPG, PNG, WEBP o GIF.')
      return
    }
    if (archivo.size > MAX_IMAGEN_BYTES) {
      setError('La imagen no puede superar los 5 MB.')
      return
    }
    setImagen(archivo)
    setPreview(URL.createObjectURL(archivo))
  }

  function limpiarImagen() {
    setImagen(null)
    setPreview(null)
    if (inputArchivo.current) inputArchivo.current.value = ''
  }

  async function publicar() {
    setError(null)
    if (!imagen) {
      setError('Selecciona una imagen para la publicación.')
      return
    }
    if (!texto.trim()) {
      setError('Escribe una descripción para la publicación.')
      return
    }
    setPublicando(true)
    try {
      await publicarMarketing(texto.trim(), imagen)
      toast('Publicación enviada', 'success')
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setPublicando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-gray-900/40 backdrop-blur-[1px]"
      onClick={onClose}
      role="presentation"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketing-form-titulo"
        className="animate-panel-in flex h-full w-[560px] max-w-full flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
              Nueva publicación
            </p>
            <h3 id="marketing-form-titulo" className="mt-0.5 text-[17px] font-semibold text-gray-900">
              Registrar difusión
            </h3>
            <p className="mt-0.5 text-[13px] text-gray-500">
              La imagen y el texto se envían automáticamente al canal configurado.
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

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </p>
          )}

          {/* Imagen */}
          <section className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold text-gray-700">Imagen</p>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Vista previa" className="h-44 w-full object-cover" />
                  <div className="absolute right-2 top-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => inputArchivo.current?.click()}
                      className="cursor-pointer rounded-lg bg-black/60 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur hover:bg-black/75"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={limpiarImagen}
                      className="cursor-pointer rounded-lg bg-black/60 p-1.5 text-white backdrop-blur hover:bg-red-600"
                      aria-label="Quitar imagen"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputArchivo.current?.click()}
                  className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand shadow-sm ring-1 ring-gray-200">
                    <IconUpload />
                  </span>
                  <span className="text-sm font-medium text-gray-700">Subir imagen</span>
                  <span className="text-[11px] text-gray-400">JPG, PNG, WEBP o GIF · máximo 5 MB</span>
                </button>
              )}
            </div>
            <input
              ref={inputArchivo}
              type="file"
              accept={TIPOS_IMAGEN.join(',')}
              className="hidden"
              onChange={(e) => seleccionarImagen(e.target.files?.[0] ?? null)}
            />
          </section>

          {/* Descripción */}
          <section className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold text-gray-700">Descripción</p>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, MAX_TEXTO))}
              rows={4}
              placeholder="Escribe una breve descripción de la publicación..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
            <span className="self-end text-[11px] text-gray-400">
              {texto.length}/{MAX_TEXTO}
            </span>
            <p className="-mt-1 text-[11px] text-gray-400">
              La IA reescribe esta descripción como un post antes de publicarla.
            </p>
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void publicar()}
            disabled={publicando}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publicando ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <IconSend className="h-4 w-4" />
            )}
            {publicando ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </aside>
    </div>
  )
}
