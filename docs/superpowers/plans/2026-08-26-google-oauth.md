# Google OAuth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google OAuth login to Food-Up, auto-linking existing password accounts by email on first Google sign-in, with employees migrating to Google-only and managers retaining both login methods.

**Architecture:** A new `GoogleStrategy` (passport-google-oauth20) validates the OAuth code exchange and passes `{ googleId, email }` to a new `AuthService.findOrLinkGoogleIdentity()` method, which looks up the identity by googleId then email, links if needed, and delegates session issuance to the existing `issueSessionForIdentity()`. The OAuth callback is a browser redirect, so the server responds with a redirect to `{WEB_APP_URL}/auth/callback?token=...`; a new transient frontend page reads the token, stores it in memory, and navigates to the app.

**Tech Stack:** `passport-google-oauth20`, `@types/passport-google-oauth20`, NestJS Passport, React Router, Zustand, i18next

**Spec:** `docs/superpowers/specs/2026-08-26-google-oauth-design.md`

## Global Constraints

- `passport-google-oauth20` is not yet installed — install it before any strategy code
- `IdentityType.Employee` covers both employees and managers; manager distinction requires checking `EmployeeRole.Manager` via `EmployeesService`
- Google OAuth callback URL registered in Google Cloud Console must include `/api/` prefix: `http://localhost:3000/api/auth/google/callback` (dev) and `https://yourdomain.com/api/auth/google/callback` (prod)
- `WEB_APP_URL` already exists in `EnvironmentVariables` — use it for post-callback redirects; do not add `FRONTEND_URL`
- ORM_SYNC=true in dev; no manual migration file needed for column changes
- Test runner: `npm run test` (server unit tests only)
- All new controller endpoints must have `@ApiOperation` and `@ApiResponse` Swagger decorators

---

## File Map

**Created:**
- `apps/server/src/core/identity/domain/identity.entity.spec.ts`
- `apps/server/src/core/auth/infrastructure/google.strategy.ts`
- `apps/server/src/core/auth/infrastructure/google-auth.guard.ts`
- `apps/web/src/features/auth/presentation/pages/auth-callback.page.tsx`
- `apps/web/src/features/auth/presentation/pages/_redirect-path.ts` *(extracted shared helper)*

**Modified:**
- `apps/server/src/core/identity/domain/identity.entity.ts`
- `apps/server/src/core/identity/domain/identity.repository.interface.ts`
- `apps/server/src/core/identity/infrastructure/persistence/identity.typeorm-entity.ts`
- `apps/server/src/core/identity/infrastructure/persistence/identity-typeorm.repository.ts`
- `apps/server/src/core/identity/application/identity.service.ts`
- `apps/server/src/core/auth/application/auth.service.ts`
- `apps/server/src/core/auth/infrastructure/local.strategy.ts`
- `apps/server/src/core/auth/presentation/rest/auth.controller.ts`
- `apps/server/src/core/auth/auth.module.ts`
- `apps/server/src/env.validation.ts`
- `apps/web/src/app/app.tsx`
- `apps/web/src/features/auth/presentation/pages/login.page.tsx`
- `apps/web/src/i18n/en/auth.json`
- `apps/web/src/i18n/sr/auth.json`

---

### Task 1: Install packages and add Google env vars

**Files:**
- Modify: `apps/server/package.json` (via npm install)
- Modify: `apps/server/src/env.validation.ts`

**Interfaces:**
- Produces: `EnvironmentVariables.GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` — all `string`, all `@IsString()`

- [ ] **Step 1: Install packages**

```bash
npm install passport-google-oauth20 --workspace=apps/server
npm install @types/passport-google-oauth20 --workspace=apps/server --save-dev
```

- [ ] **Step 2: Add env vars to EnvironmentVariables class**

In `apps/server/src/env.validation.ts`, add three fields after `JWT_REFRESH_EXPIRY_DAYS`:

```typescript
@IsString()
GOOGLE_CLIENT_ID: string;

@IsString()
GOOGLE_CLIENT_SECRET: string;

@IsString()
GOOGLE_CALLBACK_URL: string;
```

- [ ] **Step 3: Add placeholder values to local .env**

Add to `.env` (the file already exists in the repo root):

