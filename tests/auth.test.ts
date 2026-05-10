import { describe, it, expect, afterEach } from 'vitest'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'
import { authRoutes } from '../src/routes/auth.js'
import * as db from '../src/utils/db.js'

const TEST_EMAIL = 'testuser@vitest.com'
const TEST_PASSWORD = 'password123'

function buildApp() {
    const app = Fastify()
    app.register(cookie)
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    app.register(authRoutes, { prefix: '/api/v1/auth' })
    return app
}

afterEach(async () => {
    await db.deleteUser(TEST_EMAIL)
})

describe('POST /api/v1/auth/register', () => {
    it('returns 201 on successful registration', async () => {
        const app = buildApp()
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            body: { email: TEST_EMAIL, password: TEST_PASSWORD }
        })
        expect(res.statusCode).toBe(201)
        expect(res.json()).toMatchObject({ success: true })
    })

    it('returns 409 when email already exists', async () => {
        const app = buildApp()
        await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            body: { email: TEST_EMAIL, password: TEST_PASSWORD }
        })
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            body: { email: TEST_EMAIL, password: TEST_PASSWORD }
        })
        expect(res.statusCode).toBe(409)
        expect(res.json()).toMatchObject({ error: 'Email already taken' })
    })

    it('returns 400 when password is too short', async () => {
        const app = buildApp()
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            body: { email: TEST_EMAIL, password: '123' }
        })
        expect(res.statusCode).toBe(400)
    })

    it('returns 404 when profile does not exist', async () => {
        const app = buildApp()
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/auth/profile/${TEST_EMAIL}`
        })
        expect(res.statusCode).toBe(404)
    })

    it('returns 400 when email is invalid', async () => {
        const app = buildApp()
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            body: { email: 'notanemail', password: TEST_PASSWORD }
        })
        expect(res.statusCode).toBe(400)
    })
})

describe('DELETE /api/v1/auth/delete/:email', () => {
    it('returns 200 when user is deleted', async () => {
        const app = buildApp()
        await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            body: { email: TEST_EMAIL, password: TEST_PASSWORD }
        })
        const loginRes = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            body: { email: TEST_EMAIL, password: TEST_PASSWORD }
        })
        const { accessToken } = loginRes.json()
        const res = await app.inject({
            method: 'DELETE',
            url: `/api/v1/auth/delete/${TEST_EMAIL}`,
            headers: { authorization: `Bearer ${accessToken}` }
        })
        expect(res.statusCode).toBe(200)
        expect(res.json()).toMatchObject({ success: true })
    })
})
