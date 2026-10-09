import type { ReactElement } from 'react'

import { useToastStore } from '@/store/toastStore'
import type { ToastType } from '@/store/toastStore'

const CONFIG: Record<ToastType, { accent: string; chip: string; bar: string; titulo: string }> = {
  success: {
    accent: 'bg-emerald-500',
    chip: 'bg-emerald-100 text-emerald-600',
    bar: 'bg-emerald-500',
    titulo: '¡Todo listo!',
  },
  error: {
    accent: 'bg-red-500',
    chip: 'bg-red-100 text-red-600',
    bar: 'bg-red-500',
    titulo: 'Ocurrió un error',
  },
  warning: {
    accent: 'bg-amber-400',
    chip: 'bg-amber-100 text-amber-600',
    bar: 'bg-amber-400',
    titulo: 'Aviso',
  },
  info: {
    accent: 'bg-blue-500',
    chip: 'bg-blue-100 text-blue-600',
    bar: 'bg-blue-500',
    titulo: 'Información',
  },
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function ExclamationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  )
}

const ICONS: Record<ToastType, () => ReactElement> = {
  success: CheckIcon,
  error: ExclamationIcon,
  warning: ExclamationIcon,
  info: InfoIcon,
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

export default function Toast() {
  const { message, type, visible, hide } = useToastStore()
  if (!visible) return null

  const Icon = ICONS[type]
  const config = CONFIG[type]

  return (
    <div
      role="status"
      className="toast-in fixed top-6 right-6 z-[100] flex w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-gray-200/80"
    >
      <span className={`w-1.5 shrink-0 ${config.accent}`} />
      <div className="flex min-w-0 flex-1 items-start gap-3 py-3.5 pl-4 pr-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.chip}`}>
          <Icon />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[13px] font-semibold text-gray-900">{config.titulo}</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-gray-500">{message}</p>
        </div>
        <button
          type="button"
          onClick={hide}
          className="mt-1 cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Cerrar notificación"
        >
          <CloseIcon />
        </button>
      </div>
      <span className={`toast-progress absolute bottom-0 left-0 h-0.5 ${config.bar}`} />
    </div>
  )
}