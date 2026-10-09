import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

/** Iconos de linea para el menu lateral (trazo 1.8, viewBox 24). */
function base(props: IconProps): IconProps {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
  }
}

export function NavPanelIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}

export function NavCatalogoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
      <path d="M9 8h6M9 12h4" />
    </svg>
  )
}

export function NavProveedoresIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 6h11v10H2z" />
      <path d="M13 9h4l4 4v3h-8z" />
      <circle cx="6.5" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}

export function NavTarifasIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12.6V4a1 1 0 0 1 1-1h8.6a1 1 0 0 1 .7.3l7.4 7.4a1 1 0 0 1 0 1.4l-8.6 8.6a1 1 0 0 1-1.4 0l-7.4-7.4a1 1 0 0 1-.3-.7z" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </svg>
  )
}

export function NavPaquetesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="7" width="16" height="14" rx="2.5" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M9 11v6M15 11v6" />
    </svg>
  )
}

export function NavPromocionesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 5 5 19" />
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
    </svg>
  )
}

export function NavCotizacionesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  )
}

export function NavVentasIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h3l2.7 11.6a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.1L21 7H6" />
    </svg>
  )
}

export function NavReservasIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M3 10h18M8 2.5v4M16 2.5v4" />
      <path d="m9 15.5 2 2 4-4" />
    </svg>
  )
}

export function NavPagosIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19M6.5 15h4" />
    </svg>
  )
}

export function NavAgenciasIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M16 10h2a2 2 0 0 1 2 2v9" />
      <path d="M2 21h20M8 7h4M8 11h4M8 15h4" />
    </svg>
  )
}

export function NavSeguimientoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" />
    </svg>
  )
}

export function NavMarketingIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m3 11 15-6v14L3 13z" />
      <path d="M7 13.5V18a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3.2" />
      <path d="M21 9.5v5" />
    </svg>
  )
}

export function NavReportesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3v18h18" />
      <path d="M8 17v-5M13 17V8M18 17v-8" />
    </svg>
  )
}

export function NavDocumentosIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

export function NavNotificacionesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
      <path d="M10 20a2.2 2.2 0 0 0 4 0" />
    </svg>
  )
}

export function NavUsuariosIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3a6.5 6.5 0 0 1 3.5 5.7" />
    </svg>
  )
}

export function NavRolesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
