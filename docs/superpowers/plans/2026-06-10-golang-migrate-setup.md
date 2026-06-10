# golang-migrate Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add golang-migrate to manage PostgreSQL schema changes with automatic migration on production deploy.

**Architecture:** A dedicated one-shot `migrate` Docker Compose service runs `migrate up` before any app replica starts, using a `condition: service_completed_successfully` dependency. Migration files live in `apps/server/migrations/` as plain SQL pairs (`.up.sql` / `.down.sql`). golang-migrate tracks applied versions in a `schema_migrations` table it manages itself.

**Tech Stack:** golang-migrate (`ghcr.io/golang-migrate/migrate:latest`), PostgreSQL 17, Docker Compose, GNU Make

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `apps/server/migrations/000001_initial_schema.up.sql` | Full schema baseline from pg_dump |
| Create | `apps/server/migrations/000001_initial_schema.down.sql` | DROP TABLE CASCADE for all 16 tables |
| Modify | `docker-compose.prod.yaml` | Add `migrate` service; update `app` depends_on |
| Modify | `Makefile` | Load .env vars; add three migration targets |

---

### Task 1: Generate the initial up migration

**Files:**
- Create: `apps/server/migrations/000001_initial_schema.up.sql`

- [ ] **Step 1: Start the dev database and let ORM_SYNC create the schema**

```bash
docker compose up postgres -d
docker compose up app -d
```

Wait ~15 seconds for the app to finish syncing the schema (watch logs with `docker compose logs -f app`). Once you see "NestJS application is running", stop the app:

```bash
docker compose stop app
```

- [ ] **Step 2: Create the migrations directory**

```bash
mkdir -p apps/server/migrations
```

- [ ] **Step 3: Dump the schema**

Replace `<POSTGRES_USER>` and `<POSTGRES_DB>` with the values from your `.env` file:

```bash
docker compose exec postgres pg_dump \
  --schema-only --no-owner --no-acl \
  -U <POSTGRES_USER> <POSTGRES_DB> \
  > apps/server/migrations/000001_initial_schema.up.sql
```

- [ ] **Step 4: Verify the dump contains all 16 tables**

```bash
grep "^CREATE TABLE" apps/server/migrations/000001_initial_schema.up.sql | sort
```

