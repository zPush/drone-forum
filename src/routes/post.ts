import type { FastifyInstance } from 'fastify'
import * as db from '../utils/db.js'
import { z } from 'zod'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'

const postSchema = {
    body: z.object({
        title: z.string().min(8),
        content: z.string().min(8),
        author: z.string().min(8)
    })
}

const deletPostSchema = {
    params: z.object({
        id: z.uuid()
    })
}

export async function postRoutes(fastify: FastifyInstance) {
    // POST - User Post
    fastify.withTypeProvider<ZodTypeProvider>().post('/post', {schema: postSchema }, async function(request, reply) {
        try {
            db.createPost(
                request.body.title,
                request.body.content,
                request.body.author
            )
        } catch (e) {
            reply.status(500).send({ error: e })
        }
        reply.status(200).send({ success: true })
    })

    fastify.withTypeProvider<ZodTypeProvider>().delete('/post/:id', {schema: deletPostSchema }, async function(request, reply) {
        try {
            db.deletePost(
                request.params.id
            )
        } catch (e) {
            reply.status(500).send({ error: e })
        }
        reply.status(200).send({ success: true })
    })
}
