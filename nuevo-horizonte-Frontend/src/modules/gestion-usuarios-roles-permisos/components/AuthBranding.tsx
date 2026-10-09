import type { SVGProps } from 'react'

import BrandLogo from '@/components/BrandLogo'

function PackageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6.75-3h4.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 1 .75-.75Z" />
      <path d="M12 12v6m0-6a1.5 1.5 0 1 0-1.5-1.5" />
    </svg>
  )
}

function HotelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3.75 21V4.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V8.25h6V6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21" />
      <path d="M3.75 13.5h18M2.25 21h19.5" />
    </svg>
  )
}

function PlaneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9.75 15 4-4m-4 4L9 21l2.25-3.75L15 15l6-6" />
      <path d="M4.5 9.75 9 14.25 3 21l6.75-6" />
      <path d="M14.25 3 12 8.25 5.25 15l8.25-2.25L21 9.75 14.25 3Z" />
    </svg>
  )
}

const SERVICE_CATEGORIES = [
  { label: 'Paquetes', Icon: PackageIcon },
  { label: 'Hoteles', Icon: HotelIcon },
  { label: 'Vuelos', Icon: PlaneIcon },
]

export const AUTH_INPUT_CLASSES =
  'rounded-lg border-0 bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-700 focus:outline-none'

/** Panel izquierdo de marca compartido por Login y Reset de contraseña. */
export default function AuthBranding() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0b1b3a] to-[#0d2250] p-10 text-white lg:flex">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:26px_26px]" />
      <span className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/[0.04]" />
      <span className="pointer-events-none absolute -bottom-24 -left-14 h-64 w-64 rounded-full bg-white/[0.04]" />

      <header className="relative flex items-center">
        <BrandLogo height={34} />
      </header>

      <section className="relative max-w-md">
        <img
          src="/brand/bienvenida-panel.png"
          alt=""
          aria-hidden="true"
          className="h-44 w-44 object-contain drop-shadow-xl"
        />
        <h1 className="mt-6 text-3xl font-bold leading-tight">
          Sistema de Gestión de Productos y Ventas
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Gestiona productos, reservas y ventas de viajes desde un solo lugar.
        </p>
      </section>

      <footer className="relative flex gap-8">
        {SERVICE_CATEGORIES.map(({ label, Icon }) => (
          <div key={label} className="flex items-center gap-2 text-[13px] text-white/80">
            <Icon className="h-5 w-5" />
            {label}
          </div>
        ))}
      </footer>
    </aside>
  )
}
