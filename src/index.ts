import Fastify from 'fastify'
import { authRoutes } from './routes/auth.js'
import { postRoutes } from './routes/post.js'
import cookie from '@fastify/cookie'
import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'
import { logger } from './utils/logger.js'

const app = Fastify()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(cookie)

app.register(authRoutes, { prefix: '/api/v1/auth' })
app.register(postRoutes, { prefix: '/api/v1/posts' })

app.addHook('onResponse', (request, reply, done) => {
    const status = reply.statusCode
    const msg = `${request.method} ${request.url} → ${status} (${reply.elapsedTime.toFixed(1)}ms)`

    if (status >= 500) logger.error(msg)
    else if (status >= 400) logger.warn(msg)
    else logger.success(msg)

    done()
})

app.listen({ port: 3000 }, () => logger.info('Server running on port 3000'))
