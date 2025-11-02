import { useEffect, useState } from 'react'
import api from './api'
import useAuth from './store'
import Login from './pages/Login'
import BarberList from './components/BarberList'

export default function App() {
  const [status, setStatus] = useState('...')
  const { user, logout } = useAuth()
  useEffect(() => {
    api.get('/api/health').then(res => setStatus(res.data.status)).catch(() => setStatus('erro'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Barbearia</h1>
          <div className="text-sm text-gray-600">API: {status}</div>
        </header>

        {!user ? (
          <Login />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>Olá, <strong>{user.name}</strong> ({user.role})</div>
              <div>
                <button className="text-sm text-red-600" onClick={logout}>Sair</button>
              </div>
            </div>
            <BarberList />
          </div>
        )}
      </div>
    </div>
  )
}
