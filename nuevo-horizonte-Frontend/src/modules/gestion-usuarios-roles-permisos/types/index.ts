export interface Permiso {
  id: number
  modulo: string
  puedeLeer: boolean
  puedeCrear: boolean
  puedeActualizar: boolean
  puedeEliminar: boolean
}

export interface Rol {
  id: number
  nombre: string
  descripcion: string
  color: string
  esSistema: boolean
  activo: boolean
  permisos: Permiso[]
}

/** Catálogo real de módulos del sistema (GET /api/modulos). Única fuente de verdad
 * para qué módulos existen: el backend rechaza cualquier permiso que no apunte a uno. */
export interface Modulo {
  clave: string
  nombre: string
  descripcion: string
}

export interface Usuario {
  id: number
  username: string
  email: string
  activo: boolean
  fechaCreacion: string
  roles: Rol[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  nuevaContrasena: string
}

export interface MessageResponse {
  message: string
}

export interface UsuarioCreateRequest {
  username: string
  password: string
  email?: string
  rolIds?: number[]
}

export interface UsuarioUpdateRequest {
  email?: string
  activo?: boolean
  password?: string
  rolIds?: number[]
}

export interface PermisoRequest {
  modulo: string
  puedeLeer: boolean
  puedeCrear: boolean
  puedeActualizar: boolean
  puedeEliminar: boolean
}

export interface RolRequest {
  nombre: string
  descripcion: string
  color?: string
  activo?: boolean
  permisos: PermisoRequest[]
}

export interface PerfilUpdateRequest {
  username: string
  email: string
}

export interface CambiarPasswordRequest {
  passwordActual: string
  nuevaContrasena: string
  confirmarContrasena: string
}