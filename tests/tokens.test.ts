import { describe, it, expect, beforeAll } from 'vitest'
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken } from '../src/utils/tokens.js'

const TEST_USER_ID = 'a1b2c3d4-0000-0000-0000-000000000000'

beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = 'test-access-secret'
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
})

describe('generateAccessToken', () => {
    it('returns a valid JWT', () => {
        const token = generateAccessToken(TEST_USER_ID)
        expect(typeof token).toBe('string')
        expect(token.split('.')).toHaveLength(3)
    })

    it('contains the correct userId', () => {
        const token = generateAccessToken(TEST_USER_ID)
        const payload = jwt.decode(token) as { userId: string }
        expect(payload.userId).toBe(TEST_USER_ID)
    })

    it('expires in 15 minutes', () => {
        const token = generateAccessToken(TEST_USER_ID)
        const payload = jwt.decode(token) as { exp: number, iat: number }
        expect(payload.exp - payload.iat).toBe(15 * 60)
    })
})

describe('generateRefreshToken', () => {
    it('returns a valid JWT', () => {
        const token = generateRefreshToken(TEST_USER_ID)
        expect(typeof token).toBe('string')
        expect(token.split('.')).toHaveLength(3)
    })

    it('contains the correct userId', () => {
        const token = generateRefreshToken(TEST_USER_ID)
        const payload = jwt.decode(token) as { userId: string }
        expect(payload.userId).toBe(TEST_USER_ID)
    })

    it('expires in 30 days', () => {
        const token = generateRefreshToken(TEST_USER_ID)
        const payload = jwt.decode(token) as { exp: number, iat: number }
        expect(payload.exp - payload.iat).toBe(30 * 24 * 60 * 60)
    })
})
