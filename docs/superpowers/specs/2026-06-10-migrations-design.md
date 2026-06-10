# Database Migration System — Design Spec

**Date:** 2026-06-10
**Status:** Approved

## Problem

Production runs with `ORM_SYNC: false`. There is currently no mechanism to apply schema changes to the production database. Migrations need to be stored, versioned, and applied automatically on every deploy.

## Solution

Use [golang-migrate](https://github.com/golang-migrate/migrate) with plain SQL files and a dedicated Docker Compose service that runs migrations before the app starts.

## Directory Structure

```
apps/server/
└── migrations/
    ├── 000001_initial_schema.up.sql
    ├── 000001_initial_schema.down.sql
    ├── 000002_<description>.up.sql
    ├── 000002_<description>.down.sql
    └── ...
```

- Sequential integer prefixes (`000001`, `000002`, ...) — unambiguous ordering, human-readable
- Flat directory — standard for golang-migrate; you rarely browse it
- Each migration is a pair: `.up.sql` (apply) and `.down.sql` (reverse)
- golang-migrate manages a `schema_migrations` table in PostgreSQL automatically — do **not** include it in any migration file

## State Tracking

golang-migrate creates and manages:

```sql
CREATE TABLE schema_migrations (
  version bigint NOT NULL PRIMARY KEY,
  dirty   boolean NOT NULL
);
```

- Stores the last successfully applied version
- On `up`, only runs files with a version higher than the stored value
- If a migration fails mid-execution, `dirty = true` — migrate refuses further runs until resolved manually with `migrate force <version>`

## Docker Compose Service (`docker-compose.prod.yaml`)

A one-shot `migrate` service runs before any app replica starts:

```yaml
migrate:
  image: ghcr.io/golang-migrate/migrate:latest
  volumes:
    - ./apps/server/migrations:/migrations
  command:
    - "-path"
    - "/migrations"
    - "-database"
    - "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=disable"
    - "up"
  depends_on:
    postgres:
      condition: service_healthy
  networks:
    - shared-network
```

The `app` service gains a dependency:

```yaml
depends_on:
  migrate:
    condition: service_completed_successfully
  postgres:
    condition: service_healthy
  redis:
    condition: service_started
  otel-lgtm:
    condition: service_started
```

The service exits with code 0 on success (including when there are no pending migrations). If it exits non-zero, all app replicas are blocked from starting.

## Makefile Targets

Three targets added to the existing `Makefile`:

```makefile
migrate-create:
	docker run --rm -v $(PWD)/apps/server/migrations:/migrations \
		ghcr.io/golang-migrate/migrate:latest \
		create -ext sql -dir /migrations -seq $(name)

migrate-up:
	$(COMPOSE) run --rm migrate

migrate-down:
	$(COMPOSE) run --rm migrate -path /migrations \
		-database "postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@postgres:$$POSTGRES_PORT/$$POSTGRES_DB?sslmode=disable" \
		down 1
```

Usage:

```bash
make migrate-create name=add_supplier_phone   # creates 000002_add_supplier_phone.up.sql + .down.sql
make migrate-up                               # apply pending migrations manually (emergency use)
make migrate-down                             # rollback one step
```

## Initial Migration

The baseline migration captures the full current schema from the dev database (which is correct via `ORM_SYNC=true`):

```bash
pg_dump --schema-only --no-owner --no-acl \
  -U $DB_USER -d $DB_NAME \
  > apps/server/migrations/000001_initial_schema.up.sql
```

The `000001_initial_schema.down.sql` contains `DROP TABLE IF EXISTS` for every table in reverse dependency order. It is written manually.

On the first production deploy, `000001` runs and the `schema_migrations` table is created simultaneously by golang-migrate.

## Developer Workflow

Development continues to use `ORM_SYNC=true` for fast iteration. When a schema change is ready to ship:

1. Make the TypeORM entity change; let ORM_SYNC apply it locally
2. `make migrate-create name=<describe_the_change>`
3. Write the delta SQL (`ALTER TABLE`, `CREATE TABLE`, etc.) into the generated `.up.sql`
4. Write the reverse operation into `.down.sql`
5. Commit the entity change and migration files together in one commit

Migration SQL is written by hand — no auto-generation. This keeps migrations explicit, minimal, and reviewable.

## What Is Not Changing

- Dev still uses `ORM_SYNC=true` — no change to the development workflow
- Production already has `ORM_SYNC: false` — this just adds the mechanism to apply changes
- No TypeORM migration runner, no `typeorm migration:generate` — golang-migrate is the only migration tool
