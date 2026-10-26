import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-amber-50">
      <h1 className="text-4xl font-bold">404</h1>
      <p>Esta isla no aparece en ningún mapa.</p>
      <Link to="/" className="text-blue-700 underline">
        Volver al inicio
      </Link>
    </div>
  )
}
