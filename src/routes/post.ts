import type { FastifyInstance } from 'fastify'
import * as db from '../utils/db.js'
import { z } from 'zod'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import { verifyToken } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'

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
    // POST - Post a new post as user
    fastify.withTypeProvider<ZodTypeProvider>().post('/post', { preHandler: verifyToken, schema: postSchema }, async function(request, reply) {
        try {
            await db.createPost(
                request.body.title,
                request.body.content,
                request.body.author
            )
        } catch (e) {
            logger.error(`Create post failed: ${e}`)
            return reply.status(500).send({ error: 'Could not create post' })
        }
        return reply.status(200).send({ success: true })
    })

    // DELETE - Delete Post
    fastify.withTypeProvider<ZodTypeProvider>().delete('/post/:id', { preHandler: verifyToken, schema: deletPostSchema }, async function(request, reply) {
        try {
            await db.deletePost(
                request.params.id
            )
        } catch (e) {
            logger.error(`Delete post failed: ${e}`)
            return reply.status(500).send({ error: 'Could not delete post' })
        }
        return reply.status(200).send({ success: true })
    })

    // GET - Get all posts
    fastify.withTypeProvider<ZodTypeProvider>().get('/allPosts', { preHandler: verifyToken }, async function(_req, reply) {
        try {
            return reply.status(201).send({data: await db.getPosts()})
        } catch(e) {
            return reply.status(500).send('Something went wrong')
        }
    })
}
