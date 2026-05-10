import type { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

declare module 'fastify' {
    interface FastifyRequest {
        userId: string
    }
}

export async function verifyToken(req: FastifyRequest, reply: FastifyReply) {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Missing token' })
    }

    const token = header.split(' ')[1]

    if (!token) {
        return reply.status(500).send({ error: 'Token missing' })
    }

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as unknown as { userId: string }
        req.userId = payload.userId
    } catch (e) {
        return reply.status(401).send({ error: 'Invalid or expired token' })
    }
}