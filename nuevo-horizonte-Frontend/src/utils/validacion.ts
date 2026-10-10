const LETRAS = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ'
const SIGNO_TEXTO = '&.,\'()-'

export const REGEX_SOLO_TEXTO = new RegExp(`^[${LETRAS}\\s${SIGNO_TEXTO}]*$`)
export const REGEX_TIENE_LETRA = new RegExp(`[${LETRAS}]`)

export function soloTexto(valor: string): string {
  return valor.replace(new RegExp(`[^${LETRAS}\\s${SIGNO_TEXTO}]`, 'g'), '')
}

export function esSoloTexto(valor: string): boolean {
  return REGEX_SOLO_TEXTO.test(valor) && REGEX_TIENE_LETRA.test(valor)
}

export function soloDigitos(valor: string, max?: number): string {
  const limpio = valor.replace(/\D/g, '')
  return max ? limpio.slice(0, max) : limpio
}

export function quitarDigitos(valor: string): string {
  return valor.replace(/\d/g, '')
}