import { useEffect, useState } from 'react'
import { api } from './api'

// Hace GET a `path` cada vez que cambia. Si `path` cambia antes de que llegue
// la respuesta anterior, esa respuesta se ignora (y se cancela con AbortController).
// Mientras carga se conserva `data` anterior para que el layout no salte.
export function useFetch<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(path !== null)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (path === null) return
    const controller = new AbortController()
    let ignore = false

    setLoading(true)
    setError('')
    api<T>(path, { signal: controller.signal })
      .then((res) => {
        if (!ignore) setData(res)
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof Error ? err.message : 'Error')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    // Se ejecuta al cambiar `path` o al desmontar: la respuesta vieja ya no cuenta
    return () => {
      ignore = true
      controller.abort()
    }
  }, [path, reloadKey])

  const reload = () => setReloadKey((k) => k + 1)

  return { data, loading, error, reload }
}
