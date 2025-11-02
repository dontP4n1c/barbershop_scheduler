import prisma from '../prisma.js'

export default async function (app, opts) {
  // list appointments (for authenticated user)
  app.get('/api/appointments', { preHandler: [app.auth()] }, async (request, reply) => {
    const user = request.user
    if (!user) return reply.status(401).send({ error: 'unauthorized' })

    const common = { orderBy: { date: 'asc' }, include: { barber: { select: { id: true, name: true } }, client: { select: { id: true, name: true } } } }
    if (user.role === 'barber') {
      const appts = await prisma.appointment.findMany({ where: { barber_id: user.id }, ...common })
      return { appointments: appts }
    }

    const appts = await prisma.appointment.findMany({ where: { client_id: user.id }, ...common })
    return { appointments: appts }
  })

  // create appointment
  app.post('/api/appointments', { preHandler: [app.auth()] }, async (request, reply) => {
    const user = request.user
    if (!user) return reply.status(401).send({ error: 'unauthorized' })

    const { barber_id, date, time } = request.body || {}
    if (!barber_id || !date || !time) return reply.status(400).send({ error: 'missing_fields' })

    // build ISO datetime (assume date YYYY-MM-DD and time HH:mm)
    const iso = new Date(`${date}T${time}:00.000Z`)

    // find schedule for the date (compare date-only)
    const dayStart = new Date(date + 'T00:00:00.000Z')
    const schedule = await prisma.barberSchedule.findFirst({ where: { barber_id: barber_id, date: dayStart } })
    if (!schedule) return reply.status(400).send({ error: 'no_schedule' })

    const available = JSON.parse(schedule.available_slots || '[]')
    const blocked = JSON.parse(schedule.blocked_slots || '[]')
    if (!available.includes(time) || blocked.includes(time)) return reply.status(400).send({ error: 'slot_unavailable' })

    // conflict check: ensure no existing appointment at exact same datetime for this barber
    const conflict = await prisma.appointment.findFirst({ where: { barber_id: barber_id, date: iso, status: 'scheduled' } })
    if (conflict) return reply.status(409).send({ error: 'conflict' })

    const appt = await prisma.appointment.create({ data: { barber_id, client_id: user.id, date: iso, status: 'scheduled' }, include: { barber: { select: { id: true, name: true } }, client: { select: { id: true, name: true } } } })

    // TODO: trigger push notification to barber

    return { appointment: appt }
  })

  // cancel appointment
  app.delete('/api/appointments/:id', { preHandler: [app.auth()] }, async (request, reply) => {
    const user = request.user
    const id = parseInt(request.params.id, 10)
    const appt = await prisma.appointment.findUnique({ where: { id } })
    if (!appt) return reply.status(404).send({ error: 'not_found' })

    if (user.role === 'client' && appt.client_id !== user.id) return reply.status(403).send({ error: 'forbidden' })
    if (user.role === 'barber' && appt.barber_id !== user.id) return reply.status(403).send({ error: 'forbidden' })

    const updated = await prisma.appointment.update({ where: { id }, data: { status: 'cancelled' } })
    return { appointment: updated }
  })

  // mark as completed (barber or admin)
  app.patch('/api/appointments/:id/complete', { preHandler: [app.auth(['barber','admin'])] }, async (request, reply) => {
    const id = parseInt(request.params.id, 10)
    const appt = await prisma.appointment.findUnique({ where: { id } })
    if (!appt) return reply.status(404).send({ error: 'not_found' })
    const updated = await prisma.appointment.update({ where: { id }, data: { status: 'completed' } })
    return { appointment: updated }
  })
}
