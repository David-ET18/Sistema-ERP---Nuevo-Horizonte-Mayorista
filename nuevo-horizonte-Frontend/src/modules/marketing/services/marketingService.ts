import { http } from '@/api/http'

const BASE = '/marketing'

export function publicarMarketing(texto: string, imagen: File): Promise<void> {
  const data = new FormData()
  data.append('texto', texto)
  data.append('imagen', imagen)
  return http.post(`${BASE}/publicaciones`, data).then(() => undefined)
}
