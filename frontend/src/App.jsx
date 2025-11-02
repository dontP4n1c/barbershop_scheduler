import { useEffect, useState } from 'react'
import api from './api'
import useAuth from './store'
import Login from './pages/Login'
import Register from './pages/Register'
import BarberList from './components/BarberList'
import MyAppointments from './components/MyAppointments'

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
          (window.location.hash === '#register') ? <Register /> : <Login />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>Olá, <strong>{user.name}</strong> ({user.role})</div>
              <div>
                <button className="text-sm text-red-600" onClick={logout}>Sair</button>
              </div>
            </div>

            <div className="mb-4">
              <nav className="flex gap-3">
                <TabButton id="barbers">Barbeiros</TabButton>
                <TabButton id="my">Meus Agendamentos</TabButton>
              </nav>
            </div>

            <div>
              {activeTab === 'barbers' && <BarberList />}
              {activeTab === 'my' && <MyAppointments />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({ id, children }) {
  const [activeTab, setActiveTab] = useState(null)
  // lift selected tab to root component via localStorage simple approach
  const active = typeof window !== 'undefined' ? localStorage.getItem('tab') || 'barbers' : 'barbers'
  const handle = () => { localStorage.setItem('tab', id); window.location.reload() }
  return (
    <button onClick={handle} className={`px-3 py-1 rounded ${active===id? 'bg-blue-600 text-white': 'bg-white'}`}>{children}</button>
  )
}

// initialize activeTab from localStorage
const activeTab = (typeof window !== 'undefined') ? (localStorage.getItem('tab') || 'barbers') : 'barbers'
