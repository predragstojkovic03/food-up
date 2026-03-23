# Food-Up

Food-Up is a full-stack application for managing food supply in companies. It lets employees browse menus, make meal selections within time-defined windows, and allows managers to configure suppliers, menu periods, and reporting. The system supports multi-tenant businesses, each with their own employees, suppliers, and menus.

---

## Monorepo Structure

```
food-up/
├── apps/
│   ├── server/          # NestJS REST API (port 3000)
│   └── web/             # React + Vite SPA (port 5000)
├── shared/              # Shared TypeScript enums and interfaces (@food-up/shared)
├── docker-compose.yaml  # Full dev environment (app + Postgres + Redis + observability)
└── package.json         # npm workspaces root
```

See per-package docs for architecture details:
- [apps/server/README.md](apps/server/README.md) — Backend architecture, DDD patterns, API docs
- [apps/web/README.md](apps/web/README.md) — Frontend architecture, component patterns
- [shared/README.md](shared/README.md) — Shared types package

---

## Tech Stack

| | Backend | Frontend |
|---|---|---|
| **Framework** | NestJS 11 | React 19 + Vite |
| **Language** | TypeScript | TypeScript |
| **Database** | PostgreSQL 17 via TypeORM 0.3 | — |
| **Cache** | Redis 8 | — |
| **Auth** | JWT + Passport.js | Zustand (token storage) |
| **Server state** | — | TanStack Query (React Query) |
| **Routing** | — | React Router v7 |
| **UI** | — | shadcn/ui + Radix UI + Tailwind v4 |
| **Forms** | — | React Hook Form + Zod |
| **Observability** | OpenTelemetry + Grafana LGTM | — |
| **API docs** | Swagger/OpenAPI at `/api/docs` | — |

---

## Prerequisites

- **Node.js** 22+ and npm 10+
- **Docker & Docker Compose** (recommended path)
- **PostgreSQL 17** and **Redis 8** (local path only)

---

## Quick Start

### Option 1 — Docker (recommended)

Everything runs in containers: the app, Postgres, Redis, pgAdmin, and the Grafana observability stack.

1. Copy and configure the environment file:
   ```bash
   cp .env.example .env   # edit values as needed
   ```
   > If no `.env.example` exists, see the [Environment Variables](#environment-variables) section below.

2. Start all services:
   ```bash
   docker-compose up
   ```

3. The app builds and starts automatically. On first run, seed the database:
   ```bash
   docker exec -it food-up-app npm run seed --workspace=apps/server -- \
     --manager-email=admin@example.com \
     --manager-password=yourpassword
   ```

### Option 2 — Local Development

Requires a local PostgreSQL 17 and Redis 8 instance.

1. Install dependencies:
   ```bash
   npm ci
   ```

2. Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

3. Start all packages in watch mode:
   ```bash
   npm run start:dev
   ```
   This concurrently runs the shared library compiler, the NestJS server (watch mode), and the Vite dev server.

4. Seed the database:
   ```bash
   npm run seed --workspace=apps/server -- \
     --manager-email=admin@example.com \
     --manager-password=yourpassword
   ```

---

## Dev Service URLs

| Service | URL | Notes |
|---|---|---|
| API server | http://localhost:3000 | REST API |
| API docs | http://localhost:3000/api/docs | Swagger UI |
| Web app | http://localhost:5000 | React SPA |
| pgAdmin | http://localhost:5050 | `admin@admin.com` / `admin` |
| Grafana | http://localhost:3001 | Traces, logs, metrics |

---

## Available Scripts

All scripts run from the **monorepo root** with `npm run <script>`.

| Script | Description |
|---|---|
| `start:dev` | Start everything in watch mode (shared + server + web) |
| `dev:server` | Backend only (watch mode) |
| `dev:web` | Frontend only (Vite dev server) |
| `watch:shared` | Compile shared library in watch mode |
| `build` | Full production build (shared → web → server) |
| `build:shared` | Build shared library only |
| `build:web` | Build frontend only |
| `build:server` | Build backend only |
| `start:prod` | Start the server in production mode (after build) |

Per-workspace scripts (run from root using `--workspace`):

```bash
# Run server unit tests
npm run test --workspace=apps/server

# Run server E2E tests
npm run test:e2e --workspace=apps/server

# Run tests with coverage
npm run test:cov --workspace=apps/server
```

---

## Seeding

The seed script creates a manager account and populates reference data.

```bash
npm run seed --workspace=apps/server -- \
  --manager-email=admin@example.com \
  --manager-password=yourpassword
```

---

## Environment Variables

Create a `.env` file in the project root. Required variables:

| Variable | Description | Example |
|---|---|---|
| `DB_HOST` | Postgres host | `localhost` |
| `DB_PORT` | Postgres port | `5432` |
| `DB_USER` | Postgres username | `postgres` |
| `DB_PASSWORD` | Postgres password | `postgres` |
| `DB_NAME` | Database name | `food_up` |
| `NODE_ENV` | Environment | `development` |
| `ORM_SYNC` | Auto-sync DB schema (dev only) | `true` |
| `PORT` | Server port | `3000` |
| `WEB_PORT` | Web app port | `5000` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `WEB_APP_URL` | Frontend origin (for CORS/emails) | `http://localhost:5000` |
| `MAIL_FROM` | Sender address for system emails | `noreply@food-up.dev` |
| `RESEND_API_KEY` | Resend API key for transactional email | `re_...` |
| `POSTGRES_USER` | Postgres user (Docker Compose) | `postgres` |
| `POSTGRES_PASSWORD` | Postgres password (Docker Compose) | `postgres` |
| `POSTGRES_DB` | Database name (Docker Compose) | `food_up` |
| `POSTGRES_PORT` | Postgres port (Docker Compose) | `5432` |
