import type { ReactElement } from 'react'

import { useToastStore } from '@/store/toastStore'
import type { ToastType } from '@/store/toastStore'

const STYLES: Record<
  ToastType,
  { container: string; icon: string }
> = {
  success: {
    container: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: 'text-emerald-500',
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-800',
    icon: 'text-red-500',
  },
  info: {
    container: 'border-blue-200 bg-blue-50 text-blue-800',
    icon: 'text-blue-500',
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
  info: InfoIcon,
}

export default function Toast() {
  const { message, type, visible, hide } = useToastStore()
  if (!visible) return null

  const Icon = ICONS[type]
  const styles = STYLES[type]

  return (
    <div
      role="status"
      className={`fixed top-6 right-6 z-[100] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${styles.container}`}
    >
      <span className={styles.icon}>
        <Icon />
      </span>
      <p className="text-[13px] font-medium">{message}</p>
      <button
        type="button"
        onClick={hide}
        className="ml-2 cursor-pointer rounded p-0.5 opacity-60 hover:opacity-100"
        aria-label="Cerrar notificación"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}