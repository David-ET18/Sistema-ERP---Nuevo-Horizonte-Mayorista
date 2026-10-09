import { useEffect, useRef, useState } from 'react'

import type { Destino, ProveedorRef, Servicio, Tarifa, TarifaPayload } from '../types'
import { actualizarTarifa, crearTarifa, subirArchivoRespaldo } from '../services/tarifaService'
import { extractErrorMessage } from '@/api/http'
import { IconUpload, IconX } from '@/components/icons'
import ModalMarca from '@/components/ModalMarca'
import { useToastStore } from '@/store/toastStore'
import { useFormDraft } from '@/hooks/useFormDraft'
import { soloTexto } from '@/utils/validacion'

interface Props {
  tarifa: Tarifa | null
  proveedores: ProveedorRef[]
  servicios: Servicio[]
  destinos: Destino[]
  tiposTarifa: string[]
  monedas: string[]
  onClose: () => void
  onSaved: () => void
}

interface FormState {
  proveedorId: string
  servicioId: string
  destinoId: string
  tipoTarifa: string
  precio: string
  moneda: string
  fechaDesde: string
  fechaHasta: string
  condiciones: string
  observaciones: string
}

const VACIO: FormState = {
  proveedorId: '',
  servicioId: '',
  destinoId: '',
  tipoTarifa: '',
  precio: '',
  moneda: 'PEN',
  fechaDesde: '',
  fechaHasta: '',
  condiciones: '',
  observaciones: '',
}

