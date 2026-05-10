import type { FastifyInstance } from 'fastify'
import * as db from '../utils/db.js'
import { z } from 'zod'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js'
import jwt from 'jsonwebtoken'


import bcrypt from "bcrypt";

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
            const password = request.body.password
            const hashedPassword = await bcrypt.hash(password, 10)
            await db.createUser(
                request.body.email,
                hashedPassword
            )
        } catch (e) {
            //@ts-ignore
            if (e.cause?.code == '23505') {
                reply.status(409).send({ error: 'Email already taken' })
            } else {
                reply.status(500).send({ success: false, message: 'Could not create user' })
                console.log(e)
            }
            return reply.status(500).send({ success: false, message: 'Could not create user' })
        }
    })

    // POST - LOGIN
    fastify.withTypeProvider<ZodTypeProvider>().post('/login', { schema: registerLoginSchema }, async function (request, reply) {
        const user = await db.getUser(request.body.email)
        // user not found 404 missing
        if (!user) {
            return reply.status(401).send({ error: 'Invalid credentials' })
        }

        // compare passwords
        const passwordsMatch = await bcrypt.compare(request.body.password, user.password)
        if (!passwordsMatch) {
            return reply.status(401).send({ error: 'Credentials do not match.'})
        }
        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        reply.setCookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/api/v1/auth/refresh'
        })

        reply.status(200).send({ accessToken: accessToken })
    })

    // GET - Get Profile
    fastify.withTypeProvider<ZodTypeProvider>().get('/profile/:email', { schema: profileSchema }, async function (request, reply) {
        const user = await db.getUser(request.params.email)
        if (!user) {
            return reply.status(404).send({ error: 'User not found' })
        }
        return reply.send({ data: { id: user.id, email: user.email } })
    })

    // DELETE - Delete Profile
    fastify.withTypeProvider<ZodTypeProvider>().delete('/delete/:email', { schema: profileSchema }, async function (request, reply) {
        try {
            await db.deleteUser(request.params.email)
        } catch (e) {
            console.log(e)
            reply.status(500).send({ error: e })
        }

        reply.status(200).send({ success: true })
    })

    const refreshToken = process.env.REFRESH_TOKEN_SECRET
    // GET - Refresh token
    fastify.withTypeProvider<ZodTypeProvider>().post('/refresh', async function (request, reply) {
        if (!request.cookies.refreshToken) {
            return reply.status(401).send('Not authorized.')
        }

        try {
            const payload = jwt.verify(request.cookies.refreshToken, refreshToken!) as unknown as { userId: string }

            return reply.status(200).send({accessToken: generateAccessToken(payload.userId)})
        } catch(e) {
            console.log(e)
            return reply.status(401).send('Invalid or expired token')
        }
    })
}
