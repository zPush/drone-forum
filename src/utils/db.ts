import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import pg from 'pg'
import { usersTable, postsTable } from '../db/schema.js';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL!, ssl: { rejectUnauthorized: true } })
const db = drizzle(pool)

export async function createUser(email: string, password: string) {
    const user: typeof usersTable.$inferInsert = {
        email: email,
        password: password,
    };
    await db.insert(usersTable).values(user);
}

export async function getUser(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email))
    return result[0] ?? null
}

export async function getUserById(id: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id))
    return result[0] ?? null
}

// pw hashed
export async function updatePassword(id: string, hashedPassword: string) {
    await db.update(usersTable).set({ password: hashedPassword }).where(eq(usersTable.id, id))
}

export async function deleteUser(email: string) {
    await db.delete(usersTable).where(eq(usersTable.email, email));
    console.log('User deleted!')
}

// Posts

export async function createPost(title: string, content: string, authorId: string) {
    const post: typeof postsTable.$inferInsert = {
        title: title,
        content: content,
        authorId: authorId
    }
    await db.insert(postsTable).values(post)
    console.log('Post created!')
}

export async function deletePost(id: string) {
    await db.delete(postsTable).where(eq(postsTable.id, id))
    console.log('Post deleted!')
}

export async function getPosts() {
    return await db.select().from(postsTable)
}