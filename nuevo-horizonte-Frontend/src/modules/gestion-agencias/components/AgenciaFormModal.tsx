import { useEffect, useRef, useState } from 'react'

import type { Agencia, AgenciaFormState, AgenciaPayload } from '../types'
import { actualizarAgencia, crearAgencia, logoAgenciaUrl, subirLogoAgencia } from '../services/agenciaService'
import { extractErrorMessage } from '@/api/http'
import { IconUpload, IconX } from '@/components/icons'

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
  const [form, setForm] = useState<AgenciaFormState>(VACIO)
  const [logoNombre, setLogoNombre] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const inputLogo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (agencia) {
      setForm({
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
    } else {
      setForm(VACIO)
      setLogoNombre(null)
    }
    setPreview(null)
    setError(null)
  }, [agencia])

  function setCampo<K extends keyof AgenciaFormState>(campo: K, valor: AgenciaFormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
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

  function validar(): string | null {
    if (!form.razonSocial.trim()) return 'La razón social es obligatoria'
    if (!/^\d{11}$/.test(form.ruc.trim())) return 'El RUC debe tener 11 dígitos'
    if (form.contactoEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactoEmail.trim())) {
      return 'El email de contacto no es válido'
    }
    return null
  }

  async function guardar() {
    const problema = validar()
    if (problema) {
      setError(problema)
      return
    }

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
      } else {
        const creada = await crearAgencia(payload)
        // en alta la agencia todavia no tiene id, por eso el logo se sube despues
        if (archivoPendiente) {
          await subirLogoAgencia(creada.id, archivoPendiente)
        }
      }
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err))
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
            <Campo label="Razón social" obligatorio>
              <input
                type="text"
                className={inputClase}
                value={form.razonSocial}
                onChange={(e) => setCampo('razonSocial', e.target.value)}
                placeholder="Viajes Horizonte SAC"
              />
            </Campo>

            <Campo label="Nombre comercial">
              <input
                type="text"
                className={inputClase}
                value={form.nombreComercial}
                onChange={(e) => setCampo('nombreComercial', e.target.value)}
                placeholder="Agencia Norte"
              />
            </Campo>

            <Campo label="RUC" obligatorio>
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                className={inputClase}
                value={form.ruc}
                onChange={(e) => setCampo('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="20123456789"
              />
            </Campo>

            <Campo label="Categoría">
              <div className="flex flex-col gap-2">
                <select
                  className={inputClase}
                  value={form.categoria}
                  onChange={(e) => setCampo('categoria', e.target.value)}
                >
                  <option value="">Sin categoría</option>
                  {CATEGORIAS_SUGERIDAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className={inputClase}
                  value={form.categoria}
                  onChange={(e) => setCampo('categoria', e.target.value)}
                  placeholder="O escribe otra categoría"
                />
              </div>
            </Campo>

            <Campo label="Ciudad">
              <input
                type="text"
                className={inputClase}
                value={form.ciudad}
                onChange={(e) => setCampo('ciudad', e.target.value)}
                placeholder="Cusco"
              />
            </Campo>

            <Campo label="Ejecutivo asignado">
              <input
                type="text"
                className={inputClase}
                value={form.ejecutivoAsignado}
                onChange={(e) => setCampo('ejecutivoAsignado', e.target.value)}
                placeholder="María López"
              />
            </Campo>

            <div className="my-1 border-t border-gray-100" />

            <Campo label="Nombre de contacto">
              <input
                type="text"
                className={inputClase}
                value={form.contactoNombre}
                onChange={(e) => setCampo('contactoNombre', e.target.value)}
                placeholder="María Gonzáles"
              />
            </Campo>

            <Campo label="Teléfono de contacto">
              <input
                type="text"
                className={inputClase}
                value={form.contactoTelefono}
                onChange={(e) => setCampo('contactoTelefono', e.target.value)}
                placeholder="999 999 999"
              />
            </Campo>

            <Campo label="Email de contacto">
              <input
                type="email"
                className={inputClase}
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
            disabled={guardando || subiendo}
            className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar agencia'}
          </button>
        </div>
      </aside>
    </div>
  )
}

const inputClase =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand'

function Campo({
  label,
  obligatorio,
  children,
}: {
  label: string
  obligatorio?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-gray-600">
        {label}
        {obligatorio && <span className="text-red-500"> *</span>}
      </span>
      {children}
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
