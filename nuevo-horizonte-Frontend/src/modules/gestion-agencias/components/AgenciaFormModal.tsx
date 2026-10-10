import { useEffect, useRef, useState } from 'react'

import type { Agencia, AgenciaFormState, AgenciaPayload } from '../types'
import { actualizarAgencia, crearAgencia, logoAgenciaUrl, subirLogoAgencia } from '../services/agenciaService'
import { extractErrorMessage } from '@/api/http'
import { IconUpload, IconX } from '@/components/icons'
import ModalMarca from '@/components/ModalMarca'
import { useToastStore } from '@/store/toastStore'
import { useFormDraft } from '@/hooks/useFormDraft'
import { esSoloTexto, soloDigitos, soloTexto } from '@/utils/validacion'

const CATEGORIAS_SUGERIDAS = ['Premium', 'Estándar', 'Selectiva', 'Corporativa']

interface Props {
  agencia: Agencia | null
  registradasEsteMes: number
  onClose: () => void
  onSaved: () => void
}

const VACIO: AgenciaFormState = {
  razonSocial: '',
  nombreComercial: '',
  ruc: '',
  categoria: 'Estándar',
  contactoNombre: '',
  contactoTelefono: '',
  contactoEmail: '',
  ciudad: '',
  ejecutivoAsignado: '',
  esPrioritaria: false,
  activo: true,
}

