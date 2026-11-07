import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useAuth } from './lib/auth'

function RequireAdmin({ children }: { children: ReactElement }) {
  const { session, isAdmin, loading } = useAuth()
  if (loading) return <p className="p-8">Chargement…</p>
  if (!session) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/admin/login?refuse=1" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
