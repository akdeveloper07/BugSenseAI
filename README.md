# BugSense AI

Intelligent debugging assistant for students and developers. Paste code, logs, or a stack trace and receive a **structured bug report**: type, severity, root cause, impact, suggested fix, confidence, and summary.

This repository is a **monorepo** suitable as a final-year / semester project.

| App | Stack | Default URL |
| --- | --- | --- |
| `apps/web` | Next.js 15 (App Router) + Tailwind CSS 4 | http://localhost:3000 |
| `apps/api` | Express + TypeScript + Prisma + PostgreSQL | http://localhost:4000 |

## Features

- Email/password auth with JWT (cookie + `Authorization` header), roles `USER` / `ADMIN`
- Bug analysis via an OpenAI-compatible chat API (OpenAI, DeepSeek, Groq, etc.)
- Robust parser for the fixed BugSense output format
- Personal analysis history, detail view, tags, thumbs up/down, CSV export
- Admin dashboard: search all analyses, manage roles and active flags
- Rate limiting on `POST /api/analyze-bug`
- Demo mode if `AI_API_KEY` is still the placeholder (so the UI works without a paid key)

## Project structure

```
BugSenseAI/
  apps/api/          Express API, Prisma schema, AI client
  apps/web/          Next.js frontend
  docker-compose.yml PostgreSQL 16
```

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (Docker Desktop **or** a local install)
- Optional: an API key from OpenAI or any OpenAI-compatible provider

This machine did not have Docker in PATH when the project was generated. If `docker compose up` fails, install [Docker Desktop](https://www.docker.com/products/docker-desktop/) or create a database named `bugsense` with user/password `bugsense`/`bugsense` and keep `DATABASE_URL` as in `apps/api/.env`.

## Setup

```bash
# 1. Start Postgres
docker compose up -d postgres

# 2. Install workspaces
npm install

# 3. API env (already copied from .env.example for local demo)
#    Edit apps/api/.env — set DATABASE_URL and AI_API_KEY

# 4. Database
cd apps/api
npx prisma generate
npx prisma migrate deploy
npm run db:seed
cd ../..

# 5. Run both apps
npm run dev
```

Seeded admin:

- Email: `admin@bugsense.local`
- Password: `Admin123!`

Sign up a normal user from `/signup`.

### AI provider

In `apps/api/.env`:

```
AI_BASE_URL="https://api.openai.com/v1"
AI_API_KEY="sk-..."
AI_MODEL="gpt-4o-mini"
```

DeepSeek example:

```
AI_BASE_URL="https://api.deepseek.com"
AI_API_KEY="sk-..."
AI_MODEL="deepseek-chat"
```

If `AI_API_KEY` is `sk-your-key`, the API returns a heuristic **demo** report so evaluators can still walk through the product.

## API

All JSON responses use:

- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": { "message": "...", "code": "..." } }`

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/auth/signup` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/logout` | public |
| GET | `/api/auth/me` | user |
| PATCH | `/api/auth/profile` | user |
| POST | `/api/auth/change-password` | user |
| POST | `/api/auth/forgot-password` | public |
| POST | `/api/auth/reset-password` | public |
| POST | `/api/analyze-bug` | user |
| GET | `/api/analyses` | user |
| GET | `/api/analyses/export` | user |
| GET | `/api/analyses/:id` | owner or admin |
| PATCH | `/api/analyses/:id` | owner or admin (tags / rating) |
| GET | `/api/admin/analyses` | admin |
| GET | `/api/admin/users` | admin |
| PATCH | `/api/admin/users/:id` | admin |
| GET | `/api/health` | public |

Password reset is simplified for a college lab: the token is **logged on the API console** instead of sending email.

## Frontend pages

- `/` landing
- `/signup` `/login` `/forgot-password`
- `/dashboard` analysis form
- `/dashboard/history` and `/dashboard/history/[id]`
- `/profile`
- `/admin` (ADMIN only)

## Deployment notes

- Set `NODE_ENV=production`, a strong `JWT_SECRET`, `CLIENT_ORIGIN` to the real frontend origin, and `DATABASE_URL`.
- Run `npx prisma migrate deploy` against production Postgres.
- Host `apps/api` on a Node process (Render/Railway/VPS) and `apps/web` as a Node Next.js server or static export is **not** used — use `next start`.
- Cookies are `Secure` in production; the SPA also stores JWT in `localStorage` for cross-origin deploys.

## Academic / report talking points

1. **Separation of concerns** — Next.js UI, Express REST API, Prisma persistence, isolated AI + parser services.
2. **Structured LLM output** — a strict system prompt plus a fallback field parser (regex / labeled blocks).
3. **AuthZ** — JWT claims + DB `role` / `isActive`; admins can read any analysis.
4. **Operational basics** — Zod validation, Helmet, CORS, rate limits, consistent error envelopes.

## License

MIT — use freely for coursework and portfolios.
