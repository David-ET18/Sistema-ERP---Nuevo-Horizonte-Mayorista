import { useEffect, useRef, useState } from 'react'

import type { Promocion, PromocionFormState, PromocionPayload, ServicioOpcion } from '../types'
import {
  actualizarPromocion,
  crearPromocion,
  promocionImagenUrl,
} from '../services/promocionService'
import { extractErrorMessage } from '@/api/http'
import { useToastStore } from '@/store/toastStore'
import { IconTrash, IconUpload, IconX } from '@/components/icons'
import ModalMarca from '@/components/ModalMarca'

interface Props {
  promocion: Promocion | null
  servicios: ServicioOpcion[]
  onClose: () => void
  onSaved: () => void
}

const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024

function estadoInicial(promocion: Promocion | null): PromocionFormState {
  return {
    titulo: promocion?.titulo ?? '',
    descripcion: promocion?.descripcion ?? '',
    descuento: promocion ? String(promocion.descuento) : '',
    fechaInicio: promocion?.fechaInicio ?? '',
    fechaFin: promocion?.fechaFin ?? '',
    activo: promocion?.activo ?? true,
    destacada: promocion?.destacada ?? false,
    servicioId: promocion?.servicioId ? String(promocion.servicioId) : '',
    quitarImagen: false,
    imagen: null,
  }
}

