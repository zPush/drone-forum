import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import { ref } from 'node:process';

dotenv.config();

const accessToken = process.env.ACCESS_TOKEN_SECRET
const refreshToken = process.env.REFRESH_TOKEN_SECRET

if (!accessToken || !refreshToken) {
    console.log('Access- or refreshtoken missing.')
}

export function generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, accessToken!, { expiresIn: '15m' })
}

export function generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, refreshToken!, { expiresIn: '30d' })
}