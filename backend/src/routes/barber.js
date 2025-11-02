import { randomBytes } from 'crypto'
import prisma from '../prisma.js'

export default async function (app, opts) {
  // list barbers
  app.get('/api/barbers', async (request, reply) => {
    const barbers = await prisma.user.findMany({ where: { role: 'barber' }, select: { id: true, name: true, email: true, phone: true } })
    return { barbers }
  })

  // admin: generate invite token for barber registration
  app.post('/api/barbers/token', { preHandler: [app.auth(['admin'])] }, async (request, reply) => {
    const requester = request.user

    const { barber_id } = request.body || {}
    const token = randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

    const entry = await prisma.token.create({ data: { token, type: 'barber_invite', barber_id: barber_id || null, expiresAt } })
    return { token: entry.token, expiresAt: entry.expiresAt }
  })

  // set availability (barber only)
  app.post('/api/barbers/:id/schedule', { preHandler: [app.auth(['barber','admin'])] }, async (request, reply) => {
    const requester = request.user
    const barberId = parseInt(request.params.id, 10)
    if (!requester) return reply.status(401).send({ error: 'unauthorized' })
    if (requester.role !== 'barber' && requester.role !== 'admin') return reply.status(403).send({ error: 'forbidden' })
    if (requester.role === 'barber' && requester.id !== barberId) return reply.status(403).send({ error: 'forbidden' })

    const { date, available_slots } = request.body || {}
    if (!date || !available_slots) return reply.status(400).send({ error: 'missing_fields' })

    const data = { barber_id: barberId, date: new Date(date), available_slots: JSON.stringify(available_slots), blocked_slots: JSON.stringify([]) }
    // upsert
    const existing = await prisma.barberSchedule.findFirst({ where: { barber_id: barberId, date: new Date(date) } })
    if (existing) {
      const updated = await prisma.barberSchedule.update({ where: { id: existing.id }, data: { available_slots: data.available_slots } })
      return { schedule: updated }
    }

    const created = await prisma.barberSchedule.create({ data })
    return { schedule: created }
  })

  // get schedule for date
  app.get('/api/barbers/:id/schedule', async (request, reply) => {
    const barberId = parseInt(request.params.id, 10)
    const dateQ = request.query.date
    if (!dateQ) return reply.status(400).send({ error: 'missing_date' })
    const date = new Date(dateQ)
    const schedule = await prisma.barberSchedule.findFirst({ where: { barber_id: barberId, date } })
    if (!schedule) return { schedule: null }
    return { schedule: { ...schedule, available_slots: JSON.parse(schedule.available_slots), blocked_slots: JSON.parse(schedule.blocked_slots) } }
  })

  // block slots (barber only)
  app.post('/api/barbers/:id/schedule/block', { preHandler: [app.auth(['barber','admin'])] }, async (request, reply) => {
    const requester = request.user
    const barberId = parseInt(request.params.id, 10)
    if (!requester) return reply.status(401).send({ error: 'unauthorized' })
    if (requester.role !== 'barber' && requester.role !== 'admin') return reply.status(403).send({ error: 'forbidden' })
    if (requester.role === 'barber' && requester.id !== barberId) return reply.status(403).send({ error: 'forbidden' })

    const { date, blocked_slots } = request.body || {}
    if (!date || !blocked_slots) return reply.status(400).send({ error: 'missing_fields' })

    const d = new Date(date)
    const existing = await prisma.barberSchedule.findFirst({ where: { barber_id: barberId, date: d } })
    if (!existing) return reply.status(404).send({ error: 'no_schedule' })

    const merged = Array.from(new Set([...(JSON.parse(existing.blocked_slots) || []), ...blocked_slots]))
    const updated = await prisma.barberSchedule.update({ where: { id: existing.id }, data: { blocked_slots: JSON.stringify(merged) } })
    return { schedule: { ...updated, available_slots: JSON.parse(updated.available_slots), blocked_slots: merged } }
  })
}