export default function PromocionFormModal({ promocion, servicios, onClose, onSaved }: Props) {
  const editando = promocion !== null
  const [form, setForm] = useState<PromocionFormState>(() => estadoInicial(promocion))
  const [preview, setPreview] = useState<string | null>(
    promocion?.imagenUrl ? promocionImagenUrl(promocion.imagenUrl) : null,
  )
  const [error, setError] = useState<string | null>(null)
  const [errores, setErrores] = useState<Partial<Record<keyof PromocionFormState, string>>>({})
  const [guardando, setGuardando] = useState(false)
  const inputImagen = useRef<HTMLInputElement>(null)
  const toast = useToastStore((s) => s.show)

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function setCampo<K extends keyof PromocionFormState>(campo: K, valor: PromocionFormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => {
      if (!(campo in prev)) return prev
      const next = { ...prev }
      delete next[campo]
      return next
    })
  }

  function seleccionarImagen(archivo: File | null) {
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen')
      return
    }
    if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
      setError('La imagen no debe superar los 5 MB')
      return
    }
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(archivo))
    setForm((prev) => ({ ...prev, imagen: archivo, quitarImagen: false }))
    setError(null)
  }

  function quitarImagen() {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(null)
    setForm((prev) => ({ ...prev, imagen: null, quitarImagen: true }))
    if (inputImagen.current) inputImagen.current.value = ''
  }

  function validar(): Partial<Record<keyof PromocionFormState, string>> {
    const e: Partial<Record<keyof PromocionFormState, string>> = {}
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio'
    else if (form.titulo.trim().length > 120) e.titulo = 'Máximo 120 caracteres'

    const descuento = Number(form.descuento)
    if (!form.descuento.trim() || Number.isNaN(descuento) || descuento <= 0 || descuento > 100) {
      e.descuento = 'Ingresa un descuento entre 1 y 100'
    }

    if (!form.fechaInicio) e.fechaInicio = 'La fecha de inicio es obligatoria'
    if (!form.fechaFin) e.fechaFin = 'La fecha de fin es obligatoria'
    else if (form.fechaInicio && form.fechaFin < form.fechaInicio) {
      e.fechaFin = 'La fecha de fin no puede ser anterior al inicio'
    }
    if (form.descripcion.length > 1000) e.descripcion = 'Máximo 1000 caracteres'
    return e
  }

  async function guardar() {
    const problemas = validar()
    setErrores(problemas)
    if (Object.keys(problemas).length > 0) return

    setGuardando(true)
    setError(null)
    try {
      const payload: PromocionPayload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        descuento: Number(form.descuento),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        activo: form.activo,
        destacada: form.destacada,
        servicioId: form.servicioId ? Number(form.servicioId) : null,
        quitarImagen: form.quitarImagen,
        imagen: form.imagen,
      }

      if (editando && promocion) {
        await actualizarPromocion(promocion.id, payload)
        toast(`Promoción "${payload.titulo}" actualizada correctamente`, 'success')
      } else {
        await crearPromocion(payload)
        toast(`Promoción "${payload.titulo}" creada correctamente`, 'success')
      }
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err))
      toast('No se pudo guardar la promoción', 'error')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={onClose}>
      <aside
        className="flex h-full w-[540px] max-w-full flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {editando ? 'Editar promoción' : 'Nueva promoción'}
            </h3>
            <p className="text-xs text-gray-400">
              {editando ? 'Actualiza la oferta y su imagen' : 'Crea una tarjeta visible para el equipo'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <IconX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-4">
            <Campo label="Título" obligatorio error={errores.titulo}>
              <input
                type="text"
                className={errores.titulo ? inputClaseError : inputClase}
                value={form.titulo}
                onChange={(e) => setCampo('titulo', e.target.value)}
                placeholder="Ej: Escapada de verano a la playa"
                maxLength={120}
              />
            </Campo>

            <Campo label="Descripción" error={errores.descripcion}>
              <textarea
                className={`${errores.descripcion ? inputClaseError : inputClase} min-h-[84px] resize-y`}
                value={form.descripcion}
                onChange={(e) => setCampo('descripcion', e.target.value)}
                placeholder="Detalla qué incluye o a quién aplica la promoción..."
                maxLength={1000}
              />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Descuento (%)" obligatorio error={errores.descuento}>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step="0.01"
                    className={`${errores.descuento ? inputClaseError : inputClase} pr-9`}
                    value={form.descuento}
                    onChange={(e) => setCampo('descuento', e.target.value)}
                    placeholder="20"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    %
                  </span>
                </div>
              </Campo>

              <Campo label="Servicio / producto">
                <select
                  className={inputClase}
                  value={form.servicioId}
                  onChange={(e) => setCampo('servicioId', e.target.value)}
                >
                  <option value="">General (sin servicio)</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Vigente desde" obligatorio error={errores.fechaInicio}>
                <input
                  type="date"
                  className={errores.fechaInicio ? inputClaseError : inputClase}
                  value={form.fechaInicio}
                  onChange={(e) => setCampo('fechaInicio', e.target.value)}
                />
              </Campo>
              <Campo label="Vigente hasta" obligatorio error={errores.fechaFin}>
                <input
                  type="date"
                  className={errores.fechaFin ? inputClaseError : inputClase}
                  value={form.fechaFin}
                  onChange={(e) => setCampo('fechaFin', e.target.value)}
                />
              </Campo>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-gray-600">Imagen de la promoción</span>
              <div className="relative overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                {preview ? (
                  <img src={preview} alt="Vista previa de la promoción" className="h-44 w-full object-cover" />
                ) : (
                  <button
                    type="button"
                    onClick={() => inputImagen.current?.click()}
                    className="flex h-44 w-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                      <IconUpload className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium">Subir imagen</span>
                    <span className="text-[11px]">JPG, PNG, WEBP o GIF · máximo 5 MB</span>
                  </button>
                )}

                {preview && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <button
                      type="button"
                      onClick={() => inputImagen.current?.click()}
                      className="cursor-pointer rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white"
                    >
                      Cambiar imagen
                    </button>
                    <button
                      type="button"
                      onClick={quitarImagen}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                      Quitar
                    </button>
                  </div>
                )}
              </div>
              <input
                ref={inputImagen}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  seleccionarImagen(e.target.files?.[0] ?? null)
                  e.target.value = ''
                }}
              />
              <p className="text-[11px] text-gray-400">
                La imagen se guarda dentro de la base de datos y se sirve desde el módulo.
              </p>
            </div>

            <Toggle
              etiqueta="Promoción activa"
              descripcion="Visible y aplicable mientras esté vigente"
              activo={form.activo}
              onChange={(valor) => setCampo('activo', valor)}
            />
            <Toggle
              etiqueta="Destacar promoción"
              descripcion="Aparece primero en el listado de tarjetas"
              activo={form.destacada}
              onChange={(valor) => setCampo('destacada', valor)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void guardar()}
            disabled={guardando}
            className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear promoción'}
          </button>
        </div>
      </aside>
    </div>
  )
}

const inputClase =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand'

const inputClaseError =
  'w-full rounded-lg border border-red-400 bg-red-50/40 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300'

function Campo({
  label,
  obligatorio,
  error,
  children,
}: {
  label: string
  obligatorio?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-gray-600">
        {label}
        {obligatorio && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
}

function Toggle({
  etiqueta,
  descripcion,
  activo,
  onChange,
}: {
  etiqueta: string
  descripcion: string
  activo: boolean
  onChange: (valor: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-gray-700">{etiqueta}</span>
        <span className="text-[11px] text-gray-400">{descripcion}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        onClick={() => onChange(!activo)}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
          activo ? 'bg-brand' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            activo ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}
