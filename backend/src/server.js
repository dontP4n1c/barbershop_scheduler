import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import fastifyJwt from '@fastify/jwt'
import bcrypt from 'bcryptjs'
import prisma from './prisma.js'

dotenv.config()

const app = Fastify({ logger: true })
await app.register(cors, { origin: true })

await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'dev_jwt_secret',
  cookie: false,
})

// auth helper
app.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

app.get('/api/health', async () => ({ status: 'ok' }))

// Register
app.post('/api/auth/register', async (request, reply) => {
  const { name, email, phone, password, role } = request.body || {}
  if (!email || !password || !name) return reply.status(400).send({ error: 'missing_fields' })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return reply.status(409).send({ error: 'user_exists' })

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, password_hash: hash, role: role || 'client' },
    select: { id: true, name: true, email: true, role: true },
  })

  const token = app.jwt.sign({ id: user.id, role: user.role })
  return reply.send({ user, token })
})

// Login
app.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body || {}
  if (!email || !password) return reply.status(400).send({ error: 'missing_fields' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return reply.status(401).send({ error: 'invalid_credentials' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return reply.status(401).send({ error: 'invalid_credentials' })

  const token = app.jwt.sign({ id: user.id, role: user.role })
  return reply.send({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

// Protected example
app.get('/api/me', { preHandler: [app.authenticate] }, async (request) => {
  const userId = request.user?.id
  if (!userId) return { error: 'not_authenticated' }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true, phone: true } })
  return { user }
})

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001
const HOST = process.env.HOST || '0.0.0.0'

try {
  await app.listen({ port: PORT, host: HOST })
  app.log.info(`API listening on ${HOST}:${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