export default function TarifaFormModal({
  tarifa,
  proveedores,
  servicios,
  destinos,
  tiposTarifa,
  monedas,
  onClose,
  onSaved,
}: Props) {
  const editando = tarifa !== null
  const [formEdicion, setFormEdicion] = useState<FormState>(VACIO)
  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null)
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const inputArchivo = useRef<HTMLInputElement>(null)

  // El alta conserva borrador entre cierres; la edicion parte del registro real.
  const borrador = useFormDraft<FormState>('tarifa:nueva', VACIO)
  const form = editando ? formEdicion : borrador.valor

  const toast = useToastStore((s) => s.show)

  useEffect(() => {
    if (tarifa) {
      setFormEdicion({
        proveedorId: String(tarifa.proveedorId),
        servicioId: String(tarifa.servicioId),
        destinoId: String(tarifa.destinoId),
        tipoTarifa: tarifa.tipoTarifa ?? '',
        precio: String(tarifa.precio),
        moneda: tarifa.moneda,
        fechaDesde: tarifa.fechaDesde,
        fechaHasta: tarifa.fechaHasta,
        condiciones: tarifa.condiciones ?? '',
        observaciones: tarifa.observaciones ?? '',
      })
      setNombreArchivo(tarifa.archivoRespaldoUrl)
    }
    setArchivoPendiente(null)
    setError(null)
  }, [tarifa])

  function limpiarFormulario() {
    setFormEdicion(VACIO)
    setArchivoPendiente(null)
    setNombreArchivo(null)
    borrador.reset()
  }

  function setCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    if (editando) setFormEdicion((prev) => ({ ...prev, [campo]: valor }))
    else borrador.setCampo(campo, valor)
  }

  async function manejarArchivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0]
    if (!archivo) return

    const extension = archivo.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'xls', 'xlsx', 'csv'].includes(extension ?? '')) {
      setError('El archivo debe ser PDF, XLS, XLSX o CSV')
      return
    }
    if (archivo.size > 10 * 1024 * 1024) {
      setError('El archivo no debe superar los 10 MB')
      return
    }

    setError(null)
    if (editando && tarifa) {
      try {
        const { archivoRespaldoUrl: subido } = await subirArchivoRespaldo(tarifa.id, archivo)
        setNombreArchivo(subido)
      } catch (err) {
        setError(extractErrorMessage(err))
      }
    } else {
      setArchivoPendiente(archivo)
      setNombreArchivo(archivo.name)
    }
  }

  function validar(): string | null {
    if (!form.proveedorId) return 'Selecciona el proveedor'
    if (!form.servicioId) return 'Selecciona el servicio'
    if (!form.destinoId) return 'Selecciona el destino'
    if (!form.precio || Number(form.precio) <= 0) return 'El precio debe ser mayor a 0'
    if (!form.fechaDesde || !form.fechaHasta) return 'Completa el rango de vigencia'
    if (form.fechaHasta < form.fechaDesde) return 'La fecha fin no puede ser anterior a la fecha inicio'
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
      const payload: TarifaPayload = {
        proveedorId: Number(form.proveedorId),
        servicioId: Number(form.servicioId),
        destinoId: Number(form.destinoId),
        tipoTarifa: form.tipoTarifa || null,
        precio: Number(form.precio),
        moneda: form.moneda,
        fechaDesde: form.fechaDesde,
        fechaHasta: form.fechaHasta,
        condiciones: form.condiciones.trim() || null,
        observaciones: form.observaciones.trim() || null,
      }

      if (editando && tarifa) {
        await actualizarTarifa(tarifa.id, payload)
        limpiarFormulario()
        toast('Tarifa actualizada correctamente', 'success')
      } else {
        const creada = await crearTarifa(payload)
        if (archivoPendiente) {
          await subirArchivoRespaldo(creada.id, archivoPendiente)
        }
        limpiarFormulario()
        toast('Tarifa creada correctamente', 'success')
      }
      onSaved()
    } catch (err) {
      setError(extractErrorMessage(err))
      toast('No se pudo guardar la tarifa', 'error')
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
          <h3 className="text-base font-semibold text-gray-900">{editando ? 'Editar tarifa' : 'Nueva Tarifa'}</h3>
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
            <Campo label="Proveedor" obligatorio>
              <select
                className={inputClase}
                value={form.proveedorId}
                onChange={(e) => setCampo('proveedorId', e.target.value)}
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Servicio" obligatorio>
              <select
                className={inputClase}
                value={form.servicioId}
                onChange={(e) => setCampo('servicioId', e.target.value)}
              >
                <option value="">Seleccionar servicio</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Destino" obligatorio>
                <select
                  className={inputClase}
                  value={form.destinoId}
                  onChange={(e) => setCampo('destinoId', e.target.value)}
                >
                  <option value="">Seleccionar destino</option>
                  {destinos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Tipo de tarifa">
                <select
                  className={inputClase}
                  value={form.tipoTarifa}
                  onChange={(e) => setCampo('tipoTarifa', e.target.value)}
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposTarifa.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Precio" obligatorio>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClase}
                  value={form.precio}
                  onChange={(e) => setCampo('precio', e.target.value)}
                  placeholder="0.00"
                />
              </Campo>
              <Campo label="Moneda">
                <select
                  className={inputClase}
                  value={form.moneda}
                  onChange={(e) => setCampo('moneda', e.target.value)}
                >
                  {monedas.map((m) => (
                    <option key={m} value={m}>
                      {m === 'PEN' ? 'Soles (PEN)' : m === 'USD' ? 'Dólares (USD)' : m}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Fecha inicio" obligatorio>
                <input
                  type="date"
                  className={inputClase}
                  value={form.fechaDesde}
                  onChange={(e) => setCampo('fechaDesde', e.target.value)}
                />
              </Campo>
              <Campo label="Fecha fin" obligatorio>
                <input
                  type="date"
                  className={inputClase}
                  value={form.fechaHasta}
                  onChange={(e) => setCampo('fechaHasta', e.target.value)}
                />
              </Campo>
            </div>

            <Campo label="Condiciones">
              <textarea
                className={`${inputClase} min-h-[70px] resize-y`}
                value={form.condiciones}
                onChange={(e) => setCampo('condiciones', soloTexto(e.target.value))}
                placeholder="Condiciones de la tarifa..."
              />
            </Campo>

            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-gray-600">Archivo de respaldo</span>
              <input
                ref={inputArchivo}
                type="file"
                accept=".pdf,.xls,.xlsx,.csv"
                className="hidden"
                onChange={manejarArchivo}
              />
              <button
                type="button"
                onClick={() => inputArchivo.current?.click()}
                className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-gray-300 px-4 py-5 text-center text-xs text-gray-500 hover:bg-gray-50"
              >
                <IconUpload />
                {nombreArchivo ? nombreArchivo : 'Arrastra tu archivo o selecciona uno'}
                <span className="text-[11px] text-gray-400">Formatos: PDF, Excel, CSV (Máx 10MB)</span>
              </button>
            </div>

            <Campo label="Observaciones">
              <textarea
                className={`${inputClase} min-h-[70px] resize-y`}
                value={form.observaciones}
                onChange={(e) => setCampo('observaciones', soloTexto(e.target.value))}
                placeholder="Observaciones adicionales..."
              />
            </Campo>
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
              {guardando ? 'Guardando...' : 'Guardar Tarifa'}
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
