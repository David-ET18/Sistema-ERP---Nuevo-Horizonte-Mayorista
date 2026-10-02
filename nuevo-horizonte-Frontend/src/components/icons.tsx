import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
  } as const
}

function iconBase(props: IconProps): IconProps {
  return {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
  }
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  )
}

export function BoxIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5.502 9.5 4.49 19.561a1 1 0 0 0 .998 1.064h13.025a1 1 0 0 0 .997-1.065L18.498 9.5M2.25 4.875c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v2.625c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 0 1-1.125-1.125V4.875Z" />
      <path d="M12 9.75V15m0 0 2.25-1.125M12 15l-2.25-1.125" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m21 21-4.34-4.34m2.84-6.66a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75v-.7V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

export function IconEye(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconPencil(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

export function IconDots(_props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  )
}

export function IconClock(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...iconBase(props)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function IconHandshake(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...iconBase(props)}>
      <path d="m11 17 2 2a2 2 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a2 2 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a3 3 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a2 2 0 1 0 3-3" />
      <path d="M3 4h8" />
    </svg>
  )
}

export function IconCheckCircle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...iconBase(props)}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function IconX(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function IconCalendar(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

export function IconBriefcase(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...iconBase(props)}>
      <rect width="20" height="14" x="2" y="7" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

export function IconMoney(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...iconBase(props)}>
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}

export function IconBuilding(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...iconBase(props)}>
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M15 9h2a2 2 0 0 1 2 2v10" />
      <path d="M9 7h2M9 11h2M9 15h2" />
    </svg>
  )
}

export function IconStar(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...iconBase(props)}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function IconUpload(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}

export function IconUsers(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...iconBase(props)}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function IconAlertTriangle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...iconBase(props)}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function IconSave(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  )
}

export function IconSend(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...iconBase(props)}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}
