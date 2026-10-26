import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  // Ruta a la que quería ir antes de que lo mandaran al login (la guarda PrivateRoute)
  const state = location.state as { from?: Location } | null
  const from = state?.from ? state.from.pathname + state.from.search : '/'

  if (status === 'in') return <Navigate to={from} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50">
      <form onSubmit={handleSubmit} className="w-80 space-y-3 rounded bg-white p-6 shadow">
        <h1 className="text-xl font-bold">Iniciar sesión</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={sending} className="w-full rounded bg-blue-900 p-2 text-white disabled:opacity-50">
          {sending ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="text-sm">
          ¿Sin tripulación? <Link to="/register" className="text-blue-700 underline">Regístrate</Link>
        </p>
      </form>
    </div>
  )
}
