import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import pg from 'pg'
import { usersTable } from './db/schema.js';
import { get } from 'node:http';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool)

async function createUser(email: string, password: string) {
    const user: typeof usersTable.$inferInsert = {
        email: email,
        password: password,
    };
    await db.insert(usersTable).values(user);
    console.log('New user created!')
}

async function getUser(email: string) {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email));
    console.log('User found:', user);

}

async function deleteUser(email: string) {
    await db.delete(usersTable).where(eq(usersTable.email, email));
    console.log('User deleted!')
}


// POSTS

createUser('john@example.com', 'password123')
// getUser('john@example.com');
// deleteUser('john@example.com');