```
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

Use placeholder values — real values come from Google Cloud Console and are set by the developer separately. The app will start with placeholders; Google login won't work until real values are set.

- [ ] **Step 4: Verify server still starts**

```bash
npm run dev:server
```

Expected: NestJS starts on port 3000 without env validation errors.

- [ ] **Step 5: Commit**

```bash
git add apps/server/package.json apps/server/package-lock.json apps/server/src/env.validation.ts
git commit -m "feat(server): install passport-google-oauth20 and add Google env vars"
```

---

### Task 2: Extend Identity domain entity

**Files:**
- Modify: `apps/server/src/core/identity/domain/identity.entity.ts`
- Create: `apps/server/src/core/identity/domain/identity.entity.spec.ts`
- Modify: `apps/server/src/core/identity/application/identity.service.ts` (rename `create` caller)

**Interfaces:**
- Produces:
  - `Identity.createWithPassword(email: string, passwordHash: string, type: IdentityType, isActive?: boolean): Identity`
  - `Identity.createWithGoogle(email: string, googleId: string, type: IdentityType): Identity`
  - `Identity.reconstitute(id: string, email: string, passwordHash: string | null, type: IdentityType, isActive: boolean, googleId?: string | null): Identity`
  - `identity.linkGoogle(googleId: string, clearPassword: boolean): void`
  - `identity.googleId: string | null` (getter)
  - `identity.passwordHash: string | null` (existing getter, now nullable)

- [ ] **Step 1: Write failing tests**

Create `apps/server/src/core/identity/domain/identity.entity.spec.ts`:

```typescript
import { IdentityType } from '@food-up/shared';
import { Identity } from './identity.entity';

describe('Identity.createWithPassword', () => {
  it('creates identity with passwordHash set and googleId null', () => {
    const identity = Identity.createWithPassword('a@b.com', 'hash', IdentityType.Employee);
    expect(identity.passwordHash).toBe('hash');
    expect(identity.googleId).toBeNull();
  });
});

describe('Identity.createWithGoogle', () => {
  it('creates identity with googleId set and passwordHash null', () => {
    const identity = Identity.createWithGoogle('a@b.com', 'google-sub-123', IdentityType.Employee);
    expect(identity.googleId).toBe('google-sub-123');
    expect(identity.passwordHash).toBeNull();
  });
});

describe('Identity constructor invariant', () => {
  it('throws if both passwordHash and googleId are absent', () => {
    expect(() =>
      Identity.reconstitute('id', 'a@b.com', null, IdentityType.Employee, true, null),
    ).toThrow('Identity must have at least one authentication method');
  });

  it('does not throw when only passwordHash is present', () => {
    expect(() =>
      Identity.reconstitute('id', 'a@b.com', 'hash', IdentityType.Employee, true, null),
    ).not.toThrow();
  });

  it('does not throw when only googleId is present', () => {
    expect(() =>
      Identity.reconstitute('id', 'a@b.com', null, IdentityType.Employee, true, 'gid'),
    ).not.toThrow();
  });
});

describe('Identity.linkGoogle', () => {
  it('sets googleId without clearing passwordHash when clearPassword=false', () => {
    const identity = Identity.createWithPassword('a@b.com', 'hash', IdentityType.Employee);
    identity.linkGoogle('google-sub-123', false);
    expect(identity.googleId).toBe('google-sub-123');
    expect(identity.passwordHash).toBe('hash');
  });

  it('sets googleId and nulls passwordHash when clearPassword=true', () => {
    const identity = Identity.createWithPassword('a@b.com', 'hash', IdentityType.Employee);
    identity.linkGoogle('google-sub-123', true);
    expect(identity.googleId).toBe('google-sub-123');
    expect(identity.passwordHash).toBeNull();
  });
});

