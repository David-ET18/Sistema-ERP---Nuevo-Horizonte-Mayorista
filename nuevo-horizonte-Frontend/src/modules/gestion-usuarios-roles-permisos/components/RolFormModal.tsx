import { useState } from 'react'
import type { FormEvent } from 'react'

import type { PermisoRequest, Rol, RolRequest } from '../types'
import { extractErrorMessage } from '@/api/http'
import { DEFAULT_ROLE_COLOR } from '../utils/roleColor'
import { OPCIONES_PERMISOS } from '@/config/modulos'
import { useFormDraft } from '@/hooks/useFormDraft'

interface RolFormModalProps {
  onClose: () => void
  onSubmit: (payload: RolRequest) => Promise<void>
  rol?: Rol
}

interface PermisoRow {
  modulo: string
  puedeLeer: boolean
  puedeCrear: boolean
  puedeActualizar: boolean
  puedeEliminar: boolean
}

interface RolFormState {
  nombre: string
  descripcion: string
  tipoBase: RolRequest['tipoBase']
  color: string
  activo: boolean
  permisos: PermisoRow[]
}

const TIPOS_BASE: Array<RolRequest['tipoBase']> = ['custom', 'admin', 'system']

function permisosDe(rol?: Rol): PermisoRow[] {
  return (rol?.permisos ?? []).map((permiso) => ({
    modulo: permiso?.modulo ?? '',
    puedeLeer: permiso?.puedeLeer ?? false,
    puedeCrear: permiso?.puedeCrear ?? false,
    puedeActualizar: permiso?.puedeActualizar ?? false,
    puedeEliminar: permiso?.puedeEliminar ?? false,
  }))
}

export default function RolFormModal({ onClose, onSubmit, rol }: RolFormModalProps) {
  const editing = Boolean(rol)

  const [formEdicion, setFormEdicion] = useState<RolFormState>({
    nombre: rol?.nombre ?? '',
    descripcion: rol?.descripcion ?? '',
    tipoBase: rol?.tipoBase ?? 'custom',
    color: rol?.color || DEFAULT_ROLE_COLOR,
    activo: rol?.activo ?? true,
    permisos: permisosDe(rol),
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // El alta conserva borrador entre cierres; la edicion parte del rol real.
  const borrador = useFormDraft<RolFormState>('rol:nuevo', {
    nombre: '',
    descripcion: '',
    tipoBase: 'custom',
    color: DEFAULT_ROLE_COLOR,
    activo: true,
    permisos: [],
  })

  const form = editing ? formEdicion : borrador.valor
  const { nombre, descripcion, tipoBase, color, activo, permisos } = form

  function patch(p: Partial<RolFormState>) {
    if (editing) setFormEdicion((prev) => ({ ...prev, ...p }))
    else borrador.setValor((prev) => ({ ...prev, ...p }))
  }

  function addPermiso() {
    patch({
      permisos: [
        ...permisos,
        { modulo: '', puedeLeer: true, puedeCrear: false, puedeActualizar: false, puedeEliminar: false },
      ],
    })
  }

  function updatePermiso(index: number, p: Partial<PermisoRow>) {
    patch({
      permisos: permisos.map((permiso, i) => (i === index ? { ...permiso, ...p } : permiso)),
    })
  }

  function removePermiso(index: number) {
    patch({ permisos: permisos.filter((_, i) => i !== index) })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const validPermisos: PermisoRequest[] = permisos
      .filter((permiso) => permiso.modulo.trim().length > 0)
      .map((permiso) => ({
        modulo: permiso.modulo.trim(),
        puedeLeer: permiso.puedeLeer,
        puedeCrear: permiso.puedeCrear,
        puedeActualizar: permiso.puedeActualizar,
        puedeEliminar: permiso.puedeEliminar,
      }))

    setSaving(true)
    try {
      await onSubmit({
        nombre,
        descripcion,
        tipoBase,
        color,
        activo,
        permisos: validPermisos,
      })
      if (!editing) borrador.reset()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-[540px] max-w-[95vw] flex-col gap-4 overflow-y-auto rounded-xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">
          {editing ? 'Editar rol' : 'Nuevo rol'}
        </h3>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-[13px] text-gray-500">
              <span>Nombre</span>
              <input
                className={inputClass}
                value={nombre}
                onChange={(e) => patch({ nombre: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-[13px] text-gray-500">
              <span>Tipo base</span>
              <select
                className={inputClass}
                value={tipoBase}
                onChange={(e) => patch({ tipoBase: e.target.value as RolRequest['tipoBase'] })}
              >
                {TIPOS_BASE.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[13px] text-gray-500">
            <span>Descripción</span>
            <input
              className={inputClass}
              value={descripcion}
              onChange={(e) => patch({ descripcion: e.target.value })}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-[13px] text-gray-500">
              <span>Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color || DEFAULT_ROLE_COLOR}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-gray-300"
                />
                <span className="font-mono text-sm text-gray-700">{color}</span>
              </div>
            </label>

            <label className="flex items-end gap-2 pb-2 text-[13px] text-gray-500">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => patch({ activo: e.target.checked })}
                disabled={rol?.esSistema}
              />
              Rol activo
            </label>
          </div>

          <fieldset className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
            <legend className="px-1 text-[13px] text-gray-500">
              Permisos por módulo (Ver / Crear / Actualizar / Eliminar)
            </legend>
            {permisos.map((permiso, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-gray-100 p-2 sm:flex-row sm:items-center"
              >
                <select
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
                  value={permiso.modulo}
                  onChange={(e) => updatePermiso(index, { modulo: e.target.value })}
                >
                  <option value="">Seleccionar módulo</option>
                  {OPCIONES_PERMISOS.map((opcion) => (
                    <option key={opcion.clave} value={opcion.clave}>
                      {opcion.etiqueta}
                    </option>
                  ))}
                  {!OPCIONES_PERMISOS.some((o) => o.clave === permiso.modulo) && permiso.modulo && (
                    <option value={permiso.modulo}>{permiso.modulo} (no disponible)</option>
                  )}
                </select>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={permiso.puedeLeer}
                      onChange={(e) =>
                        updatePermiso(index, { puedeLeer: e.target.checked })
                      }
                    />
                    Ver
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={permiso.puedeCrear}
                      onChange={(e) =>
                        updatePermiso(index, { puedeCrear: e.target.checked })
                      }
                    />
                    Crear
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={permiso.puedeActualizar}
                      onChange={(e) =>
                        updatePermiso(index, { puedeActualizar: e.target.checked })
                      }
                    />
                    Actualizar
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={permiso.puedeEliminar}
                      onChange={(e) =>
                        updatePermiso(index, { puedeEliminar: e.target.checked })
                      }
                    />
                    Eliminar
                  </label>
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                    onClick={() => removePermiso(index)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="cursor-pointer self-start rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              onClick={addPermiso}
            >
              + Agregar permiso
            </button>
          </fieldset>

          {error && <p className="text-[13px] text-red-700">{error}</p>}

          {!editing && (
            <p className="text-[11px] text-gray-400">
              {borrador.restaurado
                ? 'Borrador restaurado'
                : 'Los datos se guardan al cerrar el modal'}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}