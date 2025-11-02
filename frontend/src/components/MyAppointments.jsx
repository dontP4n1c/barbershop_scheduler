import { useEffect, useState } from 'react'
import api from '../api'

export default function MyAppointments() {
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/appointments')
      setAppts(res.data.appointments || [])
    } catch (err) {
      setAppts([])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const cancel = async (id) => {
    if (!confirm('Cancelar este agendamento?')) return
    try {
      await api.delete(`/api/appointments/${id}`)
      setAppts(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      alert('Erro ao cancelar')
    }
  }

  const now = new Date()
  const upcoming = appts.filter(a => new Date(a.date) >= now && a.status === 'scheduled')
  const history = appts.filter(a => new Date(a.date) < now || a.status !== 'scheduled')

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-semibold mb-3">Próximos</h2>
        {loading && <div>Carregando...</div>}
        {!loading && upcoming.length === 0 && <div className="text-sm text-gray-600">Nenhum agendamento futuro</div>}
        <div className="space-y-3">
          {upcoming.map(a => (
            <div key={a.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{a.barber?.name || `Barbeiro ${a.barber_id}`}</div>
                <div className="text-sm text-gray-600">{new Date(a.date).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Status: {a.status}</div>
              </div>
              <div>
                {a.status === 'scheduled' && <button className="text-sm text-red-600" onClick={() => cancel(a.id)}>Cancelar</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Histórico</h2>
        {!loading && history.length === 0 && <div className="text-sm text-gray-600">Sem histórico</div>}
        <div className="space-y-3">
          {history.map(a => (
            <div key={a.id} className="p-3 border rounded">
              <div className="font-medium">{a.barber?.name || `Barbeiro ${a.barber_id}`}</div>
              <div className="text-sm text-gray-600">{new Date(a.date).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Status: {a.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
