// Tipos de la API. Revisar los nombres de campos contra Swagger:
// https://logpose-api-jg7f.onrender.com/docs

// Respuesta de GET /auth/me
export interface Team {
  user: { id: string; name: string; email: string }
  team: { code: string; name: string }
  expiresAt: string
}

export interface AuthResponse {
  token: string
}

export interface Crew {
  id: string
  name: string
}

export interface Wanted {
  id: string
  name: string
  epithet: string
  bounty: number
  status: string
  fruitType: string
  crewName: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
