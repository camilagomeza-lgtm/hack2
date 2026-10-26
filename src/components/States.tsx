// Estados reutilizables: cargando, error con reintento y vacío

export function Loading({ text = 'Cargando...' }: { text?: string }) {
  return <p className="p-6 text-center text-gray-500">{text}</p>
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-6 text-center">
      <p className="mb-3 text-red-600">{message}</p>
      <button onClick={onRetry} className="rounded bg-red-600 px-4 py-2 text-white">
        Reintentar
      </button>
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return <p className="p-6 text-center text-gray-500">{text}</p>
}
