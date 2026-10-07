import { useEffect, useState } from 'react'

import type { Destino, Proveedor, ProveedorFormState, ProveedorPayload } from '../types'
import { actualizarProveedor, crearProveedor } from '../services/proveedorService'
import { extractErrorMessage } from '@/api/http'
import { useFormDraft } from '@/hooks/useFormDraft'
import { IconX } from '@/components/icons'

interface Props {
  proveedor: Proveedor | null
  tiposServicio: string[]
  condicionesComerciales: string[]
  destinos: Destino[]
  onClose: () => void
  onSaved: () => void
}

const VACIO: ProveedorFormState = {
  razonSocial: '',
  nombreComercial: '',
  ruc: '',
  tipoProveedor: '',
  contactoNombre: '',
  contactoTelefono: '',
  contactoEmail: '',
  destinoId: '',
  condicionesComerciales: '',
  observaciones: '',
  activo: true,
}

export default function ProveedorFormModal({
  proveedor,
  tiposServicio,
  condicionesComerciales,
  destinos,
  onClose,
  onSaved,
}: Props) {
  const editando = proveedor !== null
  const [formEdicion, setFormEdicion] = useState<ProveedorFormState>(VACIO)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  // El alta conserva borrador entre cierres; la edicion parte del registro real.
  const borrador = useFormDraft<ProveedorFormState>('proveedor:nueva', VACIO)
  const form = editando ? formEdicion : borrador.valor

  useEffect(() => {
    if (proveedor) {
      setFormEdicion({
        razonSocial: proveedor.razonSocial,
        nombreComercial: proveedor.nombreComercial ?? '',
        ruc: proveedor.ruc,
        tipoProveedor: proveedor.tipoProveedor ?? '',
        contactoNombre: proveedor.contactoNombre ?? '',
        contactoTelefono: proveedor.contactoTelefono ?? '',
        contactoEmail: proveedor.contactoEmail ?? '',
        destinoId: proveedor.destinoId ? String(proveedor.destinoId) : '',
        condicionesComerciales: proveedor.condicionesComerciales ?? '',
        observaciones: proveedor.observaciones ?? '',
        activo: proveedor.activo,
      })
    }
    setError(null)
  }, [proveedor])

  function limpiarFormulario() {
    setFormEdicion(VACIO)
    borrador.reset()
  }

  function setCampo<K extends keyof ProveedorFormState>(campo: K, valor: ProveedorFormState[K]) {
    if (editando) setFormEdicion((prev) => ({ ...prev, [campo]: valor }))
    else borrador.setCampo(campo, valor)
  }

  function validar(): string | null {
    if (!form.razonSocial.trim()) return 'La razón social es obligatoria'
    if (!/^\d{11}$/.test(form.ruc.trim())) return 'El RUC debe tener 11 dígitos'
    if (!form.tipoProveedor) return 'Selecciona el tipo de servicio'
    if (form.contactoEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactoEmail.trim())) {
      return 'El correo de contacto no es válido'
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
      const payload: ProveedorPayload = {
        razonSocial: form.razonSocial.trim(),
        nombreComercial: form.nombreComercial.trim() || null,
        ruc: form.ruc.trim(),
        tipoProveedor: form.tipoProveedor,
        contactoNombre: form.contactoNombre.trim() || null,
        contactoTelefono: form.contactoTelefono.trim() || null,
        contactoEmail: form.contactoEmail.trim() || null,
        destinoId: form.destinoId ? Number(form.destinoId) : null,
        condicionesComerciales: form.condicionesComerciales || null,
        observaciones: form.observaciones.trim() || null,
        activo: form.activo,
      }

      if (editando && proveedor) {
        await actualizarProveedor(proveedor.id, payload)
        limpiarFormulario()
      } else {
        await crearProveedor(payload)
        limpiarFormulario()
      }
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={onClose}>
      <aside
        className="flex h-full w-[480px] max-w-full flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            {editando ? 'Editar proveedor' : 'Nuevo proveedor'}
          </h3>
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
            <Campo label="Razón social" obligatorio>
              <input
                type="text"
                className={inputClase}
                value={form.razonSocial}
                onChange={(e) => setCampo('razonSocial', e.target.value)}
                placeholder="Ej: Transportes Andinos SAC"
              />
            </Campo>

            <Campo label="Nombre comercial">
              <input
                type="text"
                className={inputClase}
                value={form.nombreComercial}
                onChange={(e) => setCampo('nombreComercial', e.target.value)}
                placeholder="Ej: Transportes Andinos"
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
                placeholder="Ej: 20123456789"
              />
            </Campo>

            <Campo label="Tipo de servicio" obligatorio>
              <select
                className={inputClase}
                value={form.tipoProveedor}
                onChange={(e) => setCampo('tipoProveedor', e.target.value)}
              >
                <option value="">Seleccionar tipo</option>
                {tiposServicio.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Persona de contacto">
              <input
                type="text"
                className={inputClase}
                value={form.contactoNombre}
                onChange={(e) => setCampo('contactoNombre', e.target.value)}
                placeholder="Nombre completo"
              />
            </Campo>

            <Campo label="Teléfono">
              <input
                type="text"
                className={inputClase}
                value={form.contactoTelefono}
                onChange={(e) => setCampo('contactoTelefono', e.target.value)}
                placeholder="Ej: 987 654 321"
              />
            </Campo>

            <Campo label="Correo">
              <input
                type="email"
                className={inputClase}
                value={form.contactoEmail}
                onChange={(e) => setCampo('contactoEmail', e.target.value)}
                placeholder="Ej: contacto@empresa.com"
              />
            </Campo>

            <Campo label="Destino">
              <select
                className={inputClase}
                value={form.destinoId}
                onChange={(e) => setCampo('destinoId', e.target.value)}
              >
                <option value="">Seleccionar destino</option>
                {destinos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} ({d.pais})
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Condiciones comerciales">
              <select
                className={inputClase}
                value={form.condicionesComerciales}
                onChange={(e) => setCampo('condicionesComerciales', e.target.value)}
              >
                <option value="">Seleccionar condiciones</option>
                {condicionesComerciales.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Observaciones">
              <textarea
                className={`${inputClase} min-h-[80px] resize-y`}
                value={form.observaciones}
                onChange={(e) => setCampo('observaciones', e.target.value)}
                placeholder="Información adicional..."
              />
            </Campo>

            {editando && (
              <Toggle
                etiqueta="Proveedor activo"
                descripcion="Habilita su operatividad en el sistema"
                activo={form.activo}
                onChange={(v) => setCampo('activo', v)}
              />
            )}
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
              disabled={guardando}
              className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? 'Guardando...' : 'Guardar Proveedor'}
            </button>
          </div>
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
