import { useEffect, useState } from 'react'
import { obtenerPerfil, actualizarPerfil, cambiarPassword } from '../services/authService'
import type { PerfilUpdateRequest, CambiarPasswordRequest, Usuario } from '../types'
import { useToastStore } from '@/store/toastStore'

export const PerfilPage = () => {
  const showToast = useToastStore((state) => state.show)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [cambiandoPwd, setCambiandoPwd] = useState(false)
  const [perfilForm, setPerfilForm] = useState<PerfilUpdateRequest>({ username: '', email: '' })
  const [pwdForm, setPwdForm] = useState<CambiarPasswordRequest>({
    passwordActual: '',
    nuevaContrasena: '',
    confirmarContrasena: '',
  })
  const [erroresPwd, setErroresPwd] = useState<string[]>([])

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
    try {
      setGuardandoPerfil(true)
      const data = await actualizarPerfil(perfilForm)
      setUsuario(data)
      showToast('Perfil actualizado correctamente', 'success')
    } catch (e: any) {
      showToast(e?.message || 'No se pudo actualizar el perfil', 'error')
    } finally {
      setGuardandoPerfil(false)
    }
  }

  const validarPwd = (): string[] => {
    const errs: string[] = []
    if (!pwdForm.passwordActual) errs.push('La contraseña actual es obligatoria')
    if (pwdForm.nuevaContrasena.length < 6) errs.push('La nueva contraseña debe tener al menos 6 caracteres')
    if (pwdForm.confirmarContrasena.length < 6) errs.push('La confirmación debe tener al menos 6 caracteres')
    if (pwdForm.nuevaContrasena !== pwdForm.confirmarContrasena) errs.push('La nueva contraseña y su confirmación no coinciden')
    return errs
  }

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validarPwd()
    setErroresPwd(errs)
    if (errs.length > 0) return
    try {
      setCambiandoPwd(true)
      await cambiarPassword(pwdForm)
      showToast('Contraseña actualizada correctamente', 'success')
      setPwdForm({ passwordActual: '', nuevaContrasena: '', confirmarContrasena: '' })
      setErroresPwd([])
    } catch (e: any) {
      showToast(e?.message || 'No se pudo cambiar la contraseña', 'error')
    } finally {
      setCambiandoPwd(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Ver perfil</h2>
        <p className="text-sm text-gray-500">Consulta y actualiza tus datos personales</p>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">Cargando perfil...</div>
      ) : (
        <>
          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Datos del usuario</h3>
            <form onSubmit={handleGuardarPerfil} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  value={perfilForm.username}
                  onChange={(e) => setPerfilForm((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  minLength={3}
                  maxLength={50}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={perfilForm.email}
                  onChange={(e) => setPerfilForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={100}
                  required
                />
              </div>
              {usuario?.roles?.length ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {usuario.roles.map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${r.color}1A`,
                          borderColor: r.color,
                          color: r.color,
                        }}
                      >
                        {r.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={guardandoPerfil}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Restablecer contraseña</h3>
            {erroresPwd.length > 0 && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {erroresPwd.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <form onSubmit={handleCambiarPassword} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                <input
                  type="password"
                  value={pwdForm.passwordActual}
                  onChange={(e) => setPwdForm((p) => ({ ...p, passwordActual: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  value={pwdForm.nuevaContrasena}
                  onChange={(e) => setPwdForm((p) => ({ ...p, nuevaContrasena: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  minLength={6}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={pwdForm.confirmarContrasena}
                  onChange={(e) => setPwdForm((p) => ({ ...p, confirmarContrasena: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  minLength={6}
                  maxLength={100}
                  required
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={cambiandoPwd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cambiandoPwd ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  )
}
