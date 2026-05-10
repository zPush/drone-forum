import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import pg from 'pg'
import { usersTable, postsTable } from '../db/schema.js';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool)

export async function createUser(email: string, password: string) {
    const user: typeof usersTable.$inferInsert = {
        email: email,
        password: password,
    };
    await db.insert(usersTable).values(user);
    console.log('New user created!')
}

export async function getUser(email: string) {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email));
    console.log('User found:', user);

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