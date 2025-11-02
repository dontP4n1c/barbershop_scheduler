import { useEffect, useState } from 'react'
import api from '../api'

export default function BookingForm({ barber, onDone }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [schedule, setSchedule] = useState(null)
  const [slot, setSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    fetchSchedule()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const fetchSchedule = async () => {
    try {
      const res = await api.get(`/api/barbers/${barber.id}/schedule?date=${date}`)
      setSchedule(res.data.schedule)
      setSlot(null)
    } catch (err) {
      setSchedule(null)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!slot) return setMsg('selecione um horário')
    setLoading(true); setMsg(null)
    try {
      const res = await api.post('/api/appointments', { barber_id: barber.id, date, time: slot })
      setMsg('agendamento criado')
      if (onDone) onDone()
    } catch (err) {
      setMsg(err?.response?.data?.error || 'erro')
    } finally { setLoading(false) }
  }

  const available = schedule?.available_slots || []
  const blocked = schedule?.blocked_slots || []

  return (
    <div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Data</label>
          <input type="date" className="border p-2 rounded" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm mb-2">Horários</label>
          <div className="grid grid-cols-3 gap-2">
            {available.length === 0 && <div className="text-sm text-gray-600">Sem horários disponíveis</div>}
            {available.map(s => {
              const disabled = blocked.includes(s)
              return (
                <button key={s} type="button" onClick={() => !disabled && setSlot(s)} className={`p-2 rounded border ${slot===s? 'bg-blue-600 text-white': 'bg-white'} ${disabled ? 'opacity-50 line-through' : ''}`} disabled={disabled}>{s}</button>
              )
            })}
          </div>
        </div>

        {msg && <div className="text-sm text-green-600">{msg}</div>}

        <div className="flex items-center gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? '...' : 'Confirmar'}</button>
          <button type="button" className="text-gray-600" onClick={() => onDone && onDone()}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
//comentarios