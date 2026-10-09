import { useEffect, useMemo, useState } from 'react'

import { actualizarPerfil, cambiarPassword, obtenerPerfil } from '../services/authService'
import type { CambiarPasswordRequest, PerfilUpdateRequest, Permiso, Usuario } from '../types'
import { useToastStore } from '@/store/toastStore'
import { formatDate } from '@/utils/format'
import ModalMarca from '@/components/ModalMarca'
import BrandLogo from '@/components/BrandLogo'
import { etiquetaDeModulo } from '@/config/modulos'
import {
  NavAgenciasIcon,
  NavCatalogoIcon,
  NavCotizacionesIcon,
  NavDocumentosIcon,
  NavMarketingIcon,
  NavPaquetesIcon,
  NavPagosIcon,
  NavProveedoresIcon,
  NavPromocionesIcon,
  NavReportesIcon,
  NavReservasIcon,
  NavRolesIcon,
  NavSeguimientoIcon,
  NavTarifasIcon,
  NavUsuariosIcon,
  NavVentasIcon,
} from '@/components/navIcons'
import {
  IconChevronDown,
  IconEye,
  IconEyeOff,
  IconInfo,
  IconMail,
  IconUsers,
  IconX,
} from '@/components/icons'

const ICONOS_MODULO: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  reportes: NavReportesIcon,
  catalogo: NavCatalogoIcon,
  proveedores: NavProveedoresIcon,
  tarifas: NavTarifasIcon,
  paquetes: NavPaquetesIcon,
  promociones: NavPromocionesIcon,
  cotizaciones: NavCotizacionesIcon,
  ventas: NavVentasIcon,
  reservas: NavReservasIcon,
  pagos: NavPagosIcon,
  'gestion-agencias': NavAgenciasIcon,
  'seguimiento-comercial': NavSeguimientoIcon,
  marketing: NavMarketingIcon,
  documentos: NavDocumentosIcon,
  notificaciones: NavUsuariosIcon,
  'gestion-usuarios-roles-permisos': NavRolesIcon,
}

const ICONO_FALLBACK = NavReportesIcon

interface AccesoModulo {
  modulo: string
  puedeLeer: boolean
  puedeCrear: boolean
  puedeActualizar: boolean
  puedeEliminar: boolean
}

const inputClase =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30'

const inputClaseError =
  'w-full rounded-lg border border-red-400 bg-red-50/40 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-300'

