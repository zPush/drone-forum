import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

export default defineConfig({
    test: {
        env: {
            DATABASE_URL: process.env.DATABASE_TEST_URL!
        }
    }
})
