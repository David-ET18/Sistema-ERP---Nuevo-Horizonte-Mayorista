import type { ReactNode } from 'react'

import { IconAlertTriangle, IconCheckCircle, IconInfo } from '@/components/icons'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

const ESTILOS: Record<AlertType, { container: string; icon: string }> = {
  info: { container: 'border-blue-200 bg-blue-50 text-blue-800', icon: 'text-blue-500' },
  success: { container: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: 'text-emerald-500' },
  warning: { container: 'border-amber-200 bg-amber-50 text-amber-800', icon: 'text-amber-600' },
  error: { container: 'border-red-200 bg-red-50 text-red-700', icon: 'text-red-500' },
}

const ICONOS: Record<AlertType, typeof IconInfo> = {
  info: IconInfo,
  success: IconCheckCircle,
  warning: IconAlertTriangle,
  error: IconAlertTriangle,
}

interface Props {
  type?: AlertType
  title?: string
  children: ReactNode
  className?: string
}

/**
 * Banner de alerta en linea (no flotante), para validaciones de formulario,
 * avisos contextuales y mensajes de bloqueo dentro del contenido de una
 * pagina o panel. Para confirmaciones rapidas de una accion ya completada,
 * usar el Toast global en su lugar.
 */
export default function Alert({ type = 'info', title, children, className = '' }: Props) {
  const estilo = ESTILOS[type]
  const Icono = ICONOS[type]

  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`flex gap-2.5 rounded-lg border px-3.5 py-2.5 text-[13px] ${estilo.container} ${className}`}>
      <span className={`mt-0.5 shrink-0 ${estilo.icon}`}>
        <Icono className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        {title && <p className="font-semibold leading-tight">{title}</p>}
        <div className={title ? 'mt-0.5 leading-snug opacity-90' : 'leading-snug'}>{children}</div>
      </div>
    </div>
  )
}
