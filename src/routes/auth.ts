import type { FastifyInstance } from 'fastify'
import * as db from '../utils/db.js'
import { z } from 'zod'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'

const registerLoginSchema = {
    body: z.object({
        email: z.email(),
        password: z.string().min(8),
    })
}

const profileSchema = {
    params: z.object({
        email: z.email(),
    })
}

export async function authRoutes(fastify: FastifyInstance) {
    // POST - REGISTER
    fastify.withTypeProvider<ZodTypeProvider>().post('/register', { schema: registerLoginSchema }, function (request, reply) {
        db.createUser('test', 'pw123')
        reply.send({ hello: 'world' })
    })

    // POST - LOGIN
    fastify.withTypeProvider<ZodTypeProvider>().post('/login', { schema: registerLoginSchema }, function (request, reply) {
        reply.send({ ok: true })
    })

    // GET - Profile
    fastify.withTypeProvider<ZodTypeProvider>().get('/profile/:email', { schema: profileSchema }, function (request, reply) {
        reply.send({ params: request.params })
    })
}
