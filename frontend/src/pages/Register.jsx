import { useState } from 'react'
import api from '../api'
import useAuth from '../store'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')
  const [inviteToken, setInviteToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const setAuth = useAuth(state => state.setAuth)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const body = { name, email, phone, password, role }
      if (role === 'barber') body.invite_token = inviteToken
      const res = await api.post('/api/auth/register', body)
      const { token, user } = res.data
      setAuth(token, user)
    } catch (err) {
      setError(err?.response?.data?.error || 'erro')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Cadastro</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Nome</label>
          <input className="w-full border p-2 rounded" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input className="w-full border p-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Telefone</label>
          <input className="w-full border p-2 rounded" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Senha</label>
          <input type="password" className="w-full border p-2 rounded" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Tipo</label>
          <select className="w-full border p-2 rounded" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="client">Cliente</option>
            <option value="barber">Barbeiro</option>
          </select>
        </div>
        {role === 'barber' && (
          <div>
            <label className="block text-sm">Token convite (fornecido pelo admin)</label>
            <input className="w-full border p-2 rounded" value={inviteToken} onChange={e=>setInviteToken(e.target.value)} />
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex items-center justify-between">
          <button className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? '...' : 'Criar conta'}</button>
        </div>
      </form>
    </div>
  )
}
