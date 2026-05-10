import Fastify from 'fastify'
import { authRoutes } from './routes/auth.js'
import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'

const app = Fastify({ logger: true })
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)


app.register(authRoutes, { prefix: '/api/v1/auth' })

app.listen({ port: 3000 })
