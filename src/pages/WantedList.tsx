import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useFetch } from '../useFetch'
import { Empty, ErrorBox } from '../components/States'
import type { Crew, Page, Wanted } from '../types'

// Valores permitidos. Revisar los enums de status y fruit en Swagger.
const SIZES = [10, 20, 50]
const SORTS = [
  { value: 'bounty,desc', label: 'Mayor recompensa' },
  { value: 'name,asc', label: 'Nombre A-Z' },
  { value: 'updatedAt,desc', label: 'Actualizados recientemente' },
]
const STATUSES = ['WANTED', 'CAPTURED', 'ESCAPED']
const FRUITS = ['PARAMECIA', 'ZOAN', 'LOGIA', 'NONE']

const DEFAULT_SIZE = 10
const DEFAULT_SORT = 'bounty,desc'

// Lee la URL y descarta lo inválido: una URL rota nunca rompe la vista
function readParams(sp: URLSearchParams) {
  const page = Number(sp.get('page'))
  const size = Number(sp.get('size'))
  const sort = sp.get('sort') ?? ''
  const status = sp.get('status') ?? ''
  const fruit = sp.get('fruit') ?? ''
  const crewId = sp.get('crewId') ?? ''

  return {
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    size: SIZES.includes(size) ? size : DEFAULT_SIZE,
    sort: SORTS.some((s) => s.value === sort) ? sort : DEFAULT_SORT,
    status: STATUSES.includes(status) ? status : '',
    fruit: FRUITS.includes(fruit) ? fruit : '',
    crewId: /^[\w-]+$/.test(crewId) ? crewId : '',
    q: (sp.get('q') ?? '').trim(),
  }
}

export default function WantedList() {
  // La URL es la única fuente de verdad del estado del listado
  const [searchParams, setSearchParams] = useSearchParams()
  const params = readParams(searchParams)

  // Cambia valores en la URL. Por defecto vuelve a la página 0,
  // así un filtro nuevo nunca deja al usuario en una página que ya no existe.
  function update(changes: Record<string, string>, resetPage = true) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value === '') next.delete(key)
      else next.set(key, value)
    }
    if (resetPage) next.delete('page')
    setSearchParams(next)
  }

  // Búsqueda con debounce: solo actualiza la URL 400 ms después de la última tecla
  const [text, setText] = useState(params.q)
  useEffect(() => setText(params.q), [params.q]) // sincroniza con atrás/adelante
  useEffect(() => {
    if (text.trim() === params.q) return
    const timer = setTimeout(() => update({ q: text.trim() }), 400)
    return () => clearTimeout(timer)
  })

  // Request al servidor armada solo con valores válidos
  const query = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sort: params.sort,
  })
  if (params.status) query.set('status', params.status)
  if (params.crewId) query.set('crewId', params.crewId)
  if (params.fruit) query.set('fruit', params.fruit)
  if (params.q) query.set('q', params.q)

  const { data, loading, error, reload } = useFetch<Page<Wanted>>(`/wanted?${query}`)
  const crews = useFetch<Crew[]>('/crews')

  // Si la página de la URL ya no existe, saltamos a la última que sí existe
  useEffect(() => {
    // Solo con la respuesta de la página actual (no una vieja)
    if (!data || loading || data.page !== params.page) return
    const last = Math.max(data.totalPages - 1, 0)
    if (params.page > last) update({ page: last === 0 ? '' : String(last) }, false)
  })

  const select = 'rounded border bg-white p-2'

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Se Busca</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          placeholder="Buscar por nombre o epíteto"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded border p-2"
        />
        <select value={params.status} onChange={(e) => update({ status: e.target.value })} className={select}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={params.crewId} onChange={(e) => update({ crewId: e.target.value })} className={select}>
          <option value="">Todas las tripulaciones</option>
          {crews.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={params.fruit} onChange={(e) => update({ fruit: e.target.value })} className={select}>
          <option value="">Todas las frutas</option>
          {FRUITS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select value={params.sort} onChange={(e) => update({ sort: e.target.value })} className={select}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select value={params.size} onChange={(e) => update({ size: e.target.value })} className={select}>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s} por página
            </option>
          ))}
        </select>
      </div>

      {/* Alto mínimo fijo: loading, error y vacío ocupan el mismo espacio */}
      <div className="relative min-h-[500px] rounded bg-white shadow">
        {error ? (
          <ErrorBox message={error} onRetry={reload} />
        ) : !data ? (
          <p className="p-6 text-center text-gray-500">Cargando...</p>
        ) : data.content.length === 0 ? (
          <Empty text="No hay carteles con esos filtros." />
        ) : (
          <ul className={loading ? 'opacity-50' : ''}>
            {data.content.map((w) => (
              <li key={w.id} className="border-b last:border-0">
                <Link to={`/wanted/${w.id}`} state={{ fromList: true }} className="flex justify-between p-3 hover:bg-amber-50">
                  <span>
                    <b>{w.name}</b> <span className="text-gray-500">"{w.epithet}"</span>
                  </span>
                  <span className="font-mono">฿ {w.bounty.toLocaleString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {loading && data && <p className="absolute top-2 right-3 text-sm text-gray-500">Cargando...</p>}
      </div>

      {data && data.totalPages > 0 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            disabled={params.page === 0}
            onClick={() => update({ page: String(params.page - 1) }, false)}
            className="rounded border bg-white px-3 py-1 disabled:opacity-40"
          >
            Anterior
          </button>
          <span>
            Página {params.page + 1} de {data.totalPages} ({data.totalElements} carteles)
          </span>
          <button
            disabled={params.page >= data.totalPages - 1}
            onClick={() => update({ page: String(params.page + 1) }, false)}
            className="rounded border bg-white px-3 py-1 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
