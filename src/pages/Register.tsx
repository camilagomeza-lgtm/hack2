import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api'

type Field = 'teamName' | 'email' | 'password'
type FieldErrors = Partial<Record<Field, string>>

// Convierte el error del servidor en un mensaje por campo
function toFieldErrors(err: unknown): { fields: FieldErrors; general: string } {
  if (!(err instanceof ApiError)) return { fields: {}, general: 'Error de conexión' }

  const fields: FieldErrors = {}
  const body = err.body as { errors?: unknown } | null

  // Formato { errors: [{ field, message }] } o { errors: { campo: mensaje } }
  if (Array.isArray(body?.errors)) {
    for (const e of body.errors as { field: Field; message: string }[]) fields[e.field] = e.message
  } else if (body?.errors && typeof body.errors === 'object') {
    Object.assign(fields, body.errors)
  }

  // Si el servidor solo manda un mensaje (ej. 409), lo ubicamos por palabra clave
  if (Object.keys(fields).length === 0) {
    const msg = err.message.toLowerCase()
    if (msg.includes('email')) fields.email = err.message
    else if (msg.includes('name') || msg.includes('nombre')) fields.teamName = err.message
    else return { fields, general: err.message }
  }
  return { fields, general: '' }
}

export default function Register() {
  const { register, status } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ teamName: '', email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  if (status === 'in') return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    setFieldErrors({})
    setError('')
    try {
      await register(form.teamName, form.email, form.password)
      navigate('/', { replace: true })
    } catch (err) {
      const { fields, general } = toFieldErrors(err)
      setFieldErrors(fields)
      setError(general)
    } finally {
      setSending(false)
    }
  }

  function input(name: Field, label: string, type: string) {
    return (
      <div>
        <input
          type={type}
          placeholder={label}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className={`w-full rounded border p-2 ${fieldErrors[name] ? 'border-red-600' : ''}`}
          required
        />
        {fieldErrors[name] && <p className="text-sm text-red-600">{fieldErrors[name]}</p>}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50">
      <form onSubmit={handleSubmit} className="w-80 space-y-3 rounded bg-white p-6 shadow">
        <h1 className="text-xl font-bold">Registrar tripulación</h1>
        {input('teamName', 'Nombre del equipo', 'text')}
        {input('email', 'Email', 'email')}
        {input('password', 'Contraseña', 'password')}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={sending} className="w-full rounded bg-blue-900 p-2 text-white disabled:opacity-50">
          {sending ? 'Registrando...' : 'Registrar'}
        </button>
        <p className="text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-700 underline">Inicia sesión</Link>
        </p>
      </form>
    </div>
  )
}
