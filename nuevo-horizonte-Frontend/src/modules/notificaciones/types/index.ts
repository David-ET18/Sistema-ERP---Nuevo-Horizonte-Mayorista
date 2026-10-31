export interface Notificacion {
  id: number
  titulo: string
  mensaje: string
  tipo: string
  enlace: string | null
  leida: boolean
  fechaLeida: string | null
  fechaCreacion: string
}