describe('Identity.isPasswordValid', () => {
  it('returns false immediately when passwordHash is null', async () => {
    const identity = Identity.createWithGoogle('a@b.com', 'gid', IdentityType.Employee);
    const result = await identity.isPasswordValid('any', jest.fn());
    expect(result).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test -- --testPathPattern="identity.entity.spec"
```

Expected: FAIL — `Identity.createWithPassword` not found, `googleId` not found, etc.

- [ ] **Step 3: Rewrite the Identity entity**

Replace the full contents of `apps/server/src/core/identity/domain/identity.entity.ts`:

```typescript
import { IdentityType } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { IdentityActiveStatusChangedEvent } from './events/identity-active-status-changed.event';

export class Identity extends Entity {
  static createWithPassword(
    email: string,
    passwordHash: string,
    type: IdentityType,
    isActive: boolean = true,
  ): Identity {
    return new Identity(generateId(), email, passwordHash, type, isActive, null);
  }

  static createWithGoogle(
    email: string,
    googleId: string,
    type: IdentityType,
  ): Identity {
    return new Identity(generateId(), email, null, type, true, googleId);
  }

  static reconstitute(
    id: string,
    email: string,
    passwordHash: string | null,
    type: IdentityType,
    isActive: boolean = true,
    googleId: string | null = null,
  ): Identity {
    return new Identity(id, email, passwordHash, type, isActive, googleId);
  }

  private constructor(
    id: string,
    email: string,
    passwordHash: string | null,
    type: IdentityType,
    isActive: boolean,
    googleId: string | null,
  ) {
    super();
    if (!passwordHash && !googleId) {
      throw new Error('Identity must have at least one authentication method');
    }
    this._id = id;
    this._email = email;
    this._passwordHash = passwordHash;
    this._type = type;
    this._isActive = isActive;
    this._googleId = googleId;
  }

  private readonly _id: string;
  private readonly _email: string;
  private _passwordHash: string | null;
  private readonly _type: IdentityType;
  private _isActive: boolean;
  private _googleId: string | null;

  get id(): string { return this._id; }
  get email(): string { return this._email; }
  get passwordHash(): string | null { return this._passwordHash; }
  get type(): IdentityType { return this._type; }
  get isActive(): boolean { return this._isActive; }
  get googleId(): string | null { return this._googleId; }

  set isActive(value: boolean) {
    this._isActive = value;
    this.addDomainEvent(new IdentityActiveStatusChangedEvent(this.id, value));
  }

  linkGoogle(googleId: string, clearPassword: boolean): void {
    this._googleId = googleId;
    if (clearPassword) {
      this._passwordHash = null;
    }
  }

  isPasswordValid(
    password: string,
    hashComparer: (password: string, hash: string) => Promise<boolean>,
  ): Promise<boolean> {
    if (!this._passwordHash) return Promise.resolve(false);
    return hashComparer(password, this._passwordHash);
  }
}
```

- [ ] **Step 4: Fix the one caller of the old `Identity.create()` in IdentityService**

In `apps/server/src/core/identity/application/identity.service.ts`, change line 24:

```typescript
// Before:
const entity = Identity.create(
  dto.email,
  passwordHash,
  dto.type as IdentityType,
  dto.isActive ?? true,
);

// After:
const entity = Identity.createWithPassword(
  dto.email,
  passwordHash,
  dto.type as IdentityType,
  dto.isActive ?? true,
);
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm run test -- --testPathPattern="identity.entity.spec"
```

Expected: all 7 tests PASS.

- [ ] **Step 6: Run full test suite to confirm no regressions**

```bash
npm run test
```

Expected: all existing tests PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/server/src/core/identity/domain/identity.entity.ts \
        apps/server/src/core/identity/domain/identity.entity.spec.ts \
        apps/server/src/core/identity/application/identity.service.ts
git commit -m "feat(server): extend Identity entity with googleId and linkGoogle"
```

---

### Task 3: Update Identity persistence layer

**Files:**
- Modify: `apps/server/src/core/identity/infrastructure/persistence/identity.typeorm-entity.ts`
- Modify: `apps/server/src/core/identity/domain/identity.repository.interface.ts`
- Modify: `apps/server/src/core/identity/infrastructure/persistence/identity-typeorm.repository.ts`

**Interfaces:**
- Consumes: `Identity.reconstitute(..., googleId: string | null)` from Task 2
- Produces: `IIdentityRepository.findByGoogleId(googleId: string): Promise<Identity | null>`

- [ ] **Step 1: Update the TypeORM entity**

Replace `apps/server/src/core/identity/infrastructure/persistence/identity.typeorm-entity.ts`:

```typescript
import { Employee } from 'src/core/employees/infrastructure/persistence/employee.typeorm-entity';
import { Supplier } from 'src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { IdentityType } from '@food-up/shared';

@Entity()
export class Identity {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('varchar', { unique: true, length: 255 })
  email: string;

  @Column('varchar', { length: 255, nullable: true })
  passwordHash: string | null;

  @Column('varchar', { length: 255, nullable: true, unique: true })
  googleId: string | null;

  @Column('enum', { enum: IdentityType })
  type: IdentityType;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Employee)
  employee?: Employee;

  @OneToOne(() => Supplier)
  supplier?: Supplier;
}
```

- [ ] **Step 2: Add `findByGoogleId` to the repository interface**

In `apps/server/src/core/identity/domain/identity.repository.interface.ts`:

```typescript
import { Identity } from './identity.entity';

export const I_IDENTITY_REPOSITORY = Symbol('IIdentityRepository');

export interface IIdentityRepository {
  findByEmail(email: string): Promise<Identity | null>;
  findById(id: string): Promise<Identity | null>;
  findByGoogleId(googleId: string): Promise<Identity | null>;
  create(identity: Identity): Promise<Identity>;
  update(id: string, update: Partial<Identity>): Promise<Identity>;
  delete(id: string): Promise<void>;
}
```

- [ ] **Step 3: Implement `findByGoogleId` in the TypeORM repository and update `toDomain`**

Replace `apps/server/src/core/identity/infrastructure/persistence/identity-typeorm.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { Identity } from '../../domain/identity.entity';
import { IIdentityRepository } from '../../domain/identity.repository.interface';
import { Identity as IdentityTypeormEntity } from './identity.typeorm-entity';

@Injectable()
export class IdentityTypeOrmRepository implements IIdentityRepository {
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repo(): Repository<IdentityTypeormEntity> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(IdentityTypeormEntity)
      : this._dataSource.getRepository(IdentityTypeormEntity);
  }

  async findByEmail(email: string): Promise<Identity | null> {
    const entity = await this._repo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findById(id: string): Promise<Identity | null> {
    const entity = await this._repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByGoogleId(googleId: string): Promise<Identity | null> {
    const entity = await this._repo.findOne({ where: { googleId } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(identity: Identity): Promise<Identity> {
    const entity = this._repo.create(identity);
    const saved = await this._repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, update: Partial<Identity>): Promise<Identity> {
    await this._repo.update(id, update);
    const updated = await this._repo.findOne({ where: { id } });
    if (!updated) throw new Error('Identity not found');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this._repo.delete(id);
  }

  private toDomain(entity: IdentityTypeormEntity): Identity {
    return Identity.reconstitute(
      entity.id,
      entity.email,
      entity.passwordHash,
      entity.type,
      entity.isActive,
      entity.googleId ?? null,
    );
  }
}
```

- [ ] **Step 4: Run the full test suite**

```bash
npm run test
```

Expected: all tests PASS (no DB tests exist; schema sync handled by `ORM_SYNC=true`).

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/core/identity/domain/identity.repository.interface.ts \
        apps/server/src/core/identity/infrastructure/persistence/identity.typeorm-entity.ts \
        apps/server/src/core/identity/infrastructure/persistence/identity-typeorm.repository.ts
git commit -m "feat(server): add googleId column to Identity and findByGoogleId repository method"
```

---

### Task 4: Add findByGoogleId and linkGoogle to IdentityService

**Files:**
- Modify: `apps/server/src/core/identity/application/identity.service.ts`

**Interfaces:**
- Consumes: `IIdentityRepository.findByGoogleId` from Task 3; `Identity.linkGoogle` from Task 2
- Produces:
  - `IdentityService.findByGoogleId(googleId: string): Promise<Identity | null>`
  - `IdentityService.linkGoogle(identityId: string, googleId: string, clearPassword: boolean): Promise<void>`

- [ ] **Step 1: Add the two methods to IdentityService**

In `apps/server/src/core/identity/application/identity.service.ts`, add after `findById()`:

```typescript
async findByGoogleId(googleId: string): Promise<Identity | null> {
  return this._repository.findByGoogleId(googleId);
}

async linkGoogle(identityId: string, googleId: string, clearPassword: boolean): Promise<void> {
  const identity = await this._repository.findById(identityId);
  if (!identity) throw new Error(`Identity not found: ${identityId}`);
  identity.linkGoogle(googleId, clearPassword);
  const update: Record<string, unknown> = { googleId: identity.googleId };
  if (clearPassword) update.passwordHash = null;
  await this._repository.update(identityId, update as unknown as Partial<Identity>);
  this._logger.log(`Google linked for identity: id=${identityId}`, IdentityService.name);
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npm run test
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/core/identity/application/identity.service.ts
git commit -m "feat(server): add findByGoogleId and linkGoogle to IdentityService"
```

---

### Task 5: Harden LocalStrategy against Google-only accounts

**Files:**
- Modify: `apps/server/src/core/auth/application/auth.service.ts`
- Modify: `apps/server/src/core/auth/infrastructure/local.strategy.ts`

**Interfaces:**
- Consumes: `IdentityService.findByEmail` (existing); `identity.passwordHash` getter (now `string | null`)
- Produces: `AuthService.validateLocalCredentials` now throws `UnauthorizedException('This account uses Google login')` for null-password identities instead of returning null

- [ ] **Step 1: Write failing tests**

Create `apps/server/src/core/auth/application/auth.service.local-guard.spec.ts`:

```typescript
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Identity } from 'src/core/identity/domain/identity.entity';
import { IdentityType } from '@food-up/shared';

const mockIdentityService = {
  findByEmail: jest.fn(),
  validateCredentials: jest.fn(),
  findByGoogleId: jest.fn(),
};

const mockRtRepo = { findById: jest.fn(), create: jest.fn(), markUsed: jest.fn(), revoke: jest.fn(), revokeFamily: jest.fn() };
const mockEmployeesService = { findByIdentity: jest.fn() };
const mockJwtService = { signAsync: jest.fn() };
const mockConfig = { get: jest.fn() };

function makeService(): AuthService {
  return new AuthService(
    mockRtRepo as any,
    mockIdentityService as any,
    mockEmployeesService as any,
    mockJwtService as any,
    mockConfig as any,
  );
}

describe('AuthService.validateLocalCredentials', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null when no identity found for email', async () => {
    mockIdentityService.findByEmail.mockResolvedValue(null);
    const result = await makeService().validateLocalCredentials('x@y.com', 'pass');
    expect(result).toBeNull();
  });

  it('throws UnauthorizedException for Google-only account (passwordHash null)', async () => {
    const googleOnly = Identity.createWithGoogle('x@y.com', 'gid', IdentityType.Employee);
    mockIdentityService.findByEmail.mockResolvedValue(googleOnly);
    await expect(makeService().validateLocalCredentials('x@y.com', 'pass'))
      .rejects.toThrow(new UnauthorizedException('This account uses Google login'));
  });

  it('returns null when password is wrong', async () => {
    mockIdentityService.findByEmail.mockResolvedValue(
      Identity.createWithPassword('x@y.com', 'hash', IdentityType.Employee)
    );
    mockIdentityService.validateCredentials.mockRejectedValue(new Error('Invalid credentials'));
    const result = await makeService().validateLocalCredentials('x@y.com', 'wrongpass');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

```bash
npm run test -- --testPathPattern="auth.service.local-guard"
```

Expected: FAIL — `validateLocalCredentials` currently does not throw for Google-only accounts.

- [ ] **Step 3: Update `validateLocalCredentials` in AuthService**

In `apps/server/src/core/auth/application/auth.service.ts`, replace the `validateLocalCredentials` method:

```typescript
async validateLocalCredentials(email: string, password: string): Promise<Identity | null> {
  const identity = await this._identityService.findByEmail(email);
  if (!identity) return null;
  if (!identity.passwordHash) {
    throw new UnauthorizedException('This account uses Google login');
  }
  try {
    return await this._identityService.validateCredentials(email, password);
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Update `LocalStrategy.validate` to let UnauthorizedException propagate**

Replace `apps/server/src/core/auth/infrastructure/local.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Identity } from 'src/core/identity/domain/identity.entity';
import { AuthService } from '../application/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly _authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<Identity> {
    // UnauthorizedException from validateLocalCredentials (e.g., Google-only account) propagates
    const identity = await this._authService.validateLocalCredentials(email, password);
    if (!identity) throw new UnauthorizedException('Invalid credentials');
    return identity;
  }
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm run test -- --testPathPattern="auth.service.local-guard"
```

Expected: all 3 tests PASS.

- [ ] **Step 6: Run full test suite**

```bash
npm run test
```

Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/server/src/core/auth/application/auth.service.ts \
        apps/server/src/core/auth/application/auth.service.local-guard.spec.ts \
        apps/server/src/core/auth/infrastructure/local.strategy.ts
git commit -m "feat(server): block password login for Google-only accounts in LocalStrategy"
```

---

### Task 6: Add GoogleStrategy and GoogleAuthGuard

**Files:**
- Create: `apps/server/src/core/auth/infrastructure/google.strategy.ts`
- Create: `apps/server/src/core/auth/infrastructure/google-auth.guard.ts`
- Modify: `apps/server/src/core/auth/auth.module.ts`

**Interfaces:**
- Produces: `GoogleAuthGuard` (extends `AuthGuard('google')`); `GoogleStrategy` sets `req.user = { googleId: string; email: string }`

- [ ] **Step 1: Create GoogleStrategy**

Create `apps/server/src/core/auth/infrastructure/google.strategy.ts`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { EnvironmentVariables } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(I_CONFIG_SERVICE)
    config: IConfigService<EnvironmentVariables, true>,
  ) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID'),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { id: string; emails: Array<{ value: string }> },
    done: VerifyCallback,
  ): void {
    done(null, { googleId: profile.id, email: profile.emails[0].value });
  }
}
```

- [ ] **Step 2: Create GoogleAuthGuard**

Create `apps/server/src/core/auth/infrastructure/google-auth.guard.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
```

- [ ] **Step 3: Register both in AuthModule**

In `apps/server/src/core/auth/auth.module.ts`, add to imports and providers:

```typescript
import { GoogleStrategy } from './infrastructure/google.strategy';
import { GoogleAuthGuard } from './infrastructure/google-auth.guard';
```

Add `GoogleStrategy` and `GoogleAuthGuard` to the `providers` array (alongside `LocalStrategy` and `LocalAuthGuard`).

- [ ] **Step 4: Run the full test suite**

```bash
npm run test
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/core/auth/infrastructure/google.strategy.ts \
        apps/server/src/core/auth/infrastructure/google-auth.guard.ts \
        apps/server/src/core/auth/auth.module.ts
