import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { extractErrorMessage } from '@/api/http'
import ModalMarca from '@/components/ModalMarca'
import { IconStar, IconTrash, IconUpload, IconX } from '@/components/icons'
import { useToastStore } from '@/store/toastStore'
import type { Promocion, PromocionPayload, ServicioOpcion } from '../types'
import {
  actualizarPromocion,
  crearPromocion,
  urlImagenPromocion,
} from '../services/promocionesService'

interface Props {
  promocion: Promocion | null
  servicios: ServicioOpcion[]
  onClose: () => void
  onSaved: () => void
}

interface FormState {
  nombre: string
  descripcion: string
  servicioId: string
  descuento: string
  precioOriginal: string
  precioPromocional: string
  fechaInicio: string
  fechaFin: string
  destacada: boolean
  activa: boolean
}

const VACIO: FormState = {
  nombre: '',
  descripcion: '',
  servicioId: '',
  descuento: '10',
  precioOriginal: '',
  precioPromocional: '',
  fechaInicio: '',
  fechaFin: '',
  destacada: false,
  activa: true,
}

const MAX_IMAGEN_BYTES = 5 * 1024 * 1024
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const inputClase =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10'
const inputClaseError =
  'w-full rounded-lg border border-red-400 bg-red-50/40 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10'

