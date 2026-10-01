import type { Rol } from '../types'
import { getRoleColor } from '../utils/roleColor'

interface RoleBadgeProps {
  rol: Rol
}

export default function RoleBadge({ rol }: RoleBadgeProps) {
  const color = getRoleColor(rol)
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {rol.nombre}
    </span>
  )
}