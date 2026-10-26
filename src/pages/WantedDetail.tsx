import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useFetch } from '../useFetch'
import { ErrorBox, Loading } from '../components/States'
import type { Wanted } from '../types'

export default function WantedDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data, loading, error, reload } = useFetch<Wanted>(`/wanted/${id}`)

  // Si venimos del listado, "atrás" vuelve a la misma URL con sus filtros y página
  function goBack() {
    const state = location.state as { fromList?: boolean } | null
    if (state?.fromList) navigate(-1)
    else navigate('/wanted')
  }

  return (
    <div>
      <button onClick={goBack} className="mb-4 text-blue-700 underline">
        ← Volver al listado
      </button>
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading || !data ? (
        <Loading />
      ) : (
        <div className="rounded bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="mb-4 text-gray-500">"{data.epithet}"</p>
          <p className="mb-4 font-mono text-3xl">฿ {data.bounty.toLocaleString()}</p>
          <p>Estado: {data.status}</p>
          <p>Tripulación: {data.crewName}</p>
          <p>Fruta del diablo: {data.fruitType}</p>
        </div>
      )}
    </div>
  )
}
