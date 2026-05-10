import type { FastifyInstance } from 'fastify'
import * as db from '../utils/db.js'
import { z } from 'zod'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js'
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt";
import { verifyToken } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'

const registerLoginSchema = {
    body: z.object({
        email: z.email(),
        password: z.string().min(8),
    })
}

const profileSchema = {
    params: z.object({
        email: z.string()
    })
}

const changePasswordSchema = {
    body: z.object({
        currentPassword: z.string().min(8),
        newPassword: z.string().min(8),
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
                return reply.status(409).send({ error: 'Email already taken' })
            }
            logger.error(`Register failed: ${e}`)
            return reply.status(500).send({ success: false, message: 'Could not create user' })
        }
        return reply.status(201).send({ success: true })
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
            return reply.status(401).send({ error: 'Credentials do not match.' })
        }
        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        reply.setCookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/api/v1/auth/refresh'
        })

        return reply.status(200).send({ accessToken: accessToken })
    })

    // GET - Get Profile
    fastify.withTypeProvider<ZodTypeProvider>().get('/profile', { preHandler: verifyToken }, async function (request, reply) {
        const user = await db.getUserById(request.userId)
        if (!user) {
            return reply.status(404).send({ error: 'User not found' })
        }
        return reply.send({ data: { id: user.id, email: user.email } })
    })

    // POST - Change password
    fastify.withTypeProvider<ZodTypeProvider>().post('/changePassword', { preHandler: verifyToken, schema: changePasswordSchema }, async function (request, reply) {
        const user = await db.getUserById(request.userId)
        if (!user) {
            return reply.status(404).send({ error: 'User not found' })
        }

        // Check if entered password matches current password to reset
        const match = await bcrypt.compare(request.body.currentPassword, user.password)
        if (!match) return reply.status(401).send({ error: 'Wrong password' })

        // Check if user want to set his password to current password
        if (request.body.currentPassword == request.body.newPassword) return reply.status(400).send({error: 'Set a different password.'})

        const hashedNew = await bcrypt.hash(request.body.newPassword, 10)
        await db.updatePassword(request.userId, hashedNew)
        return reply.status(200).send({ success: true })
    })

    // DELETE - Delete Profile
    fastify.withTypeProvider<ZodTypeProvider>().delete('/delete/:email', { preHandler: verifyToken, schema: profileSchema }, async function (request, reply) {
        try {
            await db.deleteUser(request.userId)
            return reply.status(200).send({ success: true })
        } catch (e) {
            logger.error(`Delete user failed: ${e}`)
            return reply.status(500).send({ error: 'Could not delete user' })
        }
    })

    const refreshToken = process.env.REFRESH_TOKEN_SECRET

    // POST - Refresh token
    fastify.withTypeProvider<ZodTypeProvider>().post('/refresh', async function (request, reply) {
        if (!request.cookies.refreshToken) {
            return reply.status(401).send('Not authorized.')
        }

        try {
            const payload = jwt.verify(request.cookies.refreshToken, refreshToken!) as unknown as { userId: string }

            return reply.status(200).send({ accessToken: generateAccessToken(payload.userId) })
        } catch (e) {
            logger.warn(`Refresh token invalid: ${e}`)
            return reply.status(401).send('Invalid or expired token')
        }
    })

    // Logout (clear token)
    fastify.post('/logout', async function (request, reply) {
    reply.clearCookie('refreshToken', {
        path: '/api/v1/auth/refresh'
    })
    return reply.status(200).send({ success: true })
})
}
