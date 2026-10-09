import BrandLogo from '@/components/BrandLogo'

/**
 * Banda superior de marca para modales: degradado corporativo con el logo
 * (mismo isotipo blanco que la pantalla de inicio). Reemplaza la antigua
 * barrita de 1px para que los modales luzcan identificados con la empresa.
 */
export default function ModalMarca() {
  return (
    <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-r from-brand to-brand-dark py-3">
      <span className="pointer-events-none absolute -left-8 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <BrandLogo height={26} />
    </div>
  )
}