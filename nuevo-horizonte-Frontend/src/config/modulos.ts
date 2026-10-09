/**
 * Registro unico de modulos de la aplicacion.
 *
 * Es la fuente de verdad compartida por:
 *  - el menu lateral (`src/components/Layout.tsx`)
 *  - las rutas protegidas (`src/routes/AppRoutes.tsx` y `ProtectedRoute`)
 *  - el selector de permisos de roles y usuarios
 *
 * `desarrollado:false` marca modulos todavia no implementados: no se ofrecen para
 * asignar permisos ni se pueden navegar, aunque la ruta exista.
 */

export interface ModuloApp {
  /** Clave usada en rol_permiso.modulo. Debe coincidir con el backend. */
  clave: string
  etiqueta: string
  ruta: string
  grupo: 'Principal' | 'Producto' | 'Ventas' | 'General' | 'Gestion'
  desarrollado: boolean
}

export const MODULOS: ModuloApp[] = [
  { clave: 'reportes', etiqueta: 'Panel', ruta: '/dashboard', grupo: 'Principal', desarrollado: true },
  { clave: 'reportes', etiqueta: 'Dashboard y Reportes', ruta: '/reportes', grupo: 'General', desarrollado: true },

  { clave: 'catalogo', etiqueta: 'Catálogo Base', ruta: '/catalogo', grupo: 'Producto', desarrollado: true },
  { clave: 'proveedores', etiqueta: 'Proveedores', ruta: '/proveedores', grupo: 'Producto', desarrollado: true },
  { clave: 'tarifas', etiqueta: 'Tarifas', ruta: '/tarifas', grupo: 'Producto', desarrollado: true },
  { clave: 'paquetes', etiqueta: 'Paquetes Turísticos', ruta: '/paquetes', grupo: 'Producto', desarrollado: true },
  { clave: 'promociones', etiqueta: 'Promociones', ruta: '/promociones', grupo: 'Producto', desarrollado: false },

  { clave: 'cotizaciones', etiqueta: 'Cotizaciones', ruta: '/cotizaciones', grupo: 'Ventas', desarrollado: true },
  { clave: 'ventas', etiqueta: 'Gestión de Ventas', ruta: '/ventas', grupo: 'Ventas', desarrollado: true },
  { clave: 'reservas', etiqueta: 'Reservas', ruta: '/reservas', grupo: 'Ventas', desarrollado: false },
  { clave: 'pagos', etiqueta: 'Pagos', ruta: '/pagos', grupo: 'Ventas', desarrollado: false },
  { clave: 'gestion-agencias', etiqueta: 'Gestión de Agencias', ruta: '/gestion-agencias', grupo: 'Ventas', desarrollado: true },
  { clave: 'seguimiento-comercial', etiqueta: 'Seguimiento Comercial', ruta: '/seguimiento-comercial', grupo: 'Ventas', desarrollado: false },
  { clave: 'marketing', etiqueta: 'Difusión y Marketing', ruta: '/marketing', grupo: 'Ventas', desarrollado: false },

  { clave: 'documentos', etiqueta: 'Documentos', ruta: '/documentos', grupo: 'General', desarrollado: false },
  { clave: 'notificaciones', etiqueta: 'Notificaciones', ruta: '/notificaciones', grupo: 'General', desarrollado: false },

  { clave: 'gestion-usuarios-roles-permisos', etiqueta: 'Usuarios', ruta: '/gestion-usuarios-roles-permisos/usuarios', grupo: 'Gestion', desarrollado: true },
  { clave: 'gestion-usuarios-roles-permisos', etiqueta: 'Roles y Permisos', ruta: '/gestion-usuarios-roles-permisos/roles', grupo: 'Gestion', desarrollado: true },
]

/** Claves de modulos con functionality implementada, sin duplicados. */
export const CLAVES_MODULOS_DESARROLLADOS: string[] = Array.from(
  new Set(MODULOS.filter((m) => m.desarrollado).map((m) => m.clave)),
)

/** Modulos que ofrecen permiso CRUD, ordenados como el menu lateral. */
export interface OpcionModulo {
  clave: string
  etiqueta: string
}

export const OPCIONES_PERMISOS: OpcionModulo[] = MODULOS.filter((m) => m.desarrollado)
  .filter((m, i, lista) => lista.findIndex((o) => o.clave === m.clave) === i)
  .map((m) => ({ clave: m.clave, etiqueta: m.clave }))

/** Rutas exactas registradas, para validar acceso por URL. */
export const RUTAS_PROTEGIDAS: string[] = MODULOS.map((m) => m.ruta)

/** Perfil propio: accesible para cualquier usuario con sesion, sin permiso por modulo. */
export const RUTA_PERFIL = '/gestion-usuarios-roles-permisos/perfil'

/** Subrutas de un modulo que heredan su permiso (ej. /paquetes/nuevo). */
const SUFRIJOS_POR_MODULO: Record<string, string> = {
  '/paquetes': 'paquetes',
  '/gestion-agencias': 'gestion-agencias',
  '/gestion-usuarios-roles-permisos': 'gestion-usuarios-roles-permisos',
}

/**
 * Devuelve el modulo que protege una ruta, o `null` si la ruta no esta
 * registrada en la aplicacion.
 */
export function moduloDeRuta(pathname: string): ModuloApp | null {
  const normalizada = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  // El perfil pertenece al usuario, no al modulo de administracion.
  if (normalizada === RUTA_PERFIL) return null

  const exacta = MODULOS.find((m) => m.ruta === normalizada)
  if (exacta) return exacta

  const rutaPadre = MODULOS.find(
    (m) => normalizada.startsWith(`${m.ruta}/`) && SUFRIJOS_POR_MODULO[m.ruta] === m.clave,
  )
  if (rutaPadre) return rutaPadre

  return null
}

/** Etiquetas legibles de un modulo (puede haber varias rutas para la misma clave). */
export function etiquetaDeModulo(clave: string): string {
  return MODULOS.find((m) => m.clave === clave)?.etiqueta ?? clave
}