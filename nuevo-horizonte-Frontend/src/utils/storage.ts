import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/config/env'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function getUserFromStorage<T>(): T | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setUserInStorage<T>(user: T): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearSessionStorage(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}