import { useEffect, useState } from 'react'
import api from '../api'
import BookingForm from './BookingForm'

export default function BarberList() {
  const [barbers, setBarbers] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/api/barbers').then(res => setBarbers(res.data.barbers)).catch(() => setBarbers([]))
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {barbers.map(b => (
          <div key={b.id} className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{b.name} {b.status !== 'active' && <span className="text-xs text-gray-500">({b.status})</span>}</div>
                <div className="text-sm text-gray-600">{b.specialty || 'Geral'}</div>
                <div className="text-sm text-gray-600">{b.email}</div>
              </div>
              <div>
                <button className="text-sm text-blue-600" onClick={() => setSelected(b)}>Agendar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-3">
            <div>Agendando com <strong>{selected.name}</strong></div>
            <button className="text-sm text-gray-600" onClick={() => setSelected(null)}>Fechar</button>
          </div>
          <BookingForm barber={selected} onDone={() => setSelected(null)} />
        </div>
      )}
    </div>
  )
}
//comentarios
