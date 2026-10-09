import type { EstadoVenta } from '../types'
import { estadoInfo } from '../utils'

interface Props {
  estado: EstadoVenta
}

export default function EstadoBadge({ estado }: Props) {
  const info = estadoInfo(estado)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${info.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
      {info.etiqueta}
    </span>
  )
}
