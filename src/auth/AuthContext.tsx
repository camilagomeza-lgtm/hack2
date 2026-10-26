import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getToken, setOnUnauthorized, setToken } from '../api'
import type { AuthResponse, Team } from '../types'

// 'checking' = hay token guardado y lo estamos validando con /auth/me
type Status = 'checking' | 'in' | 'out'

interface AuthValue {
  team: Team | null
  status: Status
  login: (email: string, password: string) => Promise<void>
  register: (teamName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<Team | null>(null)
  const [status, setStatus] = useState<Status>(getToken() ? 'checking' : 'out')

  function logout() {
    setToken(null)
    setTeam(null)
    setStatus('out')
  }

  // Guarda el token y trae los datos del equipo
  async function startSession(token: string) {
    setToken(token)
    const me = await api<Team>('/auth/me')
    setTeam(me)
    setStatus('in')
  }

  useEffect(() => {
    // Si cualquier request responde 401, cerramos sesión (PrivateRoute manda al login)
    setOnUnauthorized(logout)

    // Restaurar sesión al recargar
    if (getToken()) {
      api<Team>('/auth/me')
        .then((me) => {
          setTeam(me)
          setStatus('in')
        })
        .catch(logout)
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    await startSession(res.token)
  }

  async function register(teamName: string, email: string, password: string) {
    const res = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ teamName, email, password }),
    })
    await startSession(res.token)
  }

  return (
    <AuthContext.Provider value={{ team, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
