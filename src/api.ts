// Cliente HTTP: un solo lugar donde se arma la URL, se agrega el token y se manejan errores.

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const TOKEN_KEY = 'token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// Error con el status y el cuerpo que mandó el servidor
export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

// AuthContext registra aquí qué hacer cuando el token deja de ser válido (401)
let onUnauthorized: () => void = () => {}
export function setOnUnauthorized(fn: () => void) {
  onUnauthorized = fn
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(BASE_URL + path, { ...options, headers })
  const text = await res.text()
  const body: unknown = text ? JSON.parse(text) : null

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized()
    throw new ApiError(res.status, errorMessage(body, res.status), body)
  }
  return body as T
}

function errorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    return body.message
  }
  return `Error ${status}`
}
