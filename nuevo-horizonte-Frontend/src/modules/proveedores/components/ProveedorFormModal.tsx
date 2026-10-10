import { useEffect, useState } from 'react'

import type { Destino, Proveedor, ProveedorFormState, ProveedorPayload } from '../types'
import { actualizarProveedor, crearProveedor } from '../services/proveedorService'
import { extractErrorMessage } from '@/api/http'
import { useFormDraft } from '@/hooks/useFormDraft'
import { IconX } from '@/components/icons'
import ModalMarca from '@/components/ModalMarca'
import { useToastStore } from '@/store/toastStore'
import { esSoloTexto, soloDigitos, soloTexto } from '@/utils/validacion'

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
  const [errores, setErrores] = useState<Partial<Record<keyof ProveedorFormState, string>>>({})

  // El alta conserva borrador entre cierres; la edicion parte del registro real.
  const borrador = useFormDraft<ProveedorFormState>('proveedor:nueva', VACIO)
  const form = editando ? formEdicion : borrador.valor
  const toast = useToastStore((s) => s.show)

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
    setErrores({})
  }

  function setCampo<K extends keyof ProveedorFormState>(campo: K, valor: ProveedorFormState[K]) {
    if (editando) setFormEdicion((prev) => ({ ...prev, [campo]: valor }))
    else borrador.setCampo(campo, valor)
    setErrores((prev) => {
      if (!(campo in prev)) return prev
      const next = { ...prev }
      delete next[campo]
      return next
    })
  }

  function validar(): Partial<Record<keyof ProveedorFormState, string>> {
    const e: Partial<Record<keyof ProveedorFormState, string>> = {}
    if (!form.razonSocial.trim()) e.razonSocial = 'La razón social es obligatoria'
    else if (!esSoloTexto(form.razonSocial.trim())) e.razonSocial = 'La razón social solo debe contener letras'
    if (!/^\d{11}$/.test(form.ruc.trim())) e.ruc = 'El RUC debe tener 11 dígitos'
    if (!form.tipoProveedor) e.tipoProveedor = 'Selecciona el tipo de servicio'
    if (form.nombreComercial.trim() && !esSoloTexto(form.nombreComercial.trim())) {
      e.nombreComercial = 'El nombre comercial no debe contener números'
    }
    if (form.contactoTelefono.trim() && !/^\d{9}$/.test(form.contactoTelefono.trim())) {
      e.contactoTelefono = 'El teléfono debe tener 9 dígitos'
    }
    if (form.contactoEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactoEmail.trim())) {
      e.contactoEmail = 'El correo de contacto no es válido'
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
        toast(`Proveedor "${payload.razonSocial}" actualizado correctamente`, 'success')
      } else {
        await crearProveedor(payload)
        limpiarFormulario()
        toast(`Proveedor "${payload.razonSocial}" creado correctamente`, 'success')
      }
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err))
      toast('No se pudo guardar el proveedor', 'error')
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
        <ModalMarca />
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
            <Campo label="Razón social" obligatorio error={errores.razonSocial}>
              <input
                type="text"
                className={errores.razonSocial ? inputClaseError : inputClase}
                value={form.razonSocial}
                onChange={(e) => setCampo('razonSocial', soloTexto(e.target.value))}
                placeholder="Ej: Transportes Andinos SAC"
              />
            </Campo>

            <Campo label="Nombre comercial" error={errores.nombreComercial}>
              <input
                type="text"
                className={errores.nombreComercial ? inputClaseError : inputClase}
                value={form.nombreComercial}
                onChange={(e) => setCampo('nombreComercial', soloTexto(e.target.value))}
                placeholder="Ej: Transportes Andinos"
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
                placeholder="Ej: 20123456789"
              />
            </Campo>

            <Campo label="Tipo de servicio" obligatorio error={errores.tipoProveedor}>
              <select
                className={errores.tipoProveedor ? inputClaseError : inputClase}
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
                onChange={(e) => setCampo('contactoNombre', soloTexto(e.target.value))}
                placeholder="Nombre completo"
              />
            </Campo>

            <Campo label="Teléfono" error={errores.contactoTelefono}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={9}
                className={errores.contactoTelefono ? inputClaseError : inputClase}
                value={form.contactoTelefono}
                onChange={(e) => setCampo('contactoTelefono', soloDigitos(e.target.value, 9))}
                placeholder="Ej: 987 654 321"
              />
            </Campo>

            <Campo label="Correo" error={errores.contactoEmail}>
              <input
                type="email"
                className={errores.contactoEmail ? inputClaseError : inputClase}
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
                onChange={(e) => setCampo('observaciones', soloTexto(e.target.value))}
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