export default function PromocionFormPanel({ promocion, servicios, onClose, onSaved }: Props) {
  const editando = promocion !== null
  const [form, setForm] = useState<FormState>(VACIO)
  const [imagen, setImagen] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [quitarImagen, setQuitarImagen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errores, setErrores] = useState<Partial<Record<keyof FormState, string>>>({})
  const [guardando, setGuardando] = useState(false)
  const inputArchivo = useRef<HTMLInputElement>(null)
  const toast = useToastStore((s) => s.show)

  useEffect(() => {
    if (!promocion) {
      setForm(VACIO)
      setImagen(null)
      setPreviewUrl(null)
      setQuitarImagen(false)
      setErrores({})
      setError(null)
      return
    }
    setForm({
      nombre: promocion.nombre,
      descripcion: promocion.descripcion ?? '',
      servicioId: promocion.servicioId != null ? String(promocion.servicioId) : '',
      descuento: String(promocion.descuentoPorcentaje),
      precioOriginal: promocion.precioOriginal != null ? String(promocion.precioOriginal) : '',
      precioPromocional: promocion.precioPromocional != null ? String(promocion.precioPromocional) : '',
      fechaInicio: promocion.fechaInicio ?? '',
      fechaFin: promocion.fechaFin ?? '',
      destacada: promocion.destacada,
      activa: promocion.activa,
    })
    setImagen(null)
    setPreviewUrl(null)
    setQuitarImagen(false)
    setErrores({})
    setError(null)
  }, [promocion])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const imagenExistente =
    editando && promocion?.tieneImagen && !quitarImagen
      ? urlImagenPromocion(promocion.id, promocion.fechaActualizacion)
      : null
  const preview = previewUrl ?? imagenExistente

  const precioSugerido = useMemo(() => {
    const original = Number(form.precioOriginal)
    const descuento = Number(form.descuento)
    if (!form.precioOriginal || Number.isNaN(original) || Number.isNaN(descuento)) return null
    return original * (1 - descuento / 100)
  }, [form.precioOriginal, form.descuento])

  function setCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => {
      if (!(campo in prev)) return prev
      const next = { ...prev }
      delete next[campo]
      return next
    })
  }

  function seleccionarImagen(file: File | null) {
    if (!file) return
    if (!TIPOS_IMAGEN.includes(file.type)) {
      setError('Formato no permitido. Usa una imagen JPG, PNG, WEBP o GIF.')
      return
    }
    if (file.size > MAX_IMAGEN_BYTES) {
      setError('La imagen no puede superar los 5 MB.')
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImagen(file)
    setPreviewUrl(URL.createObjectURL(file))
    setQuitarImagen(false)
    setError(null)
  }

  function limpiarImagen() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImagen(null)
    setPreviewUrl(null)
    setQuitarImagen(editando && Boolean(promocion?.tieneImagen))
    if (inputArchivo.current) inputArchivo.current.value = ''
  }

  function validar(): Partial<Record<keyof FormState, string>> {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    else if (form.nombre.trim().length > 120) e.nombre = 'Máximo 120 caracteres'

    const descuento = Number(form.descuento)
    if (form.descuento === '' || Number.isNaN(descuento)) e.descuento = 'Ingresa un descuento'
    else if (descuento <= 0 || descuento > 100) e.descuento = 'Debe estar entre 0.01 y 100'

    if (form.precioOriginal && Number(form.precioOriginal) < 0) {
      e.precioOriginal = 'No puede ser negativo'
    }
    if (form.precioPromocional && Number(form.precioPromocional) < 0) {
      e.precioPromocional = 'No puede ser negativo'
    }
    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) {
      e.fechaFin = 'Debe ser igual o posterior al inicio'
    }
    return e
  }

  async function guardar() {
    const problemas = validar()
    setErrores(problemas)
    if (Object.keys(problemas).length > 0) return

    const payload: PromocionPayload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      servicioId: form.servicioId ? Number(form.servicioId) : null,
      descuentoPorcentaje: Number(form.descuento),
      precioOriginal: form.precioOriginal ? Number(form.precioOriginal) : null,
      precioPromocional: form.precioPromocional ? Number(form.precioPromocional) : null,
      fechaInicio: form.fechaInicio || null,
      fechaFin: form.fechaFin || null,
      destacada: form.destacada,
      activa: form.activa,
      quitarImagen,
    }

    setGuardando(true)
    setError(null)
    try {
      if (editando && promocion) {
        await actualizarPromocion(promocion.id, payload, imagen)
        toast(`Promoción "${payload.nombre}" actualizada correctamente`, 'success')
      } else {
        await crearPromocion(payload, imagen)
        toast(`Promoción "${payload.nombre}" creada correctamente`, 'success')
      }
      onSaved()
    } catch (err) {
      const mensaje = extractErrorMessage(err)
      setError(mensaje)
      toast(`No se pudo guardar la promoción: ${mensaje}`, 'error')
    } finally {
      setGuardando(false)
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
        aria-labelledby="promocion-form-titulo"
        className="animate-panel-in flex h-full w-[560px] max-w-full flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
              {editando ? 'Editar promoción' : 'Nueva promoción'}
            </p>
            <h3 id="promocion-form-titulo" className="mt-0.5 text-[17px] font-semibold text-gray-900">
              {editando ? promocion?.nombre : 'Campaña de descuento'}
            </h3>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Se muestra como tarjeta en el módulo y puede generar notificaciones automáticas.
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
            <p className="text-[13px] font-semibold text-gray-700">Imagen de la promoción</p>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Vista previa de la promoción" className="h-44 w-full object-cover" />
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
            {imagen && (
              <p className="truncate text-[11px] text-gray-500">
                {imagen.name} · {(imagen.size / 1024).toFixed(0)} KB
              </p>
            )}
          </section>

          {/* Datos */}
          <section className="flex flex-col gap-4">
            <p className="text-[13px] font-semibold text-gray-700">Datos de la promoción</p>

            <Campo label="Nombre" obligatorio error={errores.nombre}>
              <input
                type="text"
                autoFocus
                maxLength={120}
                className={errores.nombre ? inputClaseError : inputClase}
                value={form.nombre}
                onChange={(e) => setCampo('nombre', e.target.value)}
                placeholder="Ej: Escapada a la playa -20%"
              />
            </Campo>

            <Campo label="Descripción">
              <textarea
                className={`${inputClase} min-h-[76px] resize-y`}
                maxLength={2000}
                value={form.descripcion}
                onChange={(e) => setCampo('descripcion', e.target.value)}
                placeholder="Detalle breve que verá el usuario en la tarjeta..."
              />
            </Campo>

            <Campo label="Servicio del catálogo">
              <select
                className={inputClase}
                value={form.servicioId}
                onChange={(e) => setCampo('servicioId', e.target.value)}
              >
                <option value="">Promoción general (todos los servicios)</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                    {s.categoria ? ` · ${s.categoria}` : ''}
                  </option>
                ))}
              </select>
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Descuento (%)" obligatorio error={errores.descuento}>
                <input
                  type="number"
                  min={0.01}
                  max={100}
                  step={0.01}
                  className={errores.descuento ? inputClaseError : inputClase}
                  value={form.descuento}
                  onChange={(e) => setCampo('descuento', e.target.value)}
                />
              </Campo>

              <Campo label="Precio original">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className={errores.precioOriginal ? inputClaseError : inputClase}
                  value={form.precioOriginal}
                  onChange={(e) => setCampo('precioOriginal', e.target.value)}
                  placeholder="0.00"
                />
              </Campo>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Precio promocional" error={errores.precioPromocional}>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className={errores.precioPromocional ? inputClaseError : inputClase}
                  value={form.precioPromocional}
                  onChange={(e) => setCampo('precioPromocional', e.target.value)}
                  placeholder={precioSugerido != null ? precioSugerido.toFixed(2) : '0.00'}
                />
              </Campo>

              <div className="flex flex-col justify-end rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-[11px] uppercase tracking-wide text-gray-400">Cálculo sugerido</span>
                <span className="text-sm font-semibold text-gray-800">
                  {precioSugerido != null ? precioSugerido.toFixed(2) : '—'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Vigente desde">
                <input
                  type="date"
                  className={inputClase}
                  value={form.fechaInicio}
                  onChange={(e) => setCampo('fechaInicio', e.target.value)}
                />
              </Campo>
              <Campo label="Vigente hasta" error={errores.fechaFin}>
                <input
                  type="date"
                  className={errores.fechaFin ? inputClaseError : inputClase}
                  value={form.fechaFin}
                  onChange={(e) => setCampo('fechaFin', e.target.value)}
                />
              </Campo>
            </div>
            <p className="-mt-2 text-[11px] text-gray-400">
              Si dejas las fechas vacías, la promoción se considera vigente sin límite.
            </p>
          </section>

          {/* Visibilidad */}
          <section className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold text-gray-700">Visibilidad</p>
            <Toggle
              etiqueta="Promoción destacada"
              descripcion="Aparece primero y con estrella en el listado"
              icono={<IconStar className="h-4 w-4" />}
              activo={form.destacada}
              onChange={(v) => setCampo('destacada', v)}
            />
            <Toggle
              etiqueta="Promoción activa"
              descripcion="Al activarla se notifica a todos los usuarios activos"
              icono={<span className="text-[13px]">%</span>}
              activo={form.activa}
              onChange={(v) => setCampo('activa', v)}
            />
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
            onClick={() => void guardar()}
            disabled={guardando}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear promoción'}
          </button>
        </div>
      </aside>
    </div>
  )
}

function Campo({
  label,
  obligatorio,
  error,
  children,
}: {
  label: string
  obligatorio?: boolean
  error?: string
  children: ReactNode
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
  icono,
  activo,
  onChange,
}: {
  etiqueta: string
  descripcion: string
  icono: ReactNode
  activo: boolean
  onChange: (valor: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand shadow-sm ring-1 ring-gray-200">
          {icono}
        </span>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-gray-700">{etiqueta}</span>
          <span className="text-[11px] text-gray-400">{descripcion}</span>
        </div>
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
