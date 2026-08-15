# Rate Limiting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-endpoint rate limiting to the NestJS server using `@nestjs/throttler`, with trust proxy configured for correct IP detection behind a reverse proxy.

**Architecture:** A single named throttler (`default`, 120 req/min) is registered globally via `ThrottlerModule`. `ThrottlerGuard` is added as the first `APP_GUARD` so it runs before JWT auth. Sensitive auth endpoints override the global limit via `@Throttle`. The health endpoint skips throttling entirely so load balancer probes are never blocked.

**Tech Stack:** `@nestjs/throttler` v6, NestJS 11, `@nestjs/platform-express` (Express under the hood for trust proxy)

---

## Files

| Action | File | What changes |
|--------|------|--------------|
| Modify | `apps/server/src/app.module.ts` | Import `ThrottlerModule`, register `ThrottlerGuard` as first `APP_GUARD` |
| Modify | `apps/server/src/main.ts` | Add `app.set('trust proxy', 1)` |
| Modify | `apps/server/src/core/auth/presentation/rest/auth.controller.ts` | Add `@Throttle` on `login`, `refresh`, `changePassword` |
| Modify | `apps/server/src/health/health.controller.ts` | Add `@SkipThrottle()` |
| Create | `apps/server/src/core/auth/presentation/rest/auth.controller.throttle.spec.ts` | Unit tests verifying throttle metadata on each endpoint |

---

## Task 1: Install package and wire globally

**Files:**
- Modify: `apps/server/package.json` (via npm install)
- Modify: `apps/server/src/app.module.ts`
- Modify: `apps/server/src/main.ts`

- [ ] **Step 1: Install `@nestjs/throttler`**

```bash
npm install @nestjs/throttler --workspace=apps/server
```

Expected output: package added to `apps/server/node_modules`, `package.json` updated.

- [ ] **Step 2: Add `ThrottlerModule` and `ThrottlerGuard` to `app.module.ts`**

Add the import at the top of `apps/server/src/app.module.ts`:

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
```

Add `ThrottlerModule.forRoot` to the `imports` array (after `EventEmitterModule.forRoot`):

```typescript
ThrottlerModule.forRoot([
  { name: 'default', ttl: 60_000, limit: 120 },
]),
```

Add `ThrottlerGuard` as the **first** provider in the `providers` array, before `JwtAuthGuard`:

```typescript
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
},
```

The `providers` array should look like this after the change:

```typescript
providers: [
  AppService,
  {
    provide: APP_FILTER,
    useClass: DomainExceptionFilter,
  },
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: EmployeeRoleGuard,
  },
  {
    provide: APP_GUARD,
    useClass: IdentityTypeGuard,
  },
  {
    provide: APP_GUARD,
    useClass: DisabledEndpointGuard,
  },
],
```

- [ ] **Step 3: Add trust proxy to `main.ts`**

In `apps/server/src/main.ts`, add the following line directly after `app.use(cookieParser())`:

```typescript
// Trust one hop of proxy (Nginx / ALB) so ThrottlerGuard reads the real client IP
// from X-Forwarded-For rather than the proxy's IP address.
app.set('trust proxy', 1);
```

- [ ] **Step 4: Verify the server starts without errors**

```bash
npm run dev:server --workspace=apps/server
```

Expected: server starts on port 3000 with no errors. `Ctrl+C` to stop.

- [ ] **Step 5: Commit**

```bash
git add apps/server/package.json apps/server/package-lock.json apps/server/src/app.module.ts apps/server/src/main.ts
git commit -m "feat(server): add global rate limiting via @nestjs/throttler"
```

---

## Task 2: Per-endpoint throttle limits on auth + health

**Files:**
- Modify: `apps/server/src/core/auth/presentation/rest/auth.controller.ts`
- Modify: `apps/server/src/health/health.controller.ts`
- Create: `apps/server/src/core/auth/presentation/rest/auth.controller.throttle.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/server/src/core/auth/presentation/rest/auth.controller.throttle.spec.ts`:

```typescript
import { AuthController } from './auth.controller';

