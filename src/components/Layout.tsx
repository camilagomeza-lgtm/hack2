import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Layout() {
  const { team, logout } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'font-bold underline' : 'hover:underline'

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="flex items-center gap-6 bg-blue-900 px-6 py-3 text-white">
        <span className="font-bold">Log Pose Console</span>
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/wanted" className={linkClass}>
          Se Busca
        </NavLink>
        <span className="ml-auto text-sm">
          {team?.team.name} ({team?.team.code})
        </span>
        <button onClick={logout} className="rounded bg-white px-3 py-1 text-blue-900">
          Salir
        </button>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>
    </div>
  )
}
