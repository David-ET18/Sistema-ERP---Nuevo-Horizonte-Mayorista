import { useCallback, useEffect, useState } from 'react'

const PREFIJO_BORRADOR = 'nh_borrador:'

function leer(clave: string): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(PREFIJO_BORRADOR + clave)
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function escribir(clave: string, valor: unknown) {
  try {
    sessionStorage.setItem(PREFIJO_BORRADOR + clave, JSON.stringify(valor))
  } catch {
    // sessionStorage no disponible: el formulario sigue funcionando en memoria.
  }
}

function borrar(clave: string) {
  try {
    sessionStorage.removeItem(PREFIJO_BORRADOR + clave)
  } catch {
    // nada que limpiar
  }
}

/**
 * Mantiene el estado de un formulario entre aperturas y cierres del modal.
 *
 * El borrador se guarda en sessionStorage, asi que sobrevive al cierre del modal
 * y a un refresco de la pagina, y se descarta al cerrar la pestana. Se limpia solo
 * cuando el formulario se guarda con exito (`reset`).
 *
 * La clave identifica el formulario, por ejemplo 'agencia:nueva'. El modal se
 * desmonta al cerrarse, asi que la clave no cambia durante la vida del hook.
 */
export function useFormDraft<T extends object>(clave: string, valorInicial: T) {
  // Se fija en el primer render: es el estado al que vuelve `reset`.
  const [vacio] = useState(valorInicial)

  const [restaurado, setRestaurado] = useState(() => Boolean(leer(clave)))

  const [valor, setValor] = useState<T>(() => {
    const guardado = leer(clave)
    return guardado ? ({ ...valorInicial, ...guardado } as T) : valorInicial
  })

  useEffect(() => {
    escribir(clave, valor)
  }, [clave, valor])

  const setCampo = useCallback(<K extends keyof T>(campo: K, nuevo: T[K]) => {
    setValor((prev) => ({ ...prev, [campo]: nuevo }))
  }, [])

  const reset = useCallback(() => {
    borrar(clave)
    setValor(vacio)
    setRestaurado(false)
  }, [clave, vacio])

  const descartarBorrador = useCallback(() => {
    reset()
  }, [reset])

  const marcarRestaurado = useCallback(() => setRestaurado(false), [])

  return { valor, setValor, setCampo, reset, restaurar: descartarBorrador, restaurado, marcarRestaurado }
}