git commit -m "feat(server): add GoogleStrategy and GoogleAuthGuard"
```

---

### Task 7: AuthService.findOrLinkGoogleIdentity and controller endpoints

**Files:**
- Modify: `apps/server/src/core/auth/application/auth.service.ts`
- Modify: `apps/server/src/core/auth/presentation/rest/auth.controller.ts`

**Interfaces:**
- Consumes: `IdentityService.findByGoogleId`, `IdentityService.findByEmail`, `IdentityService.findById`, `IdentityService.linkGoogle`, `EmployeesService.findByIdentity`, `AuthService.issueSessionForIdentity` (all existing)
- Produces:
  - `AuthService.findOrLinkGoogleIdentity(googleId: string, email: string): Promise<Identity>`
  - `GET /auth/google` — `@Public()`, `@UseGuards(GoogleAuthGuard)`, redirects to Google
  - `GET /auth/google/callback` — `@Public()`, `@UseGuards(GoogleAuthGuard)`, sets cookie, redirects to `{WEB_APP_URL}/auth/callback?token=...`

- [ ] **Step 1: Write failing tests for findOrLinkGoogleIdentity**

Create `apps/server/src/core/auth/application/auth.service.google-link.spec.ts`:

```typescript
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Identity } from 'src/core/identity/domain/identity.entity';
import { IdentityType, EmployeeRole } from '@food-up/shared';

