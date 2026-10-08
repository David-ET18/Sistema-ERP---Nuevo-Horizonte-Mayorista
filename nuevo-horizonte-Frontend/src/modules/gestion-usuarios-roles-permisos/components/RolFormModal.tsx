import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import type { Modulo, PermisoRequest, Rol, RolRequest } from '../types'
import { extractErrorMessage } from '@/api/http'
import { DEFAULT_ROLE_COLOR } from '../utils/roleColor'
import { listarModulos } from '../services/rolService'
import { MODULOS } from '@/config/modulos'
import { useFormDraft } from '@/hooks/useFormDraft'
import Alert from '@/components/Alert'
import { IconX } from '@/components/icons'

interface RolFormModalProps {
  onClose: () => void
  onSubmit: (payload: RolRequest) => Promise<void>
  rol?: Rol
}

interface FlagsPermiso {
  puedeLeer: boolean
  puedeCrear: boolean
  puedeActualizar: boolean
  puedeEliminar: boolean
}

/** Matriz modulo -> acciones. Las claves son siempre las del catalogo real
 * (GET /api/modulos): no hay forma de escribir ni seleccionar un modulo que
 * no exista, a diferencia del listado dinamico anterior. */
type MatrizPermisos = Record<string, FlagsPermiso>

interface RolFormState {
  nombre: string
  descripcion: string
  color: string
  activo: boolean
  permisos: MatrizPermisos
}

const SIN_FLAGS: FlagsPermiso = {
  puedeLeer: false,
  puedeCrear: false,
  puedeActualizar: false,
  puedeEliminar: false,
}

const ACCIONES: Array<{ clave: keyof FlagsPermiso; etiqueta: string }> = [
  { clave: 'puedeLeer', etiqueta: 'Ver' },
  { clave: 'puedeCrear', etiqueta: 'Crear' },
  { clave: 'puedeActualizar', etiqueta: 'Actualizar' },
  { clave: 'puedeEliminar', etiqueta: 'Eliminar' },
]

const COLORES_SUGERIDOS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#0ea5e9', '#dc2626', '#6366f1', '#64748b']

/** Agrupa visualmente por el `grupo` del registro de rutas (cosmetico,
 * si un modulo del backend no esta ahi igual se muestra, en "Otros"). */
function grupoDe(clave: string): string {
  return MODULOS.find((m) => m.clave === clave)?.grupo ?? 'Otros'
}

/** Reconstruye la matriz desde el catalogo real: un modulo sin fila previa
 * entra en false por defecto (sin permiso implicito), nunca se inventan filas
 * para modulos que ya no existen en `modulos`. */
function matrizDesde(modulos: Modulo[], origen: MatrizPermisos | undefined): MatrizPermisos {
  const matriz: MatrizPermisos = {}
  for (const modulo of modulos) {
    const existente = origen?.[modulo.clave]
    matriz[modulo.clave] =
      existente && typeof existente === 'object'
        ? {
            puedeLeer: Boolean(existente.puedeLeer),
            puedeCrear: Boolean(existente.puedeCrear),
            puedeActualizar: Boolean(existente.puedeActualizar),
            puedeEliminar: Boolean(existente.puedeEliminar),
          }
        : { ...SIN_FLAGS }
  }
  return matriz
}

function matrizDeRol(rol: Rol | undefined): MatrizPermisos {
  const matriz: MatrizPermisos = {}
  for (const permiso of rol?.permisos ?? []) {
    if (!permiso?.modulo) continue
    matriz[permiso.modulo] = {
      puedeLeer: Boolean(permiso.puedeLeer),
      puedeCrear: Boolean(permiso.puedeCrear),
      puedeActualizar: Boolean(permiso.puedeActualizar),
      puedeEliminar: Boolean(permiso.puedeEliminar),
    }
  }
  return matriz
}

function cuentaActivos(flags: FlagsPermiso | undefined): number {
  if (!flags) return 0
  return [flags.puedeLeer, flags.puedeCrear, flags.puedeActualizar, flags.puedeEliminar].filter(Boolean).length
}

export default function RolFormModal({ onClose, onSubmit, rol }: RolFormModalProps) {
  const editing = Boolean(rol)

  const [modulos, setModulos] = useState<Modulo[] | null>(null)
  const [errorModulos, setErrorModulos] = useState<string | null>(null)

  const [formEdicion, setFormEdicion] = useState<RolFormState>({
    nombre: rol?.nombre ?? '',
    descripcion: rol?.descripcion ?? '',
    color: rol?.color || DEFAULT_ROLE_COLOR,
    activo: rol?.activo ?? true,
    permisos: matrizDeRol(rol),
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // El alta conserva borrador entre cierres; la edicion parte del rol real.
  const borrador = useFormDraft<RolFormState>('rol:nuevo', {
    nombre: '',
    descripcion: '',
    color: DEFAULT_ROLE_COLOR,
    activo: true,
    permisos: {},
  })

  const form = editing ? formEdicion : borrador.valor
  const { nombre, descripcion, color, activo, permisos } = form

  useEffect(() => {
    listarModulos()
      .then((data) => {
        setModulos(data)
        // Alinea la matriz al catalogo real apenas se conoce: agrega filas
        // faltantes en false y descarta cualquier clave que ya no exista
        // (por ejemplo, un borrador viejo con una forma de datos distinta).
        patch({ permisos: matrizDesde(data, permisos) })
      })
      .catch((err) => setErrorModulos(extractErrorMessage(err)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function patch(p: Partial<RolFormState>) {
    if (editing) setFormEdicion((prev) => ({ ...prev, ...p }))
    else borrador.setValor((prev) => ({ ...prev, ...p }))
  }

  function setFlag(moduloClave: string, accion: keyof FlagsPermiso, valor: boolean) {
    patch({
      permisos: {
        ...permisos,
        [moduloClave]: { ...(permisos[moduloClave] ?? SIN_FLAGS), [accion]: valor },
      },
    })
  }

  function toggleColumna(accion: keyof FlagsPermiso, valor: boolean) {
    if (!modulos) return
    const siguiente: MatrizPermisos = { ...permisos }
    for (const modulo of modulos) {
      siguiente[modulo.clave] = { ...(siguiente[modulo.clave] ?? SIN_FLAGS), [accion]: valor }
    }
    patch({ permisos: siguiente })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    // Solo se envian los modulos con al menos un permiso activo: al venir de
    // la matriz del catalogo real, siempre son claves validas y sin repetir.
    const validPermisos: PermisoRequest[] = Object.entries(permisos)
      .filter(([, flags]) => flags.puedeLeer || flags.puedeCrear || flags.puedeActualizar || flags.puedeEliminar)
      .map(([modulo, flags]) => ({ modulo, ...flags }))

    setSaving(true)
    try {
      await onSubmit({ nombre, descripcion, color, activo, permisos: validPermisos })
      if (!editing) borrador.reset()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const inputClase =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10'

  const grupos = modulos ? Array.from(new Set(modulos.map((m) => grupoDe(m.clave)))) : []
  const totalModulosConAcceso = Object.values(permisos).filter((f) => cuentaActivos(f) > 0).length

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-gray-900/40 backdrop-blur-[1px]"
      onClick={onClose}
      role="presentation"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="rol-form-titulo"
        className="animate-panel-in flex h-full w-[640px] max-w-full flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="flex h-full flex-col" onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: color || DEFAULT_ROLE_COLOR }}
              >
                {(nombre || '?').trim().charAt(0).toUpperCase() || '?'}
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                  {editing ? 'Editar rol' : 'Nuevo rol'}
                </p>
                <h3 id="rol-form-titulo" className="mt-0.5 text-[17px] font-semibold text-gray-900">
                  {nombre || (editing ? rol?.nombre : 'Rol sin nombre')}
                </h3>
              </div>
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
            {error && <Alert type="error">{error}</Alert>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </span>
                <input
                  className={inputClase}
                  value={nombre}
                  onChange={(e) => patch({ nombre: e.target.value })}
                  placeholder="Ej. Coordinador de Ventas"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-gray-700">Color identificador</span>
                <div className="flex items-center gap-1.5">
                  {COLORES_SUGERIDOS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => patch({ color: c })}
                      className={`h-7 w-7 shrink-0 cursor-pointer rounded-full ring-offset-2 transition-shadow ${
                        color === c ? 'ring-2 ring-gray-900' : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Usar color ${c}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={color || DEFAULT_ROLE_COLOR}
                    onChange={(e) => patch({ color: e.target.value })}
                    className="h-7 w-7 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    aria-label="Elegir otro color"
                  />
                </div>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-gray-700">Descripción</span>
              <textarea
                className={`${inputClase} min-h-[70px] resize-y`}
                value={descripcion}
                onChange={(e) => patch({ descripcion: e.target.value })}
                placeholder="¿A qué se dedica este rol dentro del equipo?"
              />
            </label>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-gray-700">{activo ? 'Activo' : 'Inactivo'}</span>
                <span className="text-[11.5px] leading-snug text-gray-500">
                  {activo
                    ? 'Puede asignarse a usuarios y sus permisos están vigentes.'
                    : 'No se puede asignar a usuarios nuevos ni ejerce sus permisos.'}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={activo}
                aria-label="Alternar rol activo"
                disabled={rol?.esSistema}
                onClick={() => patch({ activo: !activo })}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 ${
                  rol?.esSistema ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${activo ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                    activo ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">Permisos por módulo</p>
                  <p className="text-[11.5px] text-gray-500">
                    Solo módulos del catálogo del sistema. {modulos && `${totalModulosConAcceso} de ${modulos.length} con algún acceso.`}
                  </p>
                </div>
              </div>

              {errorModulos && (
                <div className="px-4 pb-3">
                  <Alert type="error">{errorModulos}</Alert>
                </div>
              )}

              {!modulos && !errorModulos && (
                <div className="flex items-center gap-2 px-4 py-6 text-sm text-gray-500">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  Cargando catálogo de módulos…
                </div>
              )}

              {modulos && (
                <div className="max-h-[360px] overflow-y-auto px-2 pb-2">
                  <table className="w-full min-w-[480px] border-collapse text-sm">
                    <thead className="sticky top-0 z-10 bg-white">
                      <tr className="text-[11px] uppercase tracking-wide text-gray-500">
                        <th className="px-2 py-2 text-left font-semibold">Módulo</th>
                        {ACCIONES.map((accion) => (
                          <th key={accion.clave} className="px-1 py-2 text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>{accion.etiqueta}</span>
                              <button
                                type="button"
                                className="cursor-pointer rounded-full border border-gray-200 px-1.5 py-0.5 text-[9.5px] font-medium normal-case text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600"
                                onClick={() =>
                                  toggleColumna(
                                    accion.clave,
                                    !modulos.every((m) => permisos[m.clave]?.[accion.clave]),
                                  )
                                }
                              >
                                todos/ninguno
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grupos.map((grupo) => (
                        <GrupoFilas
                          key={grupo}
                          grupo={grupo}
                          modulos={modulos.filter((m) => grupoDe(m.clave) === grupo)}
                          permisos={permisos}
                          onToggle={setFlag}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!editing && (
              <p className="text-[11px] text-gray-400">
                {borrador.restaurado ? 'Borrador restaurado' : 'Los datos se guardan al cerrar el panel'}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={saving || !modulos}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear rol'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}

function GrupoFilas({
  grupo,
  modulos,
  permisos,
  onToggle,
}: {
  grupo: string
  modulos: Modulo[]
  permisos: MatrizPermisos
  onToggle: (moduloClave: string, accion: keyof FlagsPermiso, valor: boolean) => void
}) {
  if (modulos.length === 0) return null
  return (
    <>
      <tr>
        <td colSpan={ACCIONES.length + 1} className="px-2 pt-3 pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-gray-400">
          {grupo}
        </td>
      </tr>
      {modulos.map((modulo) => {
        const flags = permisos[modulo.clave] ?? SIN_FLAGS
        const activos = cuentaActivos(flags)
        return (
          <tr key={modulo.clave} className="rounded-lg transition-colors hover:bg-blue-50/40">
            <td className="px-2 py-1.5 text-gray-700">
              <span className={activos > 0 ? 'font-medium text-gray-900' : ''}>{modulo.nombre}</span>
            </td>
            {ACCIONES.map((accion) => (
              <td key={accion.clave} className="px-1 py-1.5 text-center">
                <input
                  type="checkbox"
                  checked={flags[accion.clave]}
                  onChange={(e) => onToggle(modulo.clave, accion.clave, e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-blue-600"
                />
              </td>
            ))}
          </tr>
        )
      })}
    </>
  )
}
