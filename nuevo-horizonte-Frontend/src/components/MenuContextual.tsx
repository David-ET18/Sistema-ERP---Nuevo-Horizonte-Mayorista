import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface MenuContextualProps {
  /** Elemento que abre el menu. El menu se ancla a su esquina inferior derecha. */
  ancora: HTMLElement | null
  onClose: () => void
  children: React.ReactNode
}

const ANCHO_MENU = 208 // w-52
const MARGEN_VENTANA = 8
const DESPLAZAMIENTO = 4 // gap entre el boton y el menu

interface Posicion {
  top: number
  left: number
}

/**
 * Menu contextual que se renderiza en un portal sobre `document.body`.
 *
 * Las tablas viven dentro de contenedores con `overflow-hidden` /
 * `overflow-x-auto` para manejar el scroll horizontal, asi que un menu con
 * `position:absolute` queda recortado y tapado por el pie de paginacion.
 * Al salir del flujo del DOM y posicionarse respecto al viewport, siempre queda
 * por encima y nunca es recortado.
 *
 * Si no hay espacio debajo del ancla, se abre hacia arriba. Se recalcula al
 * hacer scroll o redimensionar la ventana.
 */
export default function MenuContextual({ ancora, onClose, children }: MenuContextualProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [posicion, setPosicion] = useState<Posicion | null>(null)

  // Se posiciona antes de pintar para que el menu no aparezca en (0,0) ni salte.
  useLayoutEffect(() => {
    if (!ancora) return
    const elemento = ancora

    function calcular() {
      const rect = elemento.getBoundingClientRect()
      const alto = menuRef.current?.offsetHeight ?? 0
      const espacioAbajo = window.innerHeight - rect.bottom

      // Abre hacia arriba si no cabe abajo y hay mas hueco arriba.
      const abrirArriba = alto > espacioAbajo - MARGEN_VENTANA && rect.top > espacioAbajo

      setPosicion({
        top: abrirArriba
          ? Math.max(MARGEN_VENTANA, rect.top - alto - DESPLAZAMIENTO)
          : rect.bottom + DESPLAZAMIENTO,
        left: Math.max(MARGEN_VENTANA, rect.right - ANCHO_MENU),
      })
    }

    calcular()
    window.addEventListener('resize', calcular)
    window.addEventListener('scroll', calcular, true)
    return () => {
      window.removeEventListener('resize', calcular)
      window.removeEventListener('scroll', calcular, true)
    }
  }, [ancora])

  useEffect(() => {
    function onPointerDown(event: MouseEvent | TouchEvent) {
      const destino = event.target as Node
      if (menuRef.current?.contains(destino)) return
      if (ancora?.contains(destino)) return
      onClose()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [ancora, onClose])

  if (!ancora) return null

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      // Invisible en el primer render: useLayoutEffect mide su alto y lo coloca.
      style={{
        top: posicion?.top ?? 0,
        left: posicion?.left ?? 0,
        width: ANCHO_MENU,
        visibility: posicion ? 'visible' : 'hidden',
      }}
      className="fixed z-[60] overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg"
    >
      {children}
    </div>,
    document.body,
  )
}