const mockIdentityService = {
  findByGoogleId: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  linkGoogle: jest.fn(),
};
const mockEmployeesService = { findByIdentity: jest.fn() };
const mockRtRepo = { findById: jest.fn(), create: jest.fn(), markUsed: jest.fn(), revoke: jest.fn(), revokeFamily: jest.fn() };
const mockJwtService = { signAsync: jest.fn() };
const mockConfig = { get: jest.fn() };

function makeService(): AuthService {
  return new AuthService(
    mockRtRepo as any,
    mockIdentityService as any,
    mockEmployeesService as any,
    mockJwtService as any,
    mockConfig as any,
  );
}

describe('AuthService.findOrLinkGoogleIdentity', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns existing identity when googleId already linked', async () => {
    const existing = Identity.createWithGoogle('a@b.com', 'gid', IdentityType.Employee);
    mockIdentityService.findByGoogleId.mockResolvedValue(existing);
    const result = await makeService().findOrLinkGoogleIdentity('gid', 'a@b.com');
    expect(result).toBe(existing);
    expect(mockIdentityService.findByEmail).not.toHaveBeenCalled();
  });

  it('links Google and clears password for a regular employee', async () => {
    mockIdentityService.findByGoogleId.mockResolvedValue(null);
    const employee = Identity.createWithPassword('emp@b.com', 'hash', IdentityType.Employee);
    mockIdentityService.findByEmail.mockResolvedValue(employee);
    mockEmployeesService.findByIdentity.mockResolvedValue({ role: EmployeeRole.Basic });
    mockIdentityService.linkGoogle.mockResolvedValue(undefined);
    mockIdentityService.findById.mockResolvedValue(employee);

    await makeService().findOrLinkGoogleIdentity('gid', 'emp@b.com');

    expect(mockIdentityService.linkGoogle).toHaveBeenCalledWith(
      employee.id,
      'gid',
      true, // clearPassword=true for non-manager employee
    );
  });

  it('links Google and keeps password for a manager employee', async () => {
    mockIdentityService.findByGoogleId.mockResolvedValue(null);
    const manager = Identity.createWithPassword('mgr@b.com', 'hash', IdentityType.Employee);
    mockIdentityService.findByEmail.mockResolvedValue(manager);
    mockEmployeesService.findByIdentity.mockResolvedValue({ role: EmployeeRole.Manager });
    mockIdentityService.linkGoogle.mockResolvedValue(undefined);
    mockIdentityService.findById.mockResolvedValue(manager);

    await makeService().findOrLinkGoogleIdentity('gid', 'mgr@b.com');

    expect(mockIdentityService.linkGoogle).toHaveBeenCalledWith(
      manager.id,
      'gid',
      false, // clearPassword=false for manager
    );
  });

  it('throws UnauthorizedException when email has no account', async () => {
    mockIdentityService.findByGoogleId.mockResolvedValue(null);
    mockIdentityService.findByEmail.mockResolvedValue(null);
    await expect(makeService().findOrLinkGoogleIdentity('gid', 'unknown@b.com'))
      .rejects.toThrow(UnauthorizedException);
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

```bash
npm run test -- --testPathPattern="auth.service.google-link"
```

Expected: FAIL — `findOrLinkGoogleIdentity` does not exist yet.

- [ ] **Step 3: Add findOrLinkGoogleIdentity to AuthService**

In `apps/server/src/core/auth/application/auth.service.ts`, add the import and the method. Add these imports at the top if not already present:

```typescript
import { EmployeeRole, IdentityType } from '@food-up/shared';
```

Add the method after `validateLocalCredentials`:

```typescript
async findOrLinkGoogleIdentity(googleId: string, email: string): Promise<Identity> {
  const existing = await this._identityService.findByGoogleId(googleId);
  if (existing) return existing;

  const identity = await this._identityService.findByEmail(email);
  if (!identity) {
    throw new UnauthorizedException(
      'No account found for this Google email. Ask your manager to create an account first.',
    );
  }

  let clearPassword = false;
  if (identity.type === IdentityType.Employee) {
    const employee = await this._employeesService.findByIdentity(identity.id);
    clearPassword = employee?.role !== EmployeeRole.Manager;
  }

  await this._identityService.linkGoogle(identity.id, googleId, clearPassword);

  const linked = await this._identityService.findById(identity.id);
  if (!linked) throw new UnauthorizedException('Identity not found after Google linking');
  return linked;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test -- --testPathPattern="auth.service.google-link"
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Add Google endpoints to AuthController**

In `apps/server/src/core/auth/presentation/rest/auth.controller.ts`:

Add these imports:

```typescript
import { GoogleAuthGuard } from '../../infrastructure/google-auth.guard';
```

Add `_webAppUrl` to the constructor. In the constructor body, add:

```typescript
private readonly _webAppUrl: string;

constructor(
  private readonly _authService: AuthService,
  private readonly _employeesService: EmployeesService,
  @Inject(I_CONFIG_SERVICE)
  config: IConfigService<EnvironmentVariables, true>,
) {
  this._isProduction = config.get('NODE_ENV') === NodeEnv.Production;
  this._webAppUrl = config.get('WEB_APP_URL');
}
```

Add the two endpoints after the `logout` handler:

```typescript
@ApiOperation({ summary: 'Initiate Google OAuth login — redirects to Google' })
@ApiResponse({ status: 302, description: 'Redirects to Google login page' })
@Public()
@UseGuards(GoogleAuthGuard)
@Get('google')
async googleLogin(): Promise<void> {
  // GoogleAuthGuard handles the redirect; this handler body never executes
}

@ApiOperation({ summary: 'Google OAuth callback — sets session and redirects to frontend' })
@ApiResponse({ status: 302, description: 'Redirects to frontend /auth/callback with token' })
@Public()
@UseGuards(GoogleAuthGuard)
@Get('google/callback')
async googleCallback(
  @Req() req: Request,
  @Res() res: Response,
): Promise<void> {
  try {
    const { googleId, email } = req.user as { googleId: string; email: string };
    const identity = await this._authService.findOrLinkGoogleIdentity(googleId, email);
    const { accessToken, rawRefreshToken } = await this._authService.issueSessionForIdentity(identity.id);

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOptions(this._isProduction));
    res.redirect(`${this._webAppUrl}/auth/callback?token=${encodeURIComponent(accessToken)}`);
  } catch {
    res.redirect(`${this._webAppUrl}/auth/callback?error=google_auth_failed`);
  }
}
```

Note: `@Res()` here has no `{ passthrough: true }` because the handler calls `res.redirect()` directly — NestJS must not attempt to send an additional response.

- [ ] **Step 6: Run full test suite**

```bash
npm run test
```

Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/server/src/core/auth/application/auth.service.ts \
        apps/server/src/core/auth/application/auth.service.google-link.spec.ts \
        apps/server/src/core/auth/presentation/rest/auth.controller.ts
git commit -m "feat(server): add findOrLinkGoogleIdentity and Google OAuth controller endpoints"
```

---

### Task 8: Frontend auth callback page and route

**Files:**
- Create: `apps/web/src/features/auth/presentation/pages/_redirect-path.ts`
- Create: `apps/web/src/features/auth/presentation/pages/auth-callback.page.tsx`
- Modify: `apps/web/src/app/app.tsx`
- Modify: `apps/web/src/i18n/en/auth.json` (googleError key)
- Modify: `apps/web/src/i18n/sr/auth.json` (googleError key)

**Interfaces:**
- Consumes: `tokenStore.set(token: string)`, `authService.restoreSession(): Promise<User | null>`, `useAuthStore.setUser`
- Produces: `/auth/callback` route that processes the OAuth redirect

- [ ] **Step 1: Extract shared redirect path helper**

Create `apps/web/src/features/auth/presentation/pages/_redirect-path.ts`:

```typescript
import { EmployeeRole, IdentityType } from '@food-up/shared';

export function getRedirectPath(type: IdentityType, role?: EmployeeRole): string {
  switch (type) {
    case IdentityType.Employee:
      return role === EmployeeRole.Manager ? '/employee/manager' : '/employee';
    case IdentityType.Supplier:
      return '/supplier';
    case IdentityType.Business:
      return '/business';
    case IdentityType.Admin:
      return '/admin';
  }
}
```

- [ ] **Step 2: Update login.page.tsx to use the shared helper**

In `apps/web/src/features/auth/presentation/pages/login.page.tsx`, remove the local `getRedirectPath` function (lines 117–128) and add this import instead:

```typescript
import { getRedirectPath } from './_redirect-path';
```

- [ ] **Step 3: Create the auth callback page**

Create `apps/web/src/features/auth/presentation/pages/auth-callback.page.tsx`:

```tsx
import { tokenStore } from '@/shared/infrastructure/auth/token-store';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRedirectPath } from './_redirect-path';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authService } = useServices();
  const setUser = useAuthStore((s) => s.setUser);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (!token || error) {
      navigate('/login', { replace: true, state: { googleError: true } });
      return;
    }

    tokenStore.set(token);
    window.history.replaceState({}, '', window.location.pathname);

    authService.restoreSession().then((user) => {
      if (!user) {
        navigate('/login', { replace: true, state: { googleError: true } });
        return;
      }
      setUser(user);
      navigate(getRedirectPath(user.type, user.role), { replace: true });
    });
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
    </div>
  );
}
```

- [ ] **Step 4: Register the route in app.tsx**

In `apps/web/src/app/app.tsx`, add the import:

```typescript
import AuthCallbackPage from '@/features/auth/presentation/pages/auth-callback.page';
```

Add the route as the **first** child under `<Routes>`, outside both `AuthLayout` and `MainLayout`:

```tsx
<Routes>
  <Route path='/auth/callback' element={<AuthCallbackPage />} />

  {/* Auth routes */}
  <Route element={<AuthLayout />}>
    ...
```

- [ ] **Step 5: Add googleError i18n key**

In `apps/web/src/i18n/en/auth.json`, add to the `login` object:

```json
"googleError": "Google login failed. Please try again."
```

In `apps/web/src/i18n/sr/auth.json`, add to the `login` object:

```json
"googleError": "Google prijava nije uspela. Pokušajte ponovo."
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/auth/presentation/pages/_redirect-path.ts \
        apps/web/src/features/auth/presentation/pages/auth-callback.page.tsx \
        apps/web/src/features/auth/presentation/pages/login.page.tsx \
        apps/web/src/app/app.tsx \
        apps/web/src/i18n/en/auth.json \
        apps/web/src/i18n/sr/auth.json
git commit -m "feat(web): add Google OAuth callback page and route"
```

---

### Task 9: Google login button on login page

**Files:**
- Modify: `apps/web/src/features/auth/presentation/pages/login.page.tsx`
- Modify: `apps/web/src/i18n/en/auth.json`
- Modify: `apps/web/src/i18n/sr/auth.json`

**Interfaces:**
- Consumes: navigation state `{ googleError: boolean }` set by `AuthCallbackPage`; `t('login.googleButton')`, `t('login.googleError')`, `t('login.orDivider')` i18n keys

- [ ] **Step 1: Add i18n keys**

In `apps/web/src/i18n/en/auth.json`, add to the `login` object (if not already added in Task 8):

```json
"googleButton": "Continue with Google",
"orDivider": "or"
```

In `apps/web/src/i18n/sr/auth.json`, add to the `login` object:

```json
"googleButton": "Nastavi sa Google-om",
"orDivider": "ili"
```

- [ ] **Step 2: Update LoginPage to show Google button and error**

In `apps/web/src/features/auth/presentation/pages/login.page.tsx`:

Add `useLocation` import:

```typescript
import { Link, Navigate, useLocation } from 'react-router-dom';
```

Add location state check after the existing `const user = useAuthStore(...)` line:

```typescript
const location = useLocation();
const hasGoogleError = (location.state as { googleError?: boolean } | null)?.googleError;
```

In the JSX, replace the `<CardFooter>` block with the following (adds the divider, Google button, and error state below the existing form; keep the CardFooter as-is and add before it):

```tsx
<div className='flex items-center gap-3 px-6'>
  <div className='bg-border h-px flex-1' />
  <span className='text-muted-foreground text-xs'>{t('login.orDivider')}</span>
  <div className='bg-border h-px flex-1' />
</div>
<CardContent className='pt-0'>
  {hasGoogleError && (
    <p className='text-destructive mb-3 text-sm'>{t('login.googleError')}</p>
  )}
  <Button variant='outline' className='w-full' asChild>
    <a href='/api/auth/google'>{t('login.googleButton')}</a>
  </Button>
</CardContent>
```

Place this block between the closing `</CardContent>` (of the form) and the `<CardFooter>` (the "no account?" link).

- [ ] **Step 3: Start dev server and verify manually**

```bash
npm run start:dev
```

Open `http://localhost:5000/login`. Confirm:
- "Continue with Google" button is visible below the password form
- Clicking the button navigates to `http://localhost:3000/api/auth/google` (you will see a Google error since real credentials aren't configured yet — that's expected)
- When navigated back with `?error=...`, the error message appears on the login page

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/auth/presentation/pages/login.page.tsx \
        apps/web/src/i18n/en/auth.json \
        apps/web/src/i18n/sr/auth.json
git commit -m "feat(web): add Google login button and error state to login page"
```

---

## Post-Implementation

Once all tasks are complete and real Google Cloud Console credentials are configured in `.env` and production env:

1. Register redirect URIs in Google Cloud Console:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
2. Set real `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` in `.env` and production environment
3. Test the full flow end-to-end with a real Google Workspace account
