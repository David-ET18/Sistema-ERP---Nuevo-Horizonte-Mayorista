import { useRef, useState } from 'react'

import { extractErrorMessage } from '@/api/http'
import { IconSend, IconTrash, IconUpload } from '@/components/icons'
import { useToastStore } from '@/store/toastStore'
import { publicarMarketing } from '../services/marketingService'

const MAX_IMAGEN_BYTES = 5 * 1024 * 1024
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_TEXTO = 500

export default function MarketingPage() {
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

  function limpiarFormulario() {
    setTexto('')
    limpiarImagen()
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
      limpiarFormulario()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setPublicando(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Difusión y Marketing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Publica una imagen con una breve descripción y se enviará automáticamente.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
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
        <section className="mt-5 flex flex-col gap-2">
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
        </section>

        <button
          type="button"
          onClick={() => void publicar()}
          disabled={publicando}
          className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconSend className="h-4 w-4" />
          {publicando ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </section>
  )
}
