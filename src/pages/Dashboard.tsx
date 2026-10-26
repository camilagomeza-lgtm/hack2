import { useFetch } from '../useFetch'
import { Empty, ErrorBox, Loading } from '../components/States'

type Data = Record<string, unknown>

// Muestra cada campo que manda el servidor como una tarjeta
function Cards({ data }: { data: Data }) {
  const entries = Object.entries(data).filter(([, v]) => typeof v !== 'object' || v === null)
  if (entries.length === 0) return <Empty text="Sin datos todavía." />

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded bg-white p-4 shadow">
          <p className="text-sm text-gray-500">{key}</p>
          <p className="text-xl font-bold">{String(value)}</p>
        </div>
      ))}
    </div>
  )
}

function Section({ title, path }: { title: string; path: string }) {
  const { data, loading, error, reload } = useFetch<Data>(path)

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading || !data ? (
        <Loading />
      ) : (
        <Cards data={data} />
      )}
    </section>
  )
}

export default function Dashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <Section title="Resumen de la tripulación" path="/dashboard/summary" />
      <Section title="Log Pose" path="/log-pose" />
    </div>
  )
}
