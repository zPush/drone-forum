import Fastify from 'fastify'
import { authRoutes } from './routes/auth.js'
import { postRoutes } from './routes/post.js'
import cookie from '@fastify/cookie'


import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'

const app = Fastify({ logger: true })
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(cookie)

app.register(authRoutes, { prefix: '/api/v1/auth' })
app.register(postRoutes, { prefix: '/api/v1/posts' })

app.listen({ port: 3000 })
