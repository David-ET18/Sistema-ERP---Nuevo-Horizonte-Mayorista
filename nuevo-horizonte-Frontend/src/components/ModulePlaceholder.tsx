interface ModulePlaceholderProps {
  title: string
  description: string
}

export default function ModulePlaceholder({
  title,
  description,
}: ModulePlaceholderProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">
            Módulo en construcción
          </p>
          <p className="mt-1 text-[13px] text-gray-400">
            Las funcionalidades de este módulo se implementarán próximamente.
          </p>
        </div>
      </div>
    </section>
  )
}