import { useState } from 'react'
import type { FormEvent } from 'react'

import type { PermisoRequest, Rol, RolRequest } from '../types'
import { extractErrorMessage } from '@/api/http'
import { DEFAULT_ROLE_COLOR } from '../utils/roleColor'

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

const TIPOS_BASE: Array<RolRequest['tipoBase']> = ['custom', 'admin', 'system']

export default function RolFormModal({ onClose, onSubmit, rol }: RolFormModalProps) {
  const editing = Boolean(rol)

  const [nombre, setNombre] = useState(rol?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? '')
  const [tipoBase, setTipoBase] = useState<RolRequest['tipoBase']>(
    rol?.tipoBase ?? 'custom',
  )
  const [color, setColor] = useState(rol?.color || DEFAULT_ROLE_COLOR)
  const [activo, setActivo] = useState(rol?.activo ?? true)
  const [permisos, setPermisos] = useState<PermisoRow[]>(
    rol?.permisos.map((permiso) => ({
      modulo: permiso.modulo,
      puedeLeer: permiso.puedeLeer,
      puedeCrear: permiso.puedeCrear,
      puedeActualizar: permiso.puedeActualizar,
      puedeEliminar: permiso.puedeEliminar,
    })) ?? [],
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function addPermiso() {
    setPermisos((prev) => [
      ...prev,
      {
        modulo: '',
        puedeLeer: true,
        puedeCrear: false,
        puedeActualizar: false,
        puedeEliminar: false,
      },
    ])
  }

  function updatePermiso(index: number, patch: Partial<PermisoRow>) {
    setPermisos((prev) =>
      prev.map((permiso, i) =>
        i === index ? { ...permiso, ...patch } : permiso,
      ),
    )
  }

  function removePermiso(index: number) {
    setPermisos((prev) => prev.filter((_, i) => i !== index))
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
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-[13px] text-gray-500">
              <span>Tipo base</span>
              <select
                className={inputClass}
                value={tipoBase}
                onChange={(e) => setTipoBase(e.target.value as RolRequest['tipoBase'])}
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
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-[13px] text-gray-500">
              <span>Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color || DEFAULT_ROLE_COLOR}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-gray-300"
                />
                <span className="font-mono text-sm text-gray-700">{color}</span>
              </div>
            </label>

            <label className="flex items-end gap-2 pb-2 text-[13px] text-gray-500">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
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
                <input
                  placeholder="Módulo"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
                  value={permiso.modulo}
                  onChange={(e) => updatePermiso(index, { modulo: e.target.value })}
                />
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

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              Cancelar
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