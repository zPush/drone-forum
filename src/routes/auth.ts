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
    fastify.withTypeProvider<ZodTypeProvider>().post('/register', { schema: registerLoginSchema }, async function (request, reply) {
        try {
            await db.createUser(
                request.body.email,
                request.body.password
            )
        } catch(e) {
            //@ts-ignore
            if (e.cause?.code == '23505') {
                reply.status(409).send({ error: 'Email already taken' })
            } else {
                reply.status(500).send({ success: false, message: 'Could not create user' })
            }
        }

        reply.status(201).send({ success: true })
    })

    // POST - LOGIN
    fastify.withTypeProvider<ZodTypeProvider>().post('/login', { schema: registerLoginSchema }, function (request, reply) {
        reply.send({ ok: true })
    })

    // GET - Get Profile
    fastify.withTypeProvider<ZodTypeProvider>().get('/profile/:email', { schema: profileSchema }, function (request, reply) {
        reply.send({ params: request.params })
    })

    // DELETE - Delete Profile
    fastify.withTypeProvider<ZodTypeProvider>().delete('/delete/:email', { schema: profileSchema }, async function(request, reply) {
        try {
            await db.deleteUser(request.params.email)
        } catch(e) {
            console.log(e)
            reply.status(500).send({ error: e })
        }

        reply.status(200).send({ success: true })
    })
}
