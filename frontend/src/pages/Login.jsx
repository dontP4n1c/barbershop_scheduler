import { useState } from 'react'
import api from '../api'
import useAuth from '../store'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const setAuth = useAuth(state => state.setAuth)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      const { token, user } = res.data
      setAuth(token, user)
    } catch (err) {
      setError(err?.response?.data?.error || 'erro')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Entrar</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Email</label>
          <input className="w-full border p-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Senha</label>
          <input type="password" className="w-full border p-2 rounded" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex items-center justify-between">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? '...' : 'Entrar'}</button>
        </div>
      </form>
    </div>
  )
}
