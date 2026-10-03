/**
 * Isotipo oficial de Nuevo Horizonte (avion + ola), recortado por CSS.
 *
 * El archivo /brand/logo-nh.png (copia de logo-blanco.png del proyecto
 * NHMayorista) trae mucho margen transparente alrededor del dibujo, asi que
 * en vez de generar un PNG recortado (riesgo de corromper el binario al
 * manipularlo a mano) se recorta visualmente: la imagen completa se agranda
 * y se desplaza dentro de una caja con overflow oculto, de forma que solo
 * se vea el area real del logo.
 */

// Caja que delimita el dibujo dentro del PNG original (405x200), en pixeles.
const BBOX = { x: 31, y: 61, width: 342, height: 75 }

interface Props {
  /** Alto final del logo ya recortado, en pixeles. */
  height: number
  className?: string
}

export default function BrandLogo({ height, className }: Props) {
  const scale = height / BBOX.height
  const width = BBOX.width * scale

  return (
    <span
      className={className}
      style={{ display: 'inline-block', width, height, overflow: 'hidden', position: 'relative' }}
    >
      <img
        src="/brand/logo-nh.png"
        alt="Nuevo Horizonte"
        style={{
          position: 'absolute',
          left: -BBOX.x * scale,
          top: -BBOX.y * scale,
          width: 405 * scale,
          height: 200 * scale,
          maxWidth: 'none',
        }}
      />
    </span>
  )
}
