// Tipos de la API. Revisar los nombres de campos contra Swagger:
// https://logpose-api-jg7f.onrender.com/docs

export interface Team {
  teamName: string
  teamCode: string
  email: string
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