Expected output (16 lines, names may vary — check them, you'll need exact names for Task 2):

```
CREATE TABLE public.business (
CREATE TABLE public.business_invite (
CREATE TABLE public.business_supplier (
CREATE TABLE public.change_request (
CREATE TABLE public.employee (
CREATE TABLE public.extra_quantity (
CREATE TABLE public.identity (
CREATE TABLE public.meal (
CREATE TABLE public.meal_selection (
CREATE TABLE public.meal_selection_window (
CREATE TABLE public.menu_item (
CREATE TABLE public.menu_period (
CREATE TABLE public.order_summary_send (
CREATE TABLE public.refresh_tokens (
CREATE TABLE public.supplier (
CREATE TABLE public.user_preferences (
```

If any table is missing, the app didn't finish syncing — restart it and wait longer.

---

### Task 2: Write the initial down migration

**Files:**
- Create: `apps/server/migrations/000001_initial_schema.down.sql`

- [ ] **Step 1: Create the down migration**

Using the exact table names from the `CREATE TABLE` lines in `000001_initial_schema.up.sql`, write the down file. `CASCADE` handles FK dependencies so order doesn't matter:

```sql
DROP TABLE IF EXISTS meal_selection CASCADE;
DROP TABLE IF EXISTS meal_selection_window CASCADE;
DROP TABLE IF EXISTS change_request CASCADE;
DROP TABLE IF EXISTS extra_quantity CASCADE;
DROP TABLE IF EXISTS order_summary_send CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS menu_item CASCADE;
DROP TABLE IF EXISTS menu_period CASCADE;
DROP TABLE IF EXISTS meal CASCADE;
DROP TABLE IF EXISTS business_supplier CASCADE;
DROP TABLE IF EXISTS business_invite CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS employee CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;
DROP TABLE IF EXISTS identity CASCADE;
DROP TABLE IF EXISTS business CASCADE;
```

> If the `CREATE TABLE` names in your dump differ from the above (e.g. include a schema prefix like `public.business`), use just the bare table name without the `public.` prefix in the DROP statements.

- [ ] **Step 2: Commit**

```bash
git add apps/server/migrations/
git commit -m "feat(migrations): add initial schema migration baseline"
```

---

### Task 3: Add the migrate service to docker-compose.prod.yaml

**Files:**
- Modify: `docker-compose.prod.yaml`

- [ ] **Step 1: Add the `migrate` service**

In `docker-compose.prod.yaml`, add the following service block. Place it after the `postgres` service and before `redis`:

```yaml
  migrate:
    image: ghcr.io/golang-migrate/migrate:latest
    volumes:
      - ./apps/server/migrations:/migrations
    command:
      - "-path=/migrations"
      - "-database=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=disable"
      - "up"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - shared-network
```

- [ ] **Step 2: Update the `app` service depends_on**

Find the `app` service's `depends_on` block. It currently reads:

```yaml
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      otel-lgtm:
        condition: service_started
```

Replace it with:

```yaml
    depends_on:
      migrate:
        condition: service_completed_successfully
      redis:
        condition: service_started
      otel-lgtm:
        condition: service_started
```

The `postgres` dependency is removed from `app` because `migrate` already waits for `postgres` to be healthy — the chain is: `postgres healthy → migrate completes → app starts`.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.prod.yaml
git commit -m "feat(migrations): add golang-migrate service to prod compose"
```

---

### Task 4: Add migration Makefile targets

**Files:**
- Modify: `Makefile`

- [ ] **Step 1: Add .env loading to the top of the Makefile**

Open `Makefile`. At the very top (before `COMPOSE = ...`), add:

```makefile
-include .env
export
```

`-include` (with leading dash) silently skips the file if it doesn't exist. `export` makes all make variables available as shell environment variables in every recipe — this is required for the `migrate-down` target to expand `$${POSTGRES_USER}` etc.

- [ ] **Step 2: Add the three migration targets**

Add the following after the existing `ps` target:

```makefile
migrate-create:
	docker run --rm -v $(PWD)/apps/server/migrations:/migrations \
		ghcr.io/golang-migrate/migrate:latest \
		create -ext sql -dir /migrations -seq $(name)

migrate-up:
	$(COMPOSE) run --rm migrate

migrate-down:
	$(COMPOSE) run --rm migrate \
		-path=/migrations \
		-database="postgres://$${POSTGRES_USER}:$${POSTGRES_PASSWORD}@postgres:$${POSTGRES_PORT}/$${POSTGRES_DB}?sslmode=disable" \
		down 1
```

- [ ] **Step 3: Update the .PHONY line**

Change:

```makefile
.PHONY: deploy up down restart logs shell ps
```

To:

```makefile
.PHONY: deploy up down restart logs shell ps migrate-create migrate-up migrate-down
```

- [ ] **Step 4: Verify the Makefile renders correctly**

```bash
make -n migrate-up
```

Expected output (dry-run, no execution):

```
docker compose -f docker-compose.prod.yaml run --rm migrate
```

- [ ] **Step 5: Commit**

```bash
git add Makefile
git commit -m "feat(migrations): add migrate-create, migrate-up, migrate-down Makefile targets"
```

---

### Task 5: Verify end-to-end on production

- [ ] **Step 1: Pull the latest changes on the server**

```bash
git pull
```

- [ ] **Step 2: Bring the stack up**

```bash
make up
```

- [ ] **Step 3: Watch migrate run**

```bash
make logs s=migrate
```

Expected output:

```
migrate  | 1/u initial_schema (Xms)
```

If you see `no change`, the migration was already applied (e.g. if you tested locally first). That is also correct — `no change` exits 0.

If you see an error, check the message. Most common issues:

| Error | Fix |
|-------|-----|
| `connection refused` | postgres wasn't healthy yet — `depends_on` should prevent this; check healthcheck config |
| `Dirty database version N` | A previous migration failed mid-run; fix the SQL in the `.up.sql` file, then run `docker compose -f docker-compose.prod.yaml run --rm migrate force N` (where N is the dirty version number) to clear the flag, then `make migrate-up` |
| `file does not exist` | Volume mount path is wrong; check that `./apps/server/migrations` exists on the host |

- [ ] **Step 4: Confirm schema_migrations table exists**

```bash
docker compose -f docker-compose.prod.yaml exec postgres \
  psql -U $POSTGRES_USER -d $POSTGRES_DB \
  -c "SELECT * FROM schema_migrations;"
```

Expected:

```
 version | dirty
---------+-------
       1 | f
(1 row)
```

- [ ] **Step 5: Confirm app is healthy**

```bash
make ps
```

All replicas should show `healthy` status. If any replica is stuck in `starting`, check `make logs s=app`.

---

## Developer Workflow (reference — not a task)

When you make a TypeORM entity change that modifies the schema:

```bash
# 1. Create the migration file pair
make migrate-create name=add_supplier_phone_number

# 2. Edit the generated .up.sql with your delta SQL, e.g.:
#    ALTER TABLE supplier ADD COLUMN phone_number VARCHAR(50);

# 3. Edit the .down.sql with the reverse:
#    ALTER TABLE supplier DROP COLUMN IF EXISTS phone_number;

# 4. Commit both files alongside the entity change
git add apps/server/migrations/ apps/server/src/...
git commit -m "feat: add phone number to supplier"
```

The next `make deploy` (which runs `make up`) will apply the migration automatically before the app restarts.
