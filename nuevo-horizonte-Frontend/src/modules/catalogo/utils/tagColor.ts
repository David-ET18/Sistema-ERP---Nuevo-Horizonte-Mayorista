/** Paleta de badges para agrupar visualmente por pais/categoria en las tablas del catalogo. */
const PALETA_TAG = [
  'bg-blue-50 text-blue-700 ring-blue-600/15',
  'bg-violet-50 text-violet-700 ring-violet-600/15',
  'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  'bg-amber-50 text-amber-700 ring-amber-600/15',
  'bg-rose-50 text-rose-700 ring-rose-600/15',
  'bg-cyan-50 text-cyan-700 ring-cyan-600/15',
  'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
]

/** Color estable para una etiqueta de texto (mismo valor -> mismo color siempre). */
export function colorEtiqueta(valor: string): string {
  const hash = [...valor].reduce((suma, c) => suma + c.charCodeAt(0), 0)
  return PALETA_TAG[hash % PALETA_TAG.length]
}