export default function AgenciaFormModal({ agencia, registradasEsteMes, onClose, onSaved }: Props) {
  const editando = agencia !== null
  const [formEdicion, setFormEdicion] = useState<AgenciaFormState>(VACIO)
  const [logoNombre, setLogoNombre] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [errores, setErrores] = useState<Partial<Record<keyof AgenciaFormState, string>>>({})
  const inputLogo = useRef<HTMLInputElement>(null)

  // El alta conserva borrador entre cierres; la edicion parte del registro real.
  const borrador = useFormDraft<AgenciaFormState>('agencia:nueva', VACIO)
  const form = editando ? formEdicion : borrador.valor

  const toast = useToastStore((s) => s.show)

  useEffect(() => {
    if (agencia) {
      setFormEdicion({
        razonSocial: agencia.razonSocial,
        nombreComercial: agencia.nombreComercial ?? '',
        ruc: agencia.ruc,
        categoria: agencia.categoria ?? 'Estándar',
        contactoNombre: agencia.contactoNombre ?? '',
        contactoTelefono: agencia.contactoTelefono ?? '',
        contactoEmail: agencia.contactoEmail ?? '',
        ciudad: agencia.ciudad ?? '',
        ejecutivoAsignado: agencia.ejecutivoAsignado ?? '',
        esPrioritaria: agencia.esPrioritaria,
        activo: agencia.activo,
      })
      setLogoNombre(agencia.logoUrl)
    }
    setPreview(null)
    setError(null)
  }, [agencia])

  function limpiarFormulario() {
    setFormEdicion(VACIO)
    setLogoNombre(null)
    setPreview(null)
    setArchivoPendiente(null)
    borrador.reset()
    setErrores({})
  }

  function setCampo<K extends keyof AgenciaFormState>(campo: K, valor: AgenciaFormState[K]) {
    if (editando) setFormEdicion((prev) => ({ ...prev, [campo]: valor }))
    else borrador.setCampo(campo, valor)
    setErrores((prev) => {
      if (!(campo in prev)) return prev
      const next = { ...prev }
      delete next[campo]
      return next
    })
  }

  async function manejarArchivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen')
      return
    }
    if (archivo.size > 2 * 1024 * 1024) {
      setError('El logo no debe superar los 2 MB')
      return
    }

    setPreview(URL.createObjectURL(archivo))
    setArchivoPendiente(archivo)
    setError(null)

    if (editando && agencia) {
      setSubiendo(true)
      try {
        const { logoUrl } = await subirLogoAgencia(agencia.id, archivo)
        setLogoNombre(logoUrl)
        setArchivoPendiente(null)
      } catch (err) {
        setError(extractErrorMessage(err))
      } finally {
        setSubiendo(false)
      }
    }
  }

  function quitarPreview() {
    setPreview(null)
    setArchivoPendiente(null)
    if (inputLogo.current) inputLogo.current.value = ''
  }

  function validar(): Partial<Record<keyof AgenciaFormState, string>> {
    const e: Partial<Record<keyof AgenciaFormState, string>> = {}
    if (!form.razonSocial.trim()) e.razonSocial = 'La razón social es obligatoria'
    else if (!esSoloTexto(form.razonSocial.trim())) e.razonSocial = 'La razón social solo debe contener letras'
    if (!/^\d{11}$/.test(form.ruc.trim())) e.ruc = 'El RUC debe tener 11 dígitos'
    if (form.nombreComercial.trim() && !esSoloTexto(form.nombreComercial.trim())) {
      e.nombreComercial = 'El nombre comercial no debe contener números'
    }
    if (form.contactoTelefono.trim() && !/^\d{9}$/.test(form.contactoTelefono.trim())) {
      e.contactoTelefono = 'El teléfono debe tener 9 dígitos'
    }
    if (form.contactoEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactoEmail.trim())) {
      e.contactoEmail = 'El email de contacto no es válido'
    }
    return e
  }

  async function guardar() {
    const problemas = validar()
    setErrores(problemas)
    if (Object.keys(problemas).length > 0) return

    setGuardando(true)
    setError(null)
    try {
      const payload: AgenciaPayload = {
        ...form,
        razonSocial: form.razonSocial.trim(),
        ruc: form.ruc.trim(),
        nombreComercial: form.nombreComercial.trim() || null,
        categoria: form.categoria || null,
        contactoNombre: form.contactoNombre.trim() || null,
        contactoTelefono: form.contactoTelefono.trim() || null,
        contactoEmail: form.contactoEmail.trim() || null,
        ciudad: form.ciudad.trim() || null,
        ejecutivoAsignado: form.ejecutivoAsignado.trim() || null,
      }

      if (editando && agencia) {
        await actualizarAgencia(agencia.id, payload)
        limpiarFormulario()
        toast(`Agencia "${payload.nombreComercial || payload.razonSocial}" actualizada correctamente`, 'success')
      } else {
        const creada = await crearAgencia(payload)
        // en alta la agencia todavia no tiene id, por eso el logo se sube despues
        if (archivoPendiente) {
          await subirLogoAgencia(creada.id, archivoPendiente)
        }
        limpiarFormulario()
        toast(`Agencia "${payload.nombreComercial || payload.razonSocial}" creada correctamente`, 'success')
      }
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err))
      toast('No se pudo guardar la agencia', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const logoVisible = preview ?? logoAgenciaUrl(logoNombre)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={onClose}>
      <aside
        className="flex h-full w-[480px] max-w-full flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {editando ? 'Editar agencia' : 'Nueva agencia'}
            </h3>
            <p className="text-xs text-gray-500">Registradas este mes: {registradasEsteMes}</p>
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

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-gray-600">Logo de la agencia</span>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                {logoVisible ? (
                  <img src={logoVisible} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <span className="px-2 text-center text-[10px] uppercase tracking-wide text-gray-400">
                    Sin logo
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={inputLogo}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={manejarArchivo}
                />
                <button
                  type="button"
                  onClick={() => inputLogo.current?.click()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50"
                >
                  <IconUpload />
                  {logoVisible ? 'Cambiar logo' : 'Subir logo'}
                </button>
                {logoVisible && (
                  <button
                    type="button"
                    onClick={quitarPreview}
                    className="cursor-pointer text-left text-xs text-gray-400 hover:text-gray-600"
                  >
                    Quitar selección
                  </button>
                )}
                <p className="text-[11px] text-gray-400">PNG, JPG, WEBP o GIF. Máximo 2 MB.</p>
                {subiendo && <p className="text-[11px] text-gray-500">Subiendo logo...</p>}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Campo label="Razón social" obligatorio error={errores.razonSocial}>
              <input
                type="text"
                maxLength={200}
                className={errores.razonSocial ? inputClaseError : inputClase}
                value={form.razonSocial}
                onChange={(e) => setCampo('razonSocial', soloTexto(e.target.value))}
                placeholder="Viajes Horizonte SAC"
              />
            </Campo>

            <Campo label="Nombre comercial" error={errores.nombreComercial}>
              <input
                type="text"
                maxLength={200}
                className={errores.nombreComercial ? inputClaseError : inputClase}
                value={form.nombreComercial}
                onChange={(e) => setCampo('nombreComercial', soloTexto(e.target.value))}
                placeholder="Agencia Norte"
              />
            </Campo>

            <Campo label="RUC" obligatorio error={errores.ruc}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                className={errores.ruc ? inputClaseError : inputClase}
                value={form.ruc}
                onChange={(e) => setCampo('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="20123456789"
              />
            </Campo>

            <Campo label="Categoría">
              <select
                className={inputClase}
                value={CATEGORIAS_SUGERIDAS.includes(form.categoria) ? form.categoria : '__otra__'}
                onChange={(e) => {
                  const valor = e.target.value
                  setCampo('categoria', valor === '__otra__' ? '' : valor)
                }}
              >
                <option value="">Sin categoría</option>
                {CATEGORIAS_SUGERIDAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__otra__">Otra...</option>
              </select>
              {!CATEGORIAS_SUGERIDAS.includes(form.categoria) && form.categoria !== '' && (
                <p className="text-xs text-gray-400">Categoría personalizada: {form.categoria}</p>
              )}
            </Campo>

            <Campo label="Ciudad">
              <input
                type="text"
                maxLength={100}
                className={inputClase}
                value={form.ciudad}
                onChange={(e) => setCampo('ciudad', soloTexto(e.target.value))}
                placeholder="Cusco"
              />
            </Campo>

            <Campo label="Ejecutivo asignado">
              <input
                type="text"
                maxLength={150}
                className={inputClase}
                value={form.ejecutivoAsignado}
                onChange={(e) => setCampo('ejecutivoAsignado', soloTexto(e.target.value))}
                placeholder="María López"
              />
            </Campo>

            <div className="my-1 border-t border-gray-100" />

            <Campo label="Nombre de contacto">
              <input
                type="text"
                maxLength={100}
                className={inputClase}
                value={form.contactoNombre}
                onChange={(e) => setCampo('contactoNombre', soloTexto(e.target.value))}
                placeholder="María Gonzáles"
              />
            </Campo>

            <Campo label="Teléfono de contacto" error={errores.contactoTelefono}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={9}
                className={errores.contactoTelefono ? inputClaseError : inputClase}
                value={form.contactoTelefono}
                onChange={(e) => setCampo('contactoTelefono', soloDigitos(e.target.value, 9))}
                placeholder="999 999 999"
              />
            </Campo>

            <Campo label="Email de contacto" error={errores.contactoEmail}>
              <input
                type="email"
                maxLength={100}
                className={errores.contactoEmail ? inputClaseError : inputClase}
                value={form.contactoEmail}
                onChange={(e) => setCampo('contactoEmail', e.target.value)}
                placeholder="contacto@agencia.com"
              />
            </Campo>

            <div className="mt-2 flex flex-col gap-3">
              <Toggle
                etiqueta="Marcar como agencia prioritaria"
                descripcion="Da trato preferencial en cotizaciones y ventas"
                activo={form.esPrioritaria}
                onChange={(v) => setCampo('esPrioritaria', v)}
              />
              <Toggle
                etiqueta="Agencia activa"
                descripcion="Habilita su operatividad en el sistema"
                activo={form.activo}
                onChange={(v) => setCampo('activo', v)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-5 py-4">
          {!editando && (
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
              className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={guardando || subiendo}
              className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? 'Guardando...' : 'Guardar agencia'}
            </button>
          </div>
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
