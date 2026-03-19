# Food-Up — Claude Context

## Project Overview

**Food-Up** is a full-stack monorepo application for managing food supply in companies. It handles employee meal selections, suppliers, menus, and time-windowed meal ordering.

## Monorepo Structure

```
food-up/
├── apps/
│   ├── server/   # NestJS backend (port 3000)
│   └── web/      # React + Vite frontend (port 5000)
├── shared/       # Shared TypeScript DTOs, enums, interfaces
├── docker-compose.yaml
└── package.json  # npm workspaces root
```

## Tech Stack

**Backend (`apps/server`):**
- NestJS 11 + TypeScript
- TypeORM 0.3 with PostgreSQL 17
- JWT auth with Passport.js (global `JwtAuthGuard`)
- Swagger/OpenAPI at `/api/docs`
- `eslint-plugin-boundaries` enforcing DDD layer rules

**Frontend (`apps/web`):**
- React 19 + TypeScript + Vite
- React Router v7
- TanStack Query (React Query) for server state
- Zustand for global client state
- Tailwind CSS v4 + shadcn/ui (Radix UI)
- React Hook Form + Zod

**Shared (`shared/`):**
- Enums: `IdentityType`, `EmployeeRole`, `MealType`, `SupplierType`
- Interfaces: request/response contracts shared between client and server

## Development Commands

```bash
npm ci                   # Install all workspace dependencies
npm run start:dev        # Start everything (shared watch + server + web)
npm run dev:server       # Backend only
npm run dev:web          # Frontend only
npm run watch:shared     # Shared lib in watch mode

npm run build            # Build all
npm run test             # Run server unit tests
npm run test:e2e         # E2E tests

# Seed the database
npm run seed --workspace=apps/server -- --manager-email=user@example.com --manager-password=password

# Docker (runs app + PostgreSQL + pgAdmin)
docker-compose up
# pgAdmin: http://localhost:5050 (admin@admin.com / admin)
```

## Backend Architecture (DDD)

Each feature module under `apps/server/src/core/[feature]/` follows strict layering:

```
[feature]/
├── domain/
│   ├── [feature].entity.ts              # Pure domain entity (private ctor, create/reconstitute)
│   ├── [feature].repository.interface.ts # IRepository interface + DI symbol
│   └── events/                           # Domain events
├── application/
│   ├── [feature].service.ts             # Orchestrates repositories + events + transactions
│   └── dto/                             # Application-level DTOs (view models)
├── infrastructure/
│   └── persistence/
│       ├── [feature].typeorm-entity.ts   # TypeORM entity (maps to DB)
│       └── [feature]-typeorm.repository.ts  # IRepository implementation
└── presentation/
    └── rest/
        ├── [feature].controller.ts
        └── dto/                          # Request/response DTOs (class-validator)
```

**Layer dependency rules (enforced by ESLint):**
- `domain` ← `application` ← `infrastructure` / `presentation`
- Domain layer has zero framework dependencies

**Query Repository Pattern:**

For read-heavy views that join multiple entities or return shaped DTOs (not domain entities), use a **separate query repository** — do NOT add these methods to the main domain repository.

```
application/queries/
  [feature]-query-repository.interface.ts   ← Symbol + interface, returns plain DTOs
  [feature]-query.service.ts               ← thin @Injectable service
  dto/[query-name].dto.ts                  ← plain TypeScript types (no class-transformer)

infrastructure/persistence/
  [feature]-query-typeorm.repository.ts    ← QueryBuilder impl, respects TransactionContext
```

Use a query repository when:
- The response joins multiple entities (e.g. employee name + meal details in one row)
- The result shape doesn't map to a single domain entity
- It's a read-only view — no insert/update/delete

Use the main domain repository when:
- Returning a domain entity that will be mutated
- Simple `findById` / `findByCriteria` with no cross-entity joins

Query repositories use `createQueryBuilder` + `getRawMany` with explicit `SELECT` aliases. They always respect `TransactionContext` (same pattern as the main repository's `_repository` getter).

**Entity pattern:**
```typescript
class MyEntity {
  private constructor(private readonly props: Props) {}
  static create(data): MyEntity { /* adds domain event */ }
  static reconstitute(data): MyEntity { /* from DB, no events */ }
}
```

**Repository DI pattern:**
```typescript
const I_MY_REPOSITORY = Symbol('IMyRepository');
// Module provider:
{ provide: I_MY_REPOSITORY, useClass: MyTypeOrmRepository }
// Service injection:
@Inject(I_MY_REPOSITORY) private readonly _repository: IMyRepository
```

**Guards and decorators:**
- `@Public()` — skip JWT auth
- `@CurrentIdentity()` — inject JWT payload into handler
- `@EmployeeRole(EmployeeRole.Manager)` — role-based guard
- `@IdentityType(IdentityType.Employee)` — identity type guard
- `@DisabledInProduction()` — disables endpoint in prod

## Frontend Architecture

Each feature under `apps/web/src/features/[feature]/` mirrors DDD:

```
[feature]/
├── domain/
│   └── [service].interface.ts        # Service contract
├── infrastructure/
│   └── [service].service.ts          # HTTP implementation
└── presentation/
    ├── pages/
    └── components/
```

**HTTP client:** `apps/web/src/shared/infrastructure/http/http-client.ts`
Typed Fetch wrapper, auto-injects JWT from Zustand auth store.

**DI:** Service container pattern via React Context (`service-container.ts`), all services wired in `app-providers.tsx`.

**Routing:** Nested React Router v7 routes. Layouts:
- `AuthLayout` — public pages
- `MainLayout` — authenticated users
- `ManagerLayout` — manager-only features with sidebar

## Database

- PostgreSQL with `SnakeNamingStrategy` (camelCase → snake_case)
- `ORM_SYNC=true` in dev (auto-syncs schema)
- TypeORM entities loaded by glob `*.typeorm-entity.*`

## Naming Conventions

- Private fields: `_prefixedWithUnderscore`
- Interfaces: `IPrefixedWithI`
- DI tokens: `I_SCREAMING_SNAKE_CASE` symbols
- Files: `kebab-case.purpose.ts` (e.g., `meal-selection.entity.ts`)
- DTOs: `PascalCaseResponseDto`, `PascalCaseRequestDto`
- TypeORM entities: `PascalCaseTypeOrmEntity`

## Key Notes for AI Assistance

- When adding a new feature, follow the exact DDD layered structure above — do not shortcut layers
- Domain entities must have private constructors; use `create()` and `reconstitute()` statics
- Never import presentation/infrastructure in domain; ESLint will catch violations
- Response DTOs use `@Exclude()` strategy — fields must be explicitly `@Expose()`d
- The `shared/` package is for types shared between web and server — keep it free of business logic
- Swagger decorators (`@ApiOperation`, `@ApiResponse`, etc.) are expected on all controller methods
- Transactions are handled via `ITransactionRunner` injected into services
