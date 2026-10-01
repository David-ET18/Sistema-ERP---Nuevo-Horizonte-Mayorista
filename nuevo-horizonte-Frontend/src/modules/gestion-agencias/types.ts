export interface Agencia {
  id: number
  razonSocial: string
  nombreComercial: string | null
  ruc: string
  categoria: string | null
  contactoNombre: string | null
  contactoTelefono: string | null
  contactoEmail: string | null
  logoUrl: string | null
  esPrioritaria: boolean
  activo: boolean
  fechaCreacion: string
}

export type AgenciaLista = Pick<
  Agencia,
  | 'id'
  | 'razonSocial'
  | 'nombreComercial'
  | 'ruc'
  | 'categoria'
  | 'contactoNombre'
  | 'contactoEmail'
  | 'logoUrl'
  | 'esPrioritaria'
  | 'activo'
  | 'fechaCreacion'
>

export interface AgenciaPayload {
  razonSocial: string
  nombreComercial: string | null
  ruc: string
  categoria: string | null
  contactoNombre: string | null
  contactoTelefono: string | null
  contactoEmail: string | null
  esPrioritaria: boolean
  activo: boolean
}

/** Estado del formulario: los campos de texto se manejan como string,
 *  y se convierten a null solo al enviar. */
export interface AgenciaFormState {
  razonSocial: string
  nombreComercial: string
  ruc: string
  categoria: string
  contactoNombre: string
  contactoTelefono: string
  contactoEmail: string
  esPrioritaria: boolean
  activo: boolean
}

export interface FiltrosAgencias {
  q: string
  categoria: string
  activo: string
  soloPrioritarias: boolean
}

export interface KpisAgencias {
  total: number
  activas: number
  prioritarias: number
  registradasEsteMes: number
}

export interface PaginacionAgencias<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}
