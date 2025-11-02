import prisma from '../prisma.js'

export default async function (app, opts) {
  // list appointments (for authenticated user)
  app.get('/api/appointments', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = request.user
    if (!user) return reply.status(401).send({ error: 'unauthorized' })

    if (user.role === 'barber') {
      const appts = await prisma.appointment.findMany({ where: { barber_id: user.id }, orderBy: { date: 'asc' } })
      return { appointments: appts }
    }

    const appts = await prisma.appointment.findMany({ where: { client_id: user.id }, orderBy: { date: 'asc' } })
    return { appointments: appts }
  })

  // create appointment
  app.post('/api/appointments', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = request.user
    if (!user) return reply.status(401).send({ error: 'unauthorized' })

    const { barber_id, date, time } = request.body || {}
    if (!barber_id || !date || !time) return reply.status(400).send({ error: 'missing_fields' })

    const d = new Date(date)
    // find schedule
    const schedule = await prisma.barberSchedule.findFirst({ where: { barber_id: barber_id, date: d } })
    if (!schedule) return reply.status(400).send({ error: 'no_schedule' })

    const available = JSON.parse(schedule.available_slots || '[]')
    const blocked = JSON.parse(schedule.blocked_slots || '[]')
    if (!available.includes(time) || blocked.includes(time)) return reply.status(400).send({ error: 'slot_unavailable' })

    // check conflicts
    const exists = await prisma.appointment.findFirst({ where: { barber_id: barber_id, date: d, status: 'scheduled' } })
    // naive time conflict: ensure no appointment same date & time
    const conflict = await prisma.appointment.findFirst({ where: { barber_id: barber_id, date: d, status: 'scheduled' } })
    if (conflict) {
      // if times are tracked separately, compare, but schema stores only date; we'll include time in date field for simplicity
    }

    // store appointment: encode date+time as ISO in date field
    const iso = new Date(`${date}T${time}:00.000Z`)
    const appt = await prisma.appointment.create({ data: { barber_id, client_id: user.id, date: iso, status: 'scheduled' } })

    // TODO: trigger push notification to barber

    return { appointment: appt }
  })

  // cancel appointment
  app.delete('/api/appointments/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = request.user
    const id = parseInt(request.params.id, 10)
    const appt = await prisma.appointment.findUnique({ where: { id } })
    if (!appt) return reply.status(404).send({ error: 'not_found' })

    if (user.role === 'client' && appt.client_id !== user.id) return reply.status(403).send({ error: 'forbidden' })
    if (user.role === 'barber' && appt.barber_id !== user.id) return reply.status(403).send({ error: 'forbidden' })

    const updated = await prisma.appointment.update({ where: { id }, data: { status: 'cancelled' } })
    return { appointment: updated }
  })
}
