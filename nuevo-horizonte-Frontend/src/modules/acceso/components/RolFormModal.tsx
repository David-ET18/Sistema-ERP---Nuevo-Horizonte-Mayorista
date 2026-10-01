import { useState } from 'react'
import type { FormEvent } from 'react'

import type { PermisoRequest, RolRequest } from '../types'
import { extractErrorMessage } from '@/api/http'

interface RolFormModalProps {
  onClose: () => void
  onSubmit: (payload: RolRequest) => Promise<void>
}

interface PermisoRow {
  modulo: string
  puedeLeer: boolean
  puedeEscribir: boolean
}

export default function RolFormModal({ onClose, onSubmit }: RolFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [permisos, setPermisos] = useState<PermisoRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function addPermiso() {
    setPermisos((prev) => [
      ...prev,
      { modulo: '', puedeLeer: true, puedeEscribir: false },
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
        puedeEscribir: permiso.puedeEscribir,
      }))

    setSaving(true)
    try {
      await onSubmit({ nombre, descripcion, permisos: validPermisos })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-[480px] max-w-[95vw] flex-col gap-4 overflow-y-auto rounded-xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Nuevo rol</h3>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-[13px] text-gray-500">
            <span>Nombre</span>
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-[13px] text-gray-500">
            <span>Descripción</span>
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </label>

          <fieldset className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
            <legend className="px-1 text-[13px] text-gray-500">
              Permisos por módulo
            </legend>
            {permisos.map((permiso, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  placeholder="Módulo"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
                  value={permiso.modulo}
                  onChange={(e) =>
                    updatePermiso(index, { modulo: e.target.value })
                  }
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={permiso.puedeLeer}
                    onChange={(e) =>
                      updatePermiso(index, { puedeLeer: e.target.checked })
                    }
                  />
                  Leer
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={permiso.puedeEscribir}
                    onChange={(e) =>
                      updatePermiso(index, { puedeEscribir: e.target.checked })
                    }
                  />
                  Escribir
                </label>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                  onClick={() => removePermiso(index)}
                >
                  Quitar
                </button>
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