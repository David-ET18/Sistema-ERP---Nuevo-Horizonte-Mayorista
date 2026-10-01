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
  tipoBase: 'system' | 'custom' | 'admin'
  color: string
  esSistema: boolean
  activo: boolean
  permisos: Permiso[]
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

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  usuario: Usuario
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
  tipoBase?: 'system' | 'custom' | 'admin'
  color?: string
  activo?: boolean
  permisos: PermisoRequest[]
}