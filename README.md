# DroneForum API

A REST API backend for a drone enthusiast forum. Built as a learning project to practice backend development with TypeScript, authentication patterns, and integration testing.

> **Work in progress** — auth and post endpoints are functional; more features planned.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Fastify v5 |
| Database | PostgreSQL via [NeonDB](https://neon.tech) |
| ORM | Drizzle ORM |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | Zod |
| Testing | Vitest (integration tests against real DB) |
| Logging | Custom chalk logger |

## Features

- **Stateless JWT auth** — short-lived access tokens (15min) paired with httpOnly cookie refresh tokens (30 days)
- **Password security** — bcrypt hashing with salt rounds
- **Request validation** — Zod schemas on all endpoints via `@fastify/type-provider-zod`
- **Integration tests** — tests run against a real test database, not mocks

## API Endpoints

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | — | Create account |
| `POST` | `/login` | — | Login, returns access token + sets refresh cookie |
| `POST` | `/refresh` | cookie | Exchange refresh token for new access token |
| `POST` | `/logout` | — | Clear refresh token cookie |
| `GET` | `/profile` | Bearer | Get own profile |
| `POST` | `/changePassword` | Bearer | Change password |
| `DELETE` | `/delete/:email` | Bearer | Delete own account |

### Posts — `/api/v1/posts`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/post` | Bearer | Create a post |
| `DELETE` | `/post/:id` | Bearer | Delete a post |
| `GET` | `/allPosts` | Bearer | List all posts |

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (NeonDB free tier works)

### Setup

```bash
git clone https://github.com/your-username/droneforum.git
cd droneforum
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Push the schema to your database:

```bash
npm run pushdb
```

### Running

```bash
npm run api
```

Server starts on `http://localhost:3000`.

### Testing

Tests run against a separate test database (set `DATABASE_TEST_URL` in `.env`):

```bash
npm test
```

## Project Structure

```
src/
├── db/
│   └── schema.ts        # Drizzle table definitions
├── middleware/
│   └── auth.ts          # JWT Bearer token verification
├── routes/
│   ├── auth.ts          # Auth endpoints
│   └── post.ts          # Post endpoints
├── utils/
│   ├── db.ts            # Database queries
│   ├── logger.ts        # Chalk logger
│   └── tokens.ts        # JWT helpers
└── index.ts             # Fastify app entry point
tests/
├── auth.test.ts
└── tokens.test.ts
```