export const PerfilPage = () => {
  const showToast = useToastStore((state) => state.show)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [perfilForm, setPerfilForm] = useState<PerfilUpdateRequest>({ username: '', email: '' })
  const [erroresPerfil, setErroresPerfil] = useState<Partial<Record<keyof PerfilUpdateRequest, string>>>({})
  const [confirmarPwd, setConfirmarPwd] = useState(false)
  const [normasAbiertas, setNormasAbiertas] = useState(false)

  const accesos = useMemo<AccesoModulo[]>(() => {
    if (!usuario) return []
    const porModulo = new Map<string, Permiso>()
    for (const rol of usuario.roles) {
      for (const p of rol.permisos) {
        if (!p.puedeLeer && !p.puedeCrear && !p.puedeActualizar && !p.puedeEliminar) continue
        const existente = porModulo.get(p.modulo)
        if (existente) {
          porModulo.set(p.modulo, {
            ...existente,
            puedeLeer: existente.puedeLeer || p.puedeLeer,
            puedeCrear: existente.puedeCrear || p.puedeCrear,
            puedeActualizar: existente.puedeActualizar || p.puedeActualizar,
            puedeEliminar: existente.puedeEliminar || p.puedeEliminar,
          })
        } else {
          porModulo.set(p.modulo, { ...p })
        }
      }
    }
    return Array.from(porModulo.entries())
      .map(([modulo, p]) => ({
        modulo,
        puedeLeer: p.puedeLeer,
        puedeCrear: p.puedeCrear,
        puedeActualizar: p.puedeActualizar,
        puedeEliminar: p.puedeEliminar,
      }))
      .sort((a, b) => a.modulo.localeCompare(b.modulo))
  }, [usuario])

  const cargarPerfil = async () => {
    try {
      setLoading(true)
      const data = await obtenerPerfil()
      setUsuario(data)
      setPerfilForm({ username: data.username, email: data.email })
    } catch (e: any) {
      showToast(e?.message || 'No se pudo cargar el perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPerfil()
  }, [])

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Partial<Record<keyof PerfilUpdateRequest, string>> = {}
    if (!perfilForm.username.trim()) errs.username = 'El nombre de usuario es obligatorio'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfilForm.email.trim())) errs.email = 'El correo no es válido'
    setErroresPerfil(errs)
    if (Object.keys(errs).length > 0) return
    try {
      setGuardandoPerfil(true)
      const data = await actualizarPerfil(perfilForm)
      setUsuario(data)
      showToast('Perfil actualizado correctamente', 'success')
    } catch (err: any) {
      showToast(err?.message || 'No se pudo actualizar el perfil', 'error')
    } finally {
      setGuardandoPerfil(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Mi perfil</h2>
        <p className="mt-1 text-sm text-gray-500">Consulta y actualiza tus datos de acceso</p>
      </div>

      {loading ? (
        <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6">Cargando perfil...</div>
      ) : (
        usuario && (
          <>
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-dark to-gray-900 p-6 text-white shadow-lg">
              <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 px-3.5 shadow-inner ring-1 ring-white/20 backdrop-blur">
                  <BrandLogo height={34} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold">{usuario.username}</p>
                  <p className="truncate text-[13px] text-white/70">{usuario.email}</p>
                  <p className="mt-0.5 text-xs text-white/50">
                    Miembro desde {formatDate(usuario.fechaCreacion)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmarPwd(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/25"
                >
                  <LockIcon className="h-4 w-4" />
                  Cambiar contraseña
                </button>
              </div>

              {usuario.roles.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  {usuario.roles.map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: `${r.color}26`, color: r.color === '#ffffff' ? '#fff' : r.color }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                      {r.nombre}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <IconUsers className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">Datos del usuario</h3>
                  <p className="text-xs text-gray-400">Nombre de acceso y correo asociados a tu cuenta</p>
                </div>
              </div>

              <form onSubmit={handleGuardarPerfil} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-gray-600">Nombre de usuario</span>
                  <input
                    type="text"
                    value={perfilForm.username}
                    onChange={(e) => {
                      setPerfilForm((p) => ({ ...p, username: e.target.value }))
                      setErroresPerfil((prev) => {
                        if (!('username' in prev)) return prev
                        const next = { ...prev }
                        delete next.username
                        return next
                      })
                    }}
                    className={erroresPerfil.username ? inputClaseError : inputClase}
                    minLength={3}
                    maxLength={50}
                    required
                  />
                  {erroresPerfil.username && <span className="text-xs text-red-600">{erroresPerfil.username}</span>}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-gray-600">Correo electrónico</span>
                  <input
                    type="email"
                    value={perfilForm.email}
                    onChange={(e) => {
                      setPerfilForm((p) => ({ ...p, email: e.target.value }))
                      setErroresPerfil((prev) => {
                        if (!('email' in prev)) return prev
                        const next = { ...prev }
                        delete next.email
                        return next
                      })
                    }}
                    className={erroresPerfil.email ? inputClaseError : inputClase}
                    maxLength={100}
                    required
                  />
                  {erroresPerfil.email && <span className="text-xs text-red-600">{erroresPerfil.email}</span>}
                </label>

                <div className="flex items-center justify-end gap-2 md:col-span-2">
                  <button
                    type="submit"
                    disabled={guardandoPerfil}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <IconMail className="h-4 w-4" />
                    {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <IconInfo className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">Módulos y permisos disponibles</h3>
                  <p className="text-xs text-gray-400">Accesos que tienes según los permisos de tus roles</p>
                </div>
              </div>

              {accesos.length === 0 ? (
                <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-[13px] text-gray-500">
                  No tienes permisos asignados en ningún módulo.
                </p>
              ) : (
                <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {accesos.map((a) => {
                    const Icono = ICONOS_MODULO[a.modulo] ?? ICONO_FALLBACK
                    return (
                      <li
                        key={a.modulo}
                        className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                          <Icono className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-gray-800">{etiquetaDeModulo(a.modulo)}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {a.puedeLeer && <PermisoChip>Ver</PermisoChip>}
                            {a.puedeCrear && <PermisoChip>Crear</PermisoChip>}
                            {a.puedeActualizar && <PermisoChip>Editar</PermisoChip>}
                            {a.puedeEliminar && <PermisoChip>Eliminar</PermisoChip>}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setNormasAbiertas((v) => !v)}
                className="flex w-full cursor-pointer items-center justify-between gap-2 p-6 text-left"
                aria-expanded={normasAbiertas}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <IconInfo className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900">Normas y Condiciones</h3>
                    <p className="text-xs text-gray-400">Términos de uso de la plataforma Nuevo Horizonte</p>
                  </div>
                </div>
                <IconChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${normasAbiertas ? 'rotate-180' : ''}`}
                />
              </button>

              {normasAbiertas && (
                <div className="border-t border-gray-100 px-6 pb-6 pt-4 text-[13px] leading-relaxed text-gray-600">
                  <p className="mb-3 font-medium text-gray-800">
                    Al utilizar el sistema ERP de Nuevo Horizonte Mayorista aceptas las siguientes normas:
                  </p>
                  <ol className="list-decimal space-y-2 pl-5">
                    <li>
                      Acceso personal e intransferible: tu cuenta es individual. No compartas credenciales ni permitas que
                      terceros operen con tu usuario. Cada acción queda registrada con tu identidad.
                    </li>
                    <li>
                      Uso responsable de la información: los datos de clientes, agencias, tarifas y ventas son
                      confidenciales. Está prohibido difundirlos, copiarlos o usarlos fuera de las funciones del sistema.
                    </li>
                    <li>
                      Veracidad de la información registrada: los precios, cotizaciones, ventas y condiciones comerciales
                      que registres deben reflejar la realidad de las operaciones. Las correcciones se aplican a través de
                      los flujos del sistema y quedan auditadas.
                    </li>
                    <li>
                      Seguridad: usa contraseñas fuertes, cámbialas periódicamente y cierra la sesión al terminar de
                      trabajar. Notifica de inmediato cualquier acceso no autorizado.
                    </li>
                    <li>
                      Módulos y permisos: solo puedes operar los módulos para los que tienes permiso. Intentar acceder a
                      funciones no autorizadas puede dar lugar a la suspensión de la cuenta.
                    </li>
                    <li>
                      Propiedad intelectual: el sistema, su diseño, logo y contenidos pertenecen a Nuevo Horizonte
                      Mayorista. Su uso se limita a las operaciones internas autorizadas.
                    </li>
                    <li>
                      Vigencia: estas normas pueden actualizarse; la continuación en el uso del sistema implica la
                      aceptación de las versiones vigentes.
                    </li>
                  </ol>
                  <p className="mt-3 text-xs text-gray-400">
                    Contacto: administración de sistemas · Nuevo Horizonte Mayorista
                  </p>
                </div>
              )}
            </section>
          </>
        )
      )}

      {confirmarPwd && <CambiaPasswordModal onClose={() => setConfirmarPwd(false)} onFinal={() => setConfirmarPwd(false)} />}
    </div>
  )
}

function PermisoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
      {children}
    </span>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

type ErroresPwd = Partial<Record<'passwordActual' | 'nuevaContrasena' | 'confirmarContrasena', string>>

function CambiaPasswordModal({ onClose, onFinal }: { onClose: () => void; onFinal: () => void }) {
  const showToast = useToastStore((state) => state.show)
  const [form, setForm] = useState<CambiarPasswordRequest>({
    passwordActual: '',
    nuevaContrasena: '',
    confirmarContrasena: '',
  })
  const [ver, setVer] = useState(false)
  const [errores, setErrores] = useState<ErroresPwd>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function setCampo(campo: keyof CambiarPasswordRequest, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }))
    setErrores((prev) => {
      if (!(campo in prev)) return prev
      const next = { ...prev }
      delete next[campo]
      return next
    })
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const errs: ErroresPwd = {}
    if (!form.passwordActual) errs.passwordActual = 'Ingresa tu contraseña actual'
    if (form.nuevaContrasena.length < 6) errs.nuevaContrasena = 'La nueva contraseña debe tener al menos 6 caracteres'
    if (form.nuevaContrasena !== form.confirmarContrasena) errs.confirmarContrasena = 'Las contraseñas no coinciden'
    setErrores(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      await cambiarPassword(form)
      showToast('Contraseña actualizada correctamente', 'success')
      onFinal()
    } catch (err: any) {
      setError(err?.message || 'No se pudo cambiar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cambiar-pwd-titulo"
        className="animate-modal-pop w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <form className="flex flex-col gap-4 p-6" onSubmit={guardar}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <LockIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 id="cambiar-pwd-titulo" className="text-[15px] font-semibold text-gray-900">
                  Cambiar contraseña
                </h3>
                <p className="text-xs text-gray-400">Ingresa tu contraseña actual y define una nueva</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar"
            >
              <IconX />
            </button>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-gray-600">Contraseña actual</span>
            <input
              type={ver ? 'text' : 'password'}
              value={form.passwordActual}
              onChange={(e) => setCampo('passwordActual', e.target.value)}
              className={errores.passwordActual ? inputClaseError : inputClase}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            {errores.passwordActual && <span className="text-xs text-red-600">{errores.passwordActual}</span>}
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-gray-600">Nueva contraseña</span>
              <input
                type={ver ? 'text' : 'password'}
                value={form.nuevaContrasena}
                onChange={(e) => setCampo('nuevaContrasena', e.target.value)}
                className={errores.nuevaContrasena ? inputClaseError : inputClase}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
              />
              {errores.nuevaContrasena && <span className="text-xs text-red-600">{errores.nuevaContrasena}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-gray-600">Repetir contraseña</span>
              <input
                type={ver ? 'text' : 'password'}
                value={form.confirmarContrasena}
                onChange={(e) => setCampo('confirmarContrasena', e.target.value)}
                className={errores.confirmarContrasena ? inputClaseError : inputClase}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                required
              />
              {errores.confirmarContrasena && <span className="text-xs text-red-600">{errores.confirmarContrasena}</span>}
            </label>
          </div>

          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            {ver ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            {ver ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
          </button>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}