// THROTTLER_OPTIONS is the metadata key set by @Throttle() in @nestjs/throttler v5+
const THROTTLER_OPTIONS = 'THROTTLER_OPTIONS';

describe('AuthController throttle metadata', () => {
  it('login is limited to 5 requests per minute', () => {
    const meta = Reflect.getMetadata(THROTTLER_OPTIONS, AuthController.prototype.login);
    expect(meta).toEqual({ default: { ttl: 60_000, limit: 5 } });
  });

  it('refresh is limited to 20 requests per minute', () => {
    const meta = Reflect.getMetadata(THROTTLER_OPTIONS, AuthController.prototype.refresh);
    expect(meta).toEqual({ default: { ttl: 60_000, limit: 20 } });
  });

  it('changePassword is limited to 5 requests per minute', () => {
    const meta = Reflect.getMetadata(THROTTLER_OPTIONS, AuthController.prototype.changePassword);
    expect(meta).toEqual({ default: { ttl: 60_000, limit: 5 } });
  });

  it('getMe has no throttle override (uses global 120/min)', () => {
    const meta = Reflect.getMetadata(THROTTLER_OPTIONS, AuthController.prototype.getMe);
    expect(meta).toBeUndefined();
  });

  it('logout has no throttle override (uses global 120/min)', () => {
    const meta = Reflect.getMetadata(THROTTLER_OPTIONS, AuthController.prototype.logout);
    expect(meta).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
npm run test --workspace=apps/server -- --testPathPattern="auth.controller.throttle"
```

Expected: 3 tests fail with `Expected: {...}  Received: undefined` (decorators not yet added). The `getMe` and `logout` tests pass.

- [ ] **Step 3: Add `@Throttle` decorators to auth.controller.ts**

Add the import to `apps/server/src/core/auth/presentation/rest/auth.controller.ts`:

```typescript
import { Throttle } from '@nestjs/throttler';
```

Add `@Throttle({ default: { ttl: 60_000, limit: 5 } })` on `login` — place it directly above `@Post('login')`:

```typescript
@Throttle({ default: { ttl: 60_000, limit: 5 } })
@Post('login')
async login(...)
```

Add `@Throttle({ default: { ttl: 60_000, limit: 20 } })` on `refresh` — directly above `@Post('refresh')`:

```typescript
@Throttle({ default: { ttl: 60_000, limit: 20 } })
@Post('refresh')
@HttpCode(HttpStatus.OK)
async refresh(...)
```

Add `@Throttle({ default: { ttl: 60_000, limit: 5 } })` on `changePassword` — directly above `@Post('change-password')`:

```typescript
@Throttle({ default: { ttl: 60_000, limit: 5 } })
@Post('change-password')
@ApiBearerAuth()
async changePassword(...)
```

- [ ] **Step 4: Add `@SkipThrottle()` to the health controller**

In `apps/server/src/health/health.controller.ts`, add the import:

```typescript
import { SkipThrottle } from '@nestjs/throttler';
```

Add `@SkipThrottle()` at the **class level**, directly above `@ApiTags('Health')`:

```typescript
@SkipThrottle()
@ApiTags('Health')
@Controller('health')
export class HealthController {
```

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npm run test --workspace=apps/server -- --testPathPattern="auth.controller.throttle"
```

Expected: all 5 tests pass.

- [ ] **Step 6: Run full test suite to check for regressions**

```bash
npm run test --workspace=apps/server
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/server/src/core/auth/presentation/rest/auth.controller.ts apps/server/src/core/auth/presentation/rest/auth.controller.throttle.spec.ts apps/server/src/health/health.controller.ts
git commit -m "feat(server:auth): per-endpoint rate limits — login/change-password 5/min, refresh 20/min"
```
