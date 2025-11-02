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

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-3">Meus Agendamentos</h2>
      {loading && <div>Carregando...</div>}
      {!loading && appts.length === 0 && <div className="text-sm text-gray-600">Nenhum agendamento</div>}
      <div className="space-y-3">
        {appts.map(a => (
          <div key={a.id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-medium">Barbeiro ID: {a.barber_id}</div>
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
  )
}
