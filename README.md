# Promotions Backend (Node + Express + TypeScript)

Backend API ready for Vercel hosting and Neon Postgres.

## Endpoints

- `POST /login` -> returns JWT token for valid credentials
- `POST /logout` -> deletes current token (requires `Authorization: Bearer <token>`)
- `GET /me` -> returns current user info (requires JWT)
- `GET /health` -> simple healthcheck

## Local Setup

1. Copy env file:

   ```bash
   cp .env.example .env
   ```

2. Fill `.env` with your Neon `DATABASE_URL` and a strong `JWT_SECRET`.

3. Initialize database and seed test user:

   ```bash
   npm run db:init
   npm run db:seed
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

## Test User

- email: `test@test.com`
- password: `password`

## Vercel Deployment

- `vercel.json` is configured to route all requests to `api/index.ts`.
- Add the same env vars in Vercel project settings:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN` (optional, default is `7d`)
