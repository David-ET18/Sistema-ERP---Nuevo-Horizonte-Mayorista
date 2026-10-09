export interface Proveedor {
  id: number
  razonSocial: string
  nombreComercial: string | null
  ruc: string
  tipoProveedor: string | null
  contactoNombre: string | null
  contactoTelefono: string | null
  contactoEmail: string | null
  destinoId: number | null
  destino: string | null
  condicionesComerciales: string | null
  observaciones: string | null
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export type ProveedorLista = Pick<
  Proveedor,
  | 'id'
  | 'razonSocial'
  | 'nombreComercial'
  | 'ruc'
  | 'tipoProveedor'
  | 'contactoNombre'
  | 'contactoTelefono'
  | 'contactoEmail'
  | 'condicionesComerciales'
  | 'destino'
  | 'activo'
  | 'fechaActualizacion'
>

export interface ProveedorPayload {
  razonSocial: string
  nombreComercial: string | null
  ruc: string
  tipoProveedor: string
  contactoNombre: string | null
  contactoTelefono: string | null
  contactoEmail: string | null
  destinoId: number | null
  condicionesComerciales: string | null
  observaciones: string | null
  activo: boolean
}

/** Estado del formulario: los campos de texto se manejan como string,
 *  y se convierten a null solo al enviar. */
export interface ProveedorFormState {
  razonSocial: string
  nombreComercial: string
  ruc: string
  tipoProveedor: string
  contactoNombre: string
  contactoTelefono: string
  contactoEmail: string
  destinoId: string
  condicionesComerciales: string
  observaciones: string
  activo: boolean
}

export interface FiltrosProveedores {
  q: string
  tipoProveedor: string
  activo: string
  destinoId: string
}

export interface KpisProveedores {
  activos: number
  nuevosEsteMes: number
  sinTarifas: number
}

export interface Destino {
  id: number
  nombre: string
  pais: string
}

export interface PaginacionProveedores<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}
