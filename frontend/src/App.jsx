import { useEffect, useState } from 'react'
import axios from './api'

export default function App() {
  const [status, setStatus] = useState('...')
  useEffect(() => {
    axios.get('/api/health').then(res => setStatus(res.data.status)).catch(() => setStatus('erro'))
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow text-center">
        <h1 className="text-2xl font-semibold">Barbearia - Etapa 1</h1>
        <p className="mt-2 text-gray-600">API status: {status}</p>
      </div>
    </div>
  )
}
