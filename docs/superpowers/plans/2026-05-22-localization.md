# Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add English/Serbian language support — stored per-user, per-supplier, and per-business — governing UI rendering, outbound emails, and Excel exports.

**Architecture:** `Language` enum added to `shared/`. Four backend entities (`UserPreferences`, `Supplier`, `BusinessSupplier`, `Business`) gain a `language` column (auto-synced via `ORM_SYNC=true`). A stateless `SuppliersDomainService` encapsulates managed-vs-standalone language resolution. Frontend uses `i18next` + `react-i18next` with TypeScript-validated keys; language is stored in Zustand and synced with the server via `PATCH /me/preferences`.

**Tech Stack:** NestJS 11 + TypeORM (backend), React 19 + i18next + react-i18next + i18next-browser-languagedetector (frontend), shared TypeScript enums/interfaces

---

### Task 1: Shared — Language enum + updated interfaces

**Files:**
- Create: `shared/src/enums/language.enum.ts`
- Modify: `shared/src/enums/index.ts`
- Create: `shared/src/interfaces/business.ts`
- Modify: `shared/src/interfaces/supplier.ts`
- Modify: `shared/src/interfaces/user-preferences.ts`
- Modify: `shared/src/interfaces/index.ts`

- [ ] **Step 1: Create the Language enum**

`shared/src/enums/language.enum.ts`:
```typescript
export enum Language {
  En = 'en',
  Sr = 'sr',
}
```

- [ ] **Step 2: Export from enums index**

In `shared/src/enums/index.ts`, add at the end:
```typescript
export * from './language.enum';
```

- [ ] **Step 3: Update user-preferences interfaces**

`shared/src/interfaces/user-preferences.ts`:
```typescript
import { Language } from '../enums/language.enum';
import { ThemePreference } from '../enums/theme-preference.enum';

export interface IUserPreferencesResponse {
  theme: ThemePreference;
  language: Language;
}

export interface IUpdateUserPreferences {
  theme?: ThemePreference;
  language?: Language;
}
```

- [ ] **Step 4: Update supplier interfaces**

`shared/src/interfaces/supplier.ts`:
```typescript
import { Language } from '../enums/language.enum';
import { SupplierType } from '../enums/supplier-type.enum';

export interface ISupplierResponse {
  id: string;
  name: string;
  type: SupplierType;
  contactInfo: string;
  businessIds: string[];
  managingBusinessId?: string;
  language: Language;
}

export interface ICreateManagedSupplier {
  name: string;
  contactInfo: string;
  language: Language;
}

export interface IUpdateSupplier {
  name?: string;
  contactInfo?: string;
  language?: Language;
}
```

- [ ] **Step 5: Create business interfaces file**

`shared/src/interfaces/business.ts`:
```typescript
import { Language } from '../enums/language.enum';

export interface IUpdateBusinessLanguage {
  language: Language;
}
```

- [ ] **Step 6: Export business interfaces from index**

In `shared/src/interfaces/index.ts`, add at the end:
```typescript
export * from './business';
```

- [ ] **Step 7: Build shared to verify no type errors**

Run: `npm run build --workspace=shared`
Expected: exit 0, no errors

- [ ] **Step 8: Commit**

```bash
git add shared/
git commit -m "feat(shared): add Language enum and localization interfaces"
```

---

### Task 2: Backend — UserPreferences language field

**Files:**
- Modify: `apps/server/src/core/user-preferences/domain/user-preferences.entity.ts`
- Modify: `apps/server/src/core/user-preferences/infrastructure/persistence/user-preferences.typeorm-entity.ts`
- Modify: `apps/server/src/core/user-preferences/infrastructure/persistence/user-preferences-typeorm.repository.ts`
- Modify: `apps/server/src/core/user-preferences/application/user-preferences.service.ts`
- Modify: `apps/server/src/core/user-preferences/presentation/rest/dto/update-user-preferences-request.dto.ts`
- Modify: `apps/server/src/core/user-preferences/presentation/rest/dto/user-preferences-response.dto.ts`
- Modify: `apps/server/src/core/user-preferences/presentation/rest/user-preferences.controller.ts`

- [ ] **Step 1: Update domain entity**

`apps/server/src/core/user-preferences/domain/user-preferences.entity.ts`:
```typescript
import { Language, ThemePreference } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';

export class UserPreferences extends Entity {
  static create(
    identityId: string,
    theme: ThemePreference = ThemePreference.System,
    language: Language = Language.En,
  ): UserPreferences {
    return new UserPreferences(generateId(), identityId, theme, language);
  }

  static reconstitute(
    id: string,
    identityId: string,
    theme: ThemePreference,
    language: Language,
  ): UserPreferences {
    return new UserPreferences(id, identityId, theme, language);
  }

  private constructor(
    id: string,
    identityId: string,
    theme: ThemePreference,
    language: Language,
  ) {
    super();
    this._id = id;
    this._identityId = identityId;
    this._theme = theme;
    this._language = language;
  }

  private readonly _id: string;
  private readonly _identityId: string;
  private _theme: ThemePreference;
  private _language: Language;

  get id(): string { return this._id; }
  get identityId(): string { return this._identityId; }
  get theme(): ThemePreference { return this._theme; }
  set theme(theme: ThemePreference) { this._theme = theme; }
  get language(): Language { return this._language; }
  set language(language: Language) { this._language = language; }
}
```

- [ ] **Step 2: Update TypeORM entity**

`apps/server/src/core/user-preferences/infrastructure/persistence/user-preferences.typeorm-entity.ts`:
```typescript
import { Language, ThemePreference } from '@food-up/shared';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user_preferences')
export class UserPreferencesTypeOrmEntity {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26, unique: true })
  identityId: string;

  @Column('enum', { enum: ThemePreference, default: ThemePreference.System })
  theme: ThemePreference;

  @Column('enum', { enum: Language, default: Language.En })
  language: Language;
}
```

- [ ] **Step 3: Update repository to persist and reconstitute language**

`apps/server/src/core/user-preferences/infrastructure/persistence/user-preferences-typeorm.repository.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { UserPreferences } from '../../domain/user-preferences.entity';
import { IUserPreferencesRepository } from '../../domain/user-preferences.repository.interface';
import { UserPreferencesTypeOrmEntity } from './user-preferences.typeorm-entity';

@Injectable()
export class UserPreferencesTypeOrmRepository implements IUserPreferencesRepository {
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repo(): Repository<UserPreferencesTypeOrmEntity> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(UserPreferencesTypeOrmEntity)
      : this._dataSource.getRepository(UserPreferencesTypeOrmEntity);
  }

  async findByIdentityId(identityId: string): Promise<UserPreferences | null> {
    const entity = await this._repo.findOne({ where: { identityId } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(prefs: UserPreferences): Promise<UserPreferences> {
    const entity = this._repo.create({
      id: prefs.id,
      identityId: prefs.identityId,
      theme: prefs.theme,
      language: prefs.language,
    });
    const saved = await this._repo.save(entity);
    return this.toDomain(saved);
  }

  async update(prefs: UserPreferences): Promise<UserPreferences> {
    await this._repo.update(
      { id: prefs.id },
      { theme: prefs.theme, language: prefs.language },
    );
    return prefs;
  }

  private toDomain(entity: UserPreferencesTypeOrmEntity): UserPreferences {
    return UserPreferences.reconstitute(
      entity.id,
      entity.identityId,
      entity.theme,
      entity.language,
    );
  }
}
```

- [ ] **Step 4: Update service to accept language**

`apps/server/src/core/user-preferences/application/user-preferences.service.ts`:
```typescript
import { Inject, Injectable } from '@nestjs/common';
import { Language, ThemePreference } from '@food-up/shared';
import { UserPreferences } from '../domain/user-preferences.entity';
import {
  I_USER_PREFERENCES_REPOSITORY,
  IUserPreferencesRepository,
} from '../domain/user-preferences.repository.interface';

@Injectable()
export class UserPreferencesService {
  constructor(
    @Inject(I_USER_PREFERENCES_REPOSITORY)
    private readonly _repository: IUserPreferencesRepository,
  ) {}

  async getOrCreate(identityId: string): Promise<UserPreferences> {
    const existing = await this._repository.findByIdentityId(identityId);
    if (existing) return existing;
    const prefs = UserPreferences.create(identityId);
    return this._repository.create(prefs);
  }

  async update(
    identityId: string,
    dto: { theme?: ThemePreference; language?: Language },
  ): Promise<UserPreferences> {
    const prefs = await this.getOrCreate(identityId);
    if (dto.theme !== undefined) prefs.theme = dto.theme;
    if (dto.language !== undefined) prefs.language = dto.language;
    return this._repository.update(prefs);
  }
}
```

- [ ] **Step 5: Update request DTO**

`apps/server/src/core/user-preferences/presentation/rest/dto/update-user-preferences-request.dto.ts`:
```typescript
import { IsEnum, IsOptional } from 'class-validator';
import { IUpdateUserPreferences, Language, ThemePreference } from '@food-up/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserPreferencesRequestDto implements IUpdateUserPreferences {
  @ApiPropertyOptional({ enum: ThemePreference })
  @IsEnum(ThemePreference)
  @IsOptional()
  theme?: ThemePreference;

  @ApiPropertyOptional({ enum: Language })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}
```

- [ ] **Step 6: Update response DTO**

`apps/server/src/core/user-preferences/presentation/rest/dto/user-preferences-response.dto.ts`:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IUserPreferencesResponse, Language, ThemePreference } from '@food-up/shared';

export class UserPreferencesResponseDto implements IUserPreferencesResponse {
  @ApiProperty({ enum: ThemePreference })
  @Expose()
  theme: ThemePreference;

  @ApiProperty({ enum: Language })
  @Expose()
  language: Language;
}
```

- [ ] **Step 7: Update controller**

`apps/server/src/core/user-preferences/presentation/rest/user-preferences.controller.ts`:
```typescript
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { UserPreferencesService } from '../../application/user-preferences.service';
import { UpdateUserPreferencesRequestDto } from './dto/update-user-preferences-request.dto';
import { UserPreferencesResponseDto } from './dto/user-preferences-response.dto';

@ApiTags('User Preferences')
@Controller('me/preferences')
export class UserPreferencesController {
  constructor(private readonly _service: UserPreferencesService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiResponse({ status: 200, type: UserPreferencesResponseDto })
  async getPreferences(
    @CurrentIdentity() identity: JwtPayload,
  ): Promise<UserPreferencesResponseDto> {
    const prefs = await this._service.getOrCreate(identity.sub);
    return plainToInstance(
      UserPreferencesResponseDto,
      { theme: prefs.theme, language: prefs.language },
      { excludeExtraneousValues: true },
    );
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiResponse({ status: 200, type: UserPreferencesResponseDto })
  async updatePreferences(
    @CurrentIdentity() identity: JwtPayload,
    @Body() dto: UpdateUserPreferencesRequestDto,
  ): Promise<UserPreferencesResponseDto> {
    const prefs = await this._service.update(identity.sub, dto);
    return plainToInstance(
      UserPreferencesResponseDto,
      { theme: prefs.theme, language: prefs.language },
      { excludeExtraneousValues: true },
    );
  }
}
```

- [ ] **Step 8: Build server to verify**

Run: `cd apps/server && npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 9: Commit**

```bash
git add apps/server/src/core/user-preferences/
git commit -m "feat(server): add language field to UserPreferences"
```

---

### Task 3: Backend — Supplier language field

**Files:**
- Modify: `apps/server/src/core/suppliers/domain/supplier.entity.ts`
- Modify: `apps/server/src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity.ts`
- Modify: `apps/server/src/core/suppliers/infrastructure/persistence/supplier-typeorm.mapper.ts`
- Modify: `apps/server/src/core/suppliers/application/suppliers.service.ts`
- Modify: `apps/server/src/core/suppliers/presentation/rest/dto/create-managed-supplier.dto.ts`
- Modify: `apps/server/src/core/suppliers/presentation/rest/dto/update-supplier.dto.ts`
- Modify: `apps/server/src/core/suppliers/presentation/rest/dto/supplier-response.dto.ts`
- Modify: `apps/server/src/core/suppliers/presentation/rest/suppliers.controller.ts`

- [ ] **Step 1: Update domain entity**

`apps/server/src/core/suppliers/domain/supplier.entity.ts`:
```typescript
import { Language, SupplierType } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { generateId } from 'src/shared/domain/generate-id';
import { ManagedSupplierCreatedEvent } from './events/managed-supplier-created.even';
import { SupplierEmailChangedEvent } from './events/supplier-email-changed.event';
import { SupplierInfoUpdatedEvent } from './events/supplier-info-updated.event';
import { SupplierNameChangedEvent } from './events/supplier-name-changed.event';
import { SupplierRegisteredEvent } from './events/supplier-registered.event';

export class Supplier extends Entity {
  static register(name: string, email: string | null, identityId: string): Supplier {
    const supplier = new Supplier(
      generateId(), name, SupplierType.Standalone, email, [], undefined, identityId, Language.En,
    );
    supplier.addDomainEvent(new SupplierRegisteredEvent(supplier.id, identityId));
    return supplier;
  }

  static createManaged(
    name: string,
    email: string | null,
    businessIds: string[],
    managingBusinessId: string,
    language: Language = Language.En,
  ): Supplier {
    const supplier = new Supplier(
      generateId(), name, SupplierType.Managed, email, businessIds, managingBusinessId, undefined, language,
    );
    supplier.addDomainEvent(new ManagedSupplierCreatedEvent(supplier.id, managingBusinessId));
    return supplier;
  }

  static reconstitute(
    id: string,
    name: string,
    type: SupplierType,
    email: string | null,
    businessIds: string[] = [],
    managingBusinessId?: string,
    identityId?: string,
    language: Language = Language.En,
  ): Supplier {
    return new Supplier(id, name, type, email, businessIds, managingBusinessId, identityId, language);
  }

  private constructor(
    id: string,
    name: string,
    type: SupplierType,
    email: string | null,
    businessIds: string[] = [],
    managingBusinessId?: string,
    identityId?: string,
    language: Language = Language.En,
  ) {
    super();
    if (type === SupplierType.Standalone && !identityId) {
      throw new InvalidInputDataException('Identity ID is required for standalone suppliers');
    }
    if (type === SupplierType.Managed && !managingBusinessId) {
      throw new InvalidInputDataException('Managing Business ID is required for managed suppliers');
    }
    this._id = id;
    this._name = name;
    this._type = type;
    this._email = email;
    this._businessIds = businessIds;
    this._managingBusinessId = managingBusinessId;
    this._identityId = identityId;
    this._language = language;
  }

  private readonly _id: string;
  private _name: string;
  private readonly _type: SupplierType;
  private _email: string | null;
  private readonly _businessIds: string[];
  private readonly _managingBusinessId?: string;
  private readonly _identityId?: string;
  private _language: Language;

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  set name(value: string) {
    this._name = value;
    this.addDomainEvent(new SupplierNameChangedEvent(this.id, value));
  }
  get type(): SupplierType { return this._type; }
  get language(): Language { return this._language; }
  set language(value: Language) { this._language = value; }

  isStandalone(): this is this & { identityId: string; managingBusinessId: undefined } {
    return this._type === SupplierType.Standalone;
  }

  isManaged(): this is this & { identityId: undefined; managingBusinessId: string } {
    return this._type === SupplierType.Managed;
  }

  get email(): string | null { return this._email; }
  set email(value: string | null) {
    this._email = value;
    this.addDomainEvent(new SupplierEmailChangedEvent(this.id, value));
  }
  get businessIds(): string[] { return this._businessIds; }
  get managingBusinessId(): string | undefined { return this._managingBusinessId; }
  get identityId(): string | undefined { return this._identityId; }

  updateInfo(name?: string, email?: string) {
    if (name !== undefined) this.name = name;
    if (email !== undefined) this.email = email;
    this.addDomainEvent(new SupplierInfoUpdatedEvent(this.id));
  }
}
```

- [ ] **Step 2: Add language column to supplier TypeORM entity**

In `apps/server/src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity.ts`:
- Add `import { Language } from '@food-up/shared';` to the imports (alongside `SupplierType`).
- Add after the `email` column:

```typescript
@Column('enum', { enum: Language, default: Language.En })
language: Language;
```

- [ ] **Step 3: Update supplier mapper**

`apps/server/src/core/suppliers/infrastructure/persistence/supplier-typeorm.mapper.ts`:
```typescript
import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { Supplier } from '../../domain/supplier.entity';
import { Supplier as SupplierPersistence } from './supplier.typeorm-entity';

export class SupplierTypeOrmMapper extends TypeOrmMapper<Supplier, SupplierPersistence> {
  toDomain(persistence: SupplierPersistence): Supplier {
    return Supplier.reconstitute(
      persistence.id,
      persistence.name,
      persistence.type,
      persistence.email,
      persistence?.businessSuppliers?.map((bs) => bs.business?.id) ?? [],
      persistence.managingBusinessId ?? undefined,
      persistence.identity?.id,
      persistence.language,
    );
  }

  toPersistence(domain: Supplier): SupplierPersistence {
    const persistence = new SupplierPersistence();
    persistence.id = domain.id;
    persistence.name = domain.name;
    persistence.type = domain.type;
    persistence.email = domain.email;
    persistence.language = domain.language;
    persistence.managingBusinessId = domain.managingBusinessId ?? null;
    persistence.identity = { id: domain.identityId } as any;
    return persistence;
  }

  toPersistencePartial(domain: Partial<Supplier>): Partial<SupplierPersistence> {
    const persistence: Partial<SupplierPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.name !== undefined) persistence.name = domain.name;
    if (domain.type !== undefined) persistence.type = domain.type;
    if (domain.email !== undefined) persistence.email = domain.email;
    if (domain.language !== undefined) persistence.language = domain.language;
    if (domain.managingBusinessId !== undefined) {
      persistence.managingBusinessId = domain.managingBusinessId ?? null;
    }
    if (domain.identityId !== undefined)
      persistence.identity = { id: domain.identityId } as any;
    return persistence;
  }
}
```

- [ ] **Step 4: Update CreateManagedSupplierDto**

`apps/server/src/core/suppliers/presentation/rest/dto/create-managed-supplier.dto.ts`:
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Language } from '@food-up/shared';

export class CreateManagedSupplierDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ enum: Language })
  @IsEnum(Language)
  language: Language;
}
```

- [ ] **Step 5: Update UpdateSupplierDto**

`apps/server/src/core/suppliers/presentation/rest/dto/update-supplier.dto.ts`:
```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Language } from '@food-up/shared';

export class UpdateSupplierDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: Language })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}
```

- [ ] **Step 6: Update SupplierResponseDto**

`apps/server/src/core/suppliers/presentation/rest/dto/supplier-response.dto.ts`:
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Language, SupplierType } from '@food-up/shared';

export class SupplierResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ enum: SupplierType })
  @Expose()
  type: SupplierType;

  @ApiPropertyOptional()
  @Expose()
  email: string | null;

  @ApiProperty({ type: [String] })
  @Expose()
  businessIds: string[];

  @ApiPropertyOptional()
  @Expose()
  managingBusinessId?: string;

  @ApiProperty({ enum: Language })
  @Expose()
  language: Language;
}
```

- [ ] **Step 7: Update SuppliersService.createManagedSupplier to accept and pass language**

In `apps/server/src/core/suppliers/application/suppliers.service.ts`:
- Add `Language` to the `@food-up/shared` import
- Change the `createManagedSupplier` signature's `dto` type to include `language`:

```typescript
async createManagedSupplier(
  sub: string,
  dto: { email?: string; name: string; language: Language },
) {
  const employee = await this._employeesService.findByIdentity(sub);

  if (employee.role !== EmployeeRole.Manager) {
    throw new UnauthorizedException('Only managers can manage suppliers.');
  }

  const supplier = Supplier.createManaged(
    dto.name,
    dto.email ?? null,
    [employee.businessId],
    employee.businessId,
    dto.language,
  );

  await this._repository.insert(supplier);
  this._logger.log(
    `Managed supplier created: id=${supplier.id} name=${dto.name} businessId=${employee.businessId}`,
    SuppliersService.name,
  );
  return supplier;
}
```

Also update `update()` to handle language for managed suppliers — for standalone the language update goes via `BusinessSuppliersService` which is added in Task 4. For now, only handle managed:

```typescript
@DomainEvents
async update(id: string, identityId: string, dto: UpdateSupplierDto): Promise<Supplier> {
  const supplier = await this._repository.findOneByCriteriaOrThrow({ id });

  if (supplier.type === SupplierType.Standalone) {
    if (supplier.identityId !== identityId) {
      this._logger.warn(
        `Unauthorized supplier update attempt: supplierId=${id} identityId=${identityId}`,
        SuppliersService.name,
      );
      throw new UnauthorizedException('Not authorized to update this supplier.');
    }
    supplier.updateInfo(dto.name, dto.email);
  } else {
    const employee = await this._employeesService.findByIdentity(identityId);
    if (employee.businessId !== supplier.managingBusinessId || employee.role !== EmployeeRole.Manager) {
      this._logger.warn(
        `Unauthorized supplier update attempt: supplierId=${id} identityId=${identityId}`,
        SuppliersService.name,
      );
      throw new UnauthorizedException('Not authorized to update this supplier.');
    }
    supplier.updateInfo(dto.name, dto.email);
    if (dto.language !== undefined) supplier.language = dto.language;
  }

  await this._repository.update(id, supplier);
  this._logger.log(`Supplier updated: id=${id}`, SuppliersService.name);
  return supplier;
}
```

- [ ] **Step 8: Update controller to pass language and include it in response**

In `apps/server/src/core/suppliers/presentation/rest/suppliers.controller.ts`:

Update `createManagedSupplier` handler to destructure `language`:
```typescript
async createManagedSupplier(
  @Body() { email, name, language }: CreateManagedSupplierDto,
  @CurrentIdentity() { sub }: JwtPayload,
): Promise<SupplierResponseDto> {
  const result = await this._suppliersService.createManagedSupplier(sub, { email, name, language });
  return this.toResponseDto(result);
}
```

Update `toResponseDto` to include `language`:
```typescript
private toResponseDto(entity: Supplier): SupplierResponseDto {
  const response: SupplierResponseDto = {
    id: entity.id,
    name: entity.name,
    type: entity.type,
    email: entity.email,
    businessIds: entity.businessIds ?? [],
    managingBusinessId: entity.managingBusinessId,
    language: entity.language,
  };
  return plainToInstance(SupplierResponseDto, response, { excludeExtraneousValues: true });
}
```

- [ ] **Step 9: Build server to verify**

Run: `cd apps/server && npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 10: Commit**

```bash
git add apps/server/src/core/suppliers/
git commit -m "feat(server): add language field to Supplier"
```

---

### Task 4: Backend — BusinessSupplier language + standalone language update

**Files:**
- Modify: `apps/server/src/core/business-suppliers/domain/business-supplier.entity.ts`
- Modify: `apps/server/src/core/business-suppliers/infrastructure/persistence/business-supplier.typeorm-entity.ts`
- Modify: `apps/server/src/core/business-suppliers/infrastructure/persistence/business-supplier-typeorm.mapper.ts`
- Modify: `apps/server/src/core/business-suppliers/domain/business-suppliers.repository.interface.ts`
- Modify: `apps/server/src/core/business-suppliers/infrastructure/persistence/business-suppliers-typeorm.repository.ts`
- Modify: `apps/server/src/core/business-suppliers/application/business-suppliers.service.ts`
- Modify: `apps/server/src/core/suppliers/application/suppliers.service.ts`

- [ ] **Step 1: Update BusinessSupplier domain entity**

`apps/server/src/core/business-suppliers/domain/business-supplier.entity.ts`:
```typescript
import { Language } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';

export class BusinessSupplier extends Entity {
  constructor(
    id: string,
    businessId: string,
    supplierId: string,
    language: Language = Language.En,
  ) {
    super();
    this._id = id;
    this._businessId = businessId;
    this._supplierId = supplierId;
    this._language = language;
  }

  private readonly _id: string;
  private readonly _businessId: string;
  private readonly _supplierId: string;
  private _language: Language;

  get id(): string { return this._id; }
  get businessId(): string { return this._businessId; }
  get supplierId(): string { return this._supplierId; }
  get language(): Language { return this._language; }
  set language(value: Language) { this._language = value; }
}
```

- [ ] **Step 2: Update BusinessSupplier TypeORM entity**

`apps/server/src/core/business-suppliers/infrastructure/persistence/business-supplier.typeorm-entity.ts`:
```typescript
import { Language } from '@food-up/shared';
import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
import { Supplier } from 'src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class BusinessSupplier {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @ManyToOne(() => Business, (business) => business.businessSuppliers, {
    eager: true,
  })
  business: Business;

  @ManyToOne(() => Supplier, (supplier) => supplier.businessSuppliers, {
    eager: true,
  })
  supplier: Supplier;

  @Column('enum', { enum: Language, default: Language.En })
  language: Language;
}
```

- [ ] **Step 3: Update BusinessSupplier mapper**

`apps/server/src/core/business-suppliers/infrastructure/persistence/business-supplier-typeorm.mapper.ts`:
```typescript
import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { BusinessSupplier as BusinessSupplierPersistence } from './business-supplier.typeorm-entity';

export class BusinessSupplierTypeOrmMapper extends TypeOrmMapper<
  BusinessSupplier,
  BusinessSupplierPersistence
> {
  toDomain(persistence: BusinessSupplierPersistence): BusinessSupplier {
    return new BusinessSupplier(
      persistence.id,
      persistence.business.id,
      persistence.supplier.id,
      persistence.language,
    );
  }

  toPersistence(domain: BusinessSupplier): BusinessSupplierPersistence {
    const persistence = new BusinessSupplierPersistence();
    persistence.id = domain.id;
    persistence.business = { id: domain.businessId } as any;
    persistence.supplier = { id: domain.supplierId } as any;
    persistence.language = domain.language;
    return persistence;
  }

  toPersistencePartial(
    domain: Partial<BusinessSupplier>,
  ): Partial<BusinessSupplierPersistence> {
    const persistence: Partial<BusinessSupplierPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.businessId !== undefined)
      persistence.business = { id: domain.businessId } as any;
    if (domain.supplierId !== undefined)
      persistence.supplier = { id: domain.supplierId } as any;
    if (domain.language !== undefined) persistence.language = domain.language;
    return persistence;
  }
}
```

- [ ] **Step 4: Add findBySupplierAndBusiness to repository interface**

`apps/server/src/core/business-suppliers/domain/business-suppliers.repository.interface.ts`:
```typescript
import { IRepository } from 'src/shared/domain/repository.interface';
import { BusinessSupplier } from './business-supplier.entity';

export const I_BUSINESS_SUPPLIERS_REPOSITORY = Symbol('IBusinessSuppliersRepository');

export interface IBusinessSuppliersRepository extends IRepository<BusinessSupplier> {
  findBySupplierAndBusiness(
    supplierId: string,
    businessId: string,
  ): Promise<BusinessSupplier | null>;
}
```

- [ ] **Step 5: Implement findBySupplierAndBusiness in TypeORM repository**

`apps/server/src/core/business-suppliers/infrastructure/persistence/business-suppliers-typeorm.repository.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { BusinessSupplierTypeOrmMapper } from './business-supplier-typeorm.mapper';
import { BusinessSupplier as BusinessSupplierPersistence } from './business-supplier.typeorm-entity';

@Injectable()
export class BusinessSuppliersTypeOrmRepository extends TypeOrmRepository<
  BusinessSupplier,
  BusinessSupplierPersistence
> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(
      dataSource,
      BusinessSupplierPersistence,
      new BusinessSupplierTypeOrmMapper(),
      transactionContext,
    );
  }

  async findBySupplierAndBusiness(
    supplierId: string,
    businessId: string,
  ): Promise<BusinessSupplier | null> {
    const entity = await this._repository.findOne({
      where: {
        supplier: { id: supplierId },
        business: { id: businessId },
      },
    });
    return entity ? this._mapper.toDomain(entity) : null;
  }
}
```

- [ ] **Step 6: Add updateLanguageForPartner to BusinessSuppliersService**

`apps/server/src/core/business-suppliers/application/business-suppliers.service.ts` — replace the file:
```typescript
import { Inject, Injectable } from '@nestjs/common';
import { Language } from '@food-up/shared';
import { BusinessSupplier } from '../domain/business-supplier.entity';
import {
  I_BUSINESS_SUPPLIERS_REPOSITORY,
  IBusinessSuppliersRepository,
} from '../domain/business-suppliers.repository.interface';

@Injectable()
export class BusinessSuppliersService {
  constructor(
    @Inject(I_BUSINESS_SUPPLIERS_REPOSITORY)
    private readonly _repository: IBusinessSuppliersRepository,
  ) {}

  async create(dto: any): Promise<BusinessSupplier> {
    const entity = new BusinessSupplier(dto.id, dto.businessId, dto.supplierId);
    return this._repository.insert(entity);
  }

  async findAll(): Promise<BusinessSupplier[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<BusinessSupplier | null> {
    return this._repository.findOneByCriteria({ id });
  }

  async update(id: string, dto: any): Promise<BusinessSupplier> {
    const entity = new BusinessSupplier(id, dto.businessId, dto.supplierId);
    return this._repository.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }

  async updateLanguageForPartner(
    supplierId: string,
    businessId: string,
    language: Language,
  ): Promise<void> {
    const bs = await this._repository.findBySupplierAndBusiness(supplierId, businessId);
    if (!bs) return;
    bs.language = language;
    await this._repository.update(bs.id, bs);
  }
}
```

- [ ] **Step 7: Wire standalone language update into SuppliersService**

In `apps/server/src/core/suppliers/application/suppliers.service.ts`:

Add `BusinessSuppliersService` to the imports:
```typescript
import { BusinessSuppliersService } from 'src/core/business-suppliers/application/business-suppliers.service';
```

Add to constructor (after `_logger`):
```typescript
private readonly _businessSuppliersService: BusinessSuppliersService,
```

Update the standalone branch in `update()` to call the service:
```typescript
if (supplier.type === SupplierType.Standalone) {
  if (supplier.identityId !== identityId) {
    this._logger.warn(
      `Unauthorized supplier update attempt: supplierId=${id} identityId=${identityId}`,
      SuppliersService.name,
    );
    throw new UnauthorizedException('Not authorized to update this supplier.');
  }
  supplier.updateInfo(dto.name, dto.email);
  if (dto.language !== undefined) {
    const employee = await this._employeesService.findByIdentity(identityId);
    await this._businessSuppliersService.updateLanguageForPartner(
      id,
      employee.businessId,
      dto.language,
    );
  }
} else {
  // managed branch unchanged from Task 3
}
```

- [ ] **Step 8: Build server to verify**

Run: `cd apps/server && npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 9: Commit**

```bash
git add apps/server/src/core/business-suppliers/ apps/server/src/core/suppliers/application/suppliers.service.ts
git commit -m "feat(server): add language to BusinessSupplier + standalone language update path"
```

---

### Task 5: Backend — Business language field + update endpoint

**Files:**
- Modify: `apps/server/src/core/businesses/domain/business.entity.ts`
- Modify: `apps/server/src/core/businesses/infrastructure/persistence/business.typeorm-entity.ts`
- Modify: `apps/server/src/core/businesses/infrastructure/persistence/business-typeorm.mapper.ts`
- Modify: `apps/server/src/core/businesses/application/businesses.service.ts`
- Create: `apps/server/src/core/businesses/presentation/rest/dto/update-business-language-request.dto.ts`
- Modify: `apps/server/src/core/businesses/presentation/rest/dto/business-response.dto.ts`
- Modify: `apps/server/src/core/businesses/presentation/rest/businesses.controller.ts`
- Modify: `apps/server/src/core/businesses/businesses.module.ts`

- [ ] **Step 1: Add language to Business domain entity**

`apps/server/src/core/businesses/domain/business.entity.ts`:
```typescript
import { Language } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';

export class Business extends Entity {
  static create(
    name: string,
    contactEmail: string,
    contactPhone?: string | null,
  ): Business {
    return new Business(generateId(), name, contactEmail, contactPhone);
  }

  static reconstitute(
    id: string,
    name: string,
    contactEmail: string,
    contactPhone?: string | null,
    employeeIds: string[] = [],
    supplierIds: string[] = [],
    managedSupplierIds: string[] = [],
    language: Language = Language.En,
  ): Business {
    const b = new Business(
      id, name, contactEmail, contactPhone, employeeIds, supplierIds, managedSupplierIds,
    );
    b.language = language;
    return b;
  }

  private constructor(
    id: string,
    name: string,
    contactEmail: string,
    contactPhone?: string | null,
    employeeIds: string[] = [],
    supplierIds: string[] = [],
    managedSupplierIds: string[] = [],
  ) {
    super();
    this.id = id;
    this.name = name;
    this.contactEmail = contactEmail;
    this.employeeIds = employeeIds;
    this.supplierIds = supplierIds;
    this.managedSupplierIds = managedSupplierIds;
    this.contactPhone = contactPhone;
    this.language = Language.En;
  }

  readonly id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string | null;
  employeeIds: string[];
  supplierIds: string[];
  managedSupplierIds: string[];
  language: Language;
}
```

- [ ] **Step 2: Add language column to Business TypeORM entity**

In `apps/server/src/core/businesses/infrastructure/persistence/business.typeorm-entity.ts`:
- Add `import { Language } from '@food-up/shared';` to imports.
- Add after `contactPhone`:

```typescript
@Column('enum', { enum: Language, default: Language.En })
language: Language;
```

- [ ] **Step 3: Update Business mapper toDomain and toPersistencePartial**

In `apps/server/src/core/businesses/infrastructure/persistence/business-typeorm.mapper.ts`:

`toDomain` — pass `persistence.language` as 8th arg to `Business.reconstitute`:
```typescript
toDomain(persistence: BusinessPersistence): Business {
  return Business.reconstitute(
    persistence.id,
    persistence.name,
    persistence.contactEmail,
    persistence.contactPhone,
    persistence.employees?.map((employee) => employee.id),
    persistence.businessSuppliers?.map((bs) => bs.supplier?.id),
    persistence.managedSuppliers?.map((supplier) => supplier.id),
    persistence.language,
  );
}
```

`toPersistencePartial` — add language handling at the end:
```typescript
if (domain.language !== undefined) persistence.language = domain.language;
```

- [ ] **Step 4: Add updateLanguage to BusinessesService**

In `apps/server/src/core/businesses/application/businesses.service.ts`:
- Add `import { Language } from '@food-up/shared';`
- Add the method:

```typescript
async updateLanguage(businessId: string, language: Language): Promise<Business> {
  const business = await this._repository.findOneByCriteriaOrThrow({ id: businessId });
  business.language = language;
  await this._repository.update(business.id, business);
  this._logger.log(
    `Business language updated: id=${businessId} language=${language}`,
    BusinessesService.name,
  );
  return business;
}
```

- [ ] **Step 5: Create UpdateBusinessLanguageRequestDto**

`apps/server/src/core/businesses/presentation/rest/dto/update-business-language-request.dto.ts`:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IUpdateBusinessLanguage, Language } from '@food-up/shared';

export class UpdateBusinessLanguageRequestDto implements IUpdateBusinessLanguage {
  @ApiProperty({ enum: Language })
  @IsEnum(Language)
  language: Language;
}
```

- [ ] **Step 6: Add language to BusinessResponseDto**

In `apps/server/src/core/businesses/presentation/rest/dto/business-response.dto.ts`:
- Add `import { Language } from '@food-up/shared';`
- Add to the class:

```typescript
@ApiProperty({ enum: Language })
@Expose()
language: Language;
```

- [ ] **Step 7: Add PATCH /businesses/my endpoint**

In `apps/server/src/core/businesses/presentation/rest/businesses.controller.ts`:
- Inject `EmployeesService` in the constructor alongside `BusinessesService`
- Add imports: `Patch`, `Body`, `CurrentIdentity`, `JwtPayload`, `RequiredIdentityType`, `RequiredEmployeeRole`, `IdentityType`, `EmployeeRole`, `plainToInstance`, `UpdateBusinessLanguageRequestDto`, `EmployeesService`

Add the handler (declare before `@Get(':id')` or `@Get()` to avoid `:id` catch-all conflict — there is no `:id` route, so order doesn't matter):
```typescript
@Patch('my')
@ApiOperation({ summary: "Update the current manager's business language" })
@ApiResponse({ status: 200, type: BusinessResponseDto })
@RequiredIdentityType(IdentityType.Employee)
@RequiredEmployeeRole(EmployeeRole.Manager)
@ApiBearerAuth()
async updateMyLanguage(
  @Body() dto: UpdateBusinessLanguageRequestDto,
  @CurrentIdentity() { sub }: JwtPayload,
): Promise<BusinessResponseDto> {
  const employee = await this._employeesService.findByIdentity(sub);
  const business = await this._businessesService.updateLanguage(employee.businessId, dto.language);
  return plainToInstance(BusinessResponseDto, business, { excludeExtraneousValues: true });
}
```

Update the constructor to inject `EmployeesService`:
```typescript
constructor(
  private readonly _businessesService: BusinessesService,
  private readonly _businessInvitesService: BusinessInvitesService,
  private readonly _employeesService: EmployeesService,
) {}
```

- [ ] **Step 8: Add EmployeesModule import to BusinessesModule**

In `apps/server/src/core/businesses/businesses.module.ts`:
```typescript
import { forwardRef, Module } from '@nestjs/common';
import { BusinessInvitesModule } from '../business-invites/business-invites.module';
import { EmployeesModule } from '../employees/employees.module';
import { BusinessesService } from './application/businesses.service';
import { BusinessRepositoryProvider } from './infrastructure/business.providers';
import { BusinessesController } from './presentation/rest/businesses.controller';

@Module({
  imports: [BusinessInvitesModule, forwardRef(() => EmployeesModule)],
  controllers: [BusinessesController],
  providers: [BusinessesService, BusinessRepositoryProvider],
  exports: [BusinessesService],
})
export class BusinessesModule {}
```

(`forwardRef` is used because `EmployeesModule` likely imports `BusinessesModule`, creating a potential circular dependency.)

- [ ] **Step 9: Build server to verify**

Run: `cd apps/server && npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 10: Commit**

```bash
git add apps/server/src/core/businesses/
git commit -m "feat(server): add language to Business + PATCH /businesses/my endpoint"
```

---

### Task 6: Backend — i18n module (t() helper + translations)

**Files:**
- Create: `apps/server/src/shared/i18n/translations/en.ts`
- Create: `apps/server/src/shared/i18n/translations/sr.ts`
- Create: `apps/server/src/shared/i18n/i18n.helper.ts`
- Create: `apps/server/src/shared/i18n/i18n.helper.spec.ts`

- [ ] **Step 1: Write the failing test first**

`apps/server/src/shared/i18n/i18n.helper.spec.ts`:
```typescript
import { Language } from '@food-up/shared';
import { t } from './i18n.helper';

describe('t()', () => {
  it('returns English text for Language.En', () => {
    expect(t((k) => k.mail.mealWindow.subject, Language.En)).toBe(
      'Your meal selection window is open',
    );
  });

  it('returns Serbian text for Language.Sr', () => {
    expect(t((k) => k.mail.mealWindow.subject, Language.Sr)).toBe(
      'Vaš prozor za izbor obroka je otvoren',
    );
  });

  it('returns English excel column for Language.En', () => {
    expect(t((k) => k.excel.columns.employeeName, Language.En)).toBe('Employee');
  });

  it('returns Serbian excel column for Language.Sr', () => {
    expect(t((k) => k.excel.columns.employeeName, Language.Sr)).toBe('Zaposleni');
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd apps/server && npx jest src/shared/i18n/i18n.helper.spec.ts`
Expected: FAIL — "Cannot find module './i18n.helper'"

- [ ] **Step 3: Create English translations**

`apps/server/src/shared/i18n/translations/en.ts`:
```typescript
export default {
  mail: {
    mealWindow: {
      subject: 'Your meal selection window is open',
      body: 'The meal selection window is now open. Please log in to make your selections.',
    },
    changeRequest: {
      subject: 'Meal change request submitted',
      body: 'Your meal change request has been received and is pending review.',
    },
  },
  excel: {
    columns: {
      employeeName: 'Employee',
      meal: 'Meal',
      mealType: 'Meal type',
      date: 'Date',
    },
  },
} as const;
```

- [ ] **Step 4: Create Serbian translations (shape enforced by typeof en)**

`apps/server/src/shared/i18n/translations/sr.ts`:
```typescript
import type en from './en';

const sr: typeof en = {
  mail: {
    mealWindow: {
      subject: 'Vaš prozor za izbor obroka je otvoren',
      body: 'Prozor za izbor obroka je sada otvoren. Prijavite se da biste napravili izbor.',
    },
    changeRequest: {
      subject: 'Zahtev za promenu obroka podnet',
      body: 'Vaš zahtev za promenu obroka je primljen i čeka na pregled.',
    },
  },
  excel: {
    columns: {
      employeeName: 'Zaposleni',
      meal: 'Obrok',
      mealType: 'Vrsta obroka',
      date: 'Datum',
    },
  },
};

export default sr;
```

- [ ] **Step 5: Create the t() helper**

`apps/server/src/shared/i18n/i18n.helper.ts`:
```typescript
import { Language } from '@food-up/shared';
import en from './translations/en';
import sr from './translations/sr';

export function t(selector: (tr: typeof en) => string, language: Language): string {
  const tr = language === Language.Sr ? sr : en;
  return selector(tr);
}
```

- [ ] **Step 6: Run tests to confirm they pass**

Run: `cd apps/server && npx jest src/shared/i18n/i18n.helper.spec.ts`
Expected: PASS — 4 tests pass

- [ ] **Step 7: Commit**

```bash
git add apps/server/src/shared/i18n/
git commit -m "feat(server): add i18n t() helper with en/sr translations"
```

---

### Task 7: Backend — SuppliersDomainService

**Files:**
- Create: `apps/server/src/core/suppliers/domain/suppliers.domain-service.spec.ts`
- Create: `apps/server/src/core/suppliers/domain/suppliers.domain-service.ts`
- Modify: `apps/server/src/core/suppliers/suppliers.module.ts`

- [ ] **Step 1: Write the failing test**

`apps/server/src/core/suppliers/domain/suppliers.domain-service.spec.ts`:
```typescript
import { Language, SupplierType } from '@food-up/shared';
import { BusinessSupplier } from 'src/core/business-suppliers/domain/business-supplier.entity';
import { Supplier } from './supplier.entity';
import { SuppliersDomainService } from './suppliers.domain-service';

function makeManagedSupplier(language: Language): Supplier {
  return Supplier.reconstitute('s1', 'Test', SupplierType.Managed, null, [], 'b1', undefined, language);
}

function makeStandaloneSupplier(): Supplier {
  return Supplier.reconstitute('s2', 'Test', SupplierType.Standalone, null, [], undefined, 'i1', Language.En);
}

function makeBusinessSupplier(language: Language): BusinessSupplier {
  return new BusinessSupplier('bs1', 'b1', 's2', language);
}

describe('SuppliersDomainService', () => {
  const svc = new SuppliersDomainService();

  describe('resolveEmailLanguage', () => {
    it('returns supplier.language for a managed supplier', () => {
      const supplier = makeManagedSupplier(Language.Sr);
      expect(svc.resolveEmailLanguage(supplier)).toBe(Language.Sr);
    });

    it('returns businessSupplier.language for a standalone supplier', () => {
      const supplier = makeStandaloneSupplier();
      const bs = makeBusinessSupplier(Language.Sr);
      expect(svc.resolveEmailLanguage(supplier, bs)).toBe(Language.Sr);
    });

    it('defaults to Language.En when managed supplier has default language', () => {
      const supplier = makeManagedSupplier(Language.En);
      expect(svc.resolveEmailLanguage(supplier)).toBe(Language.En);
    });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd apps/server && npx jest src/core/suppliers/domain/suppliers.domain-service.spec.ts`
Expected: FAIL — "Cannot find module './suppliers.domain-service'"

- [ ] **Step 3: Create SuppliersDomainService**

`apps/server/src/core/suppliers/domain/suppliers.domain-service.ts`:
```typescript
import { Language, SupplierType } from '@food-up/shared';
import { Injectable } from '@nestjs/common';
import { BusinessSupplier } from 'src/core/business-suppliers/domain/business-supplier.entity';
import { Supplier } from './supplier.entity';

@Injectable()
export class SuppliersDomainService {
  resolveEmailLanguage(supplier: Supplier & { type: SupplierType.Managed }): Language;
  resolveEmailLanguage(
    supplier: Supplier & { type: SupplierType.Standalone },
    businessSupplier: BusinessSupplier,
  ): Language;
  resolveEmailLanguage(supplier: Supplier, businessSupplier?: BusinessSupplier): Language {
    if (supplier.isManaged()) return supplier.language;
    return businessSupplier!.language;
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `cd apps/server && npx jest src/core/suppliers/domain/suppliers.domain-service.spec.ts`
Expected: PASS — 3 tests pass

- [ ] **Step 5: Register SuppliersDomainService in SuppliersModule**

In `apps/server/src/core/suppliers/suppliers.module.ts`, add `SuppliersDomainService` to the `providers` array and `exports` array:
```typescript
import { SuppliersDomainService } from './domain/suppliers.domain-service';
// ...
providers: [SuppliersRepositoryProvider, SuppliersService, SuppliersDomainService],
exports: [SuppliersService, SuppliersDomainService],
```

- [ ] **Step 6: Build server**

Run: `cd apps/server && npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 7: Commit**

```bash
git add apps/server/src/core/suppliers/domain/suppliers.domain-service.ts apps/server/src/core/suppliers/domain/suppliers.domain-service.spec.ts apps/server/src/core/suppliers/suppliers.module.ts
git commit -m "feat(server): add SuppliersDomainService with typed resolveEmailLanguage overloads"
```

---

### Task 8: Frontend — i18n setup

**Files:**
- Modify: `apps/web/package.json` (via npm install)
- Create: `apps/web/src/i18n/i18n.ts`
- Create: `apps/web/src/i18n/en/common.json`
- Create: `apps/web/src/i18n/en/auth.json`
- Create: `apps/web/src/i18n/en/preferences.json`
- Create: `apps/web/src/i18n/sr/common.json`
- Create: `apps/web/src/i18n/sr/auth.json`
- Create: `apps/web/src/i18n/sr/preferences.json`
- Modify: `apps/web/src/main.tsx`

- [ ] **Step 1: Install i18next packages**

Run: `npm install i18next react-i18next i18next-browser-languagedetector --workspace=apps/web`
Expected: packages appear in `apps/web/package.json`, exit 0

- [ ] **Step 2: Create English common.json**

`apps/web/src/i18n/en/common.json`:
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "employees": "Employees",
    "suppliers": "Suppliers",
    "inHouseSuppliers": "In-House Suppliers",
    "partnerSuppliers": "Partner Suppliers",
    "mealSelectionWindows": "Meal Selection Windows",
    "changeRequests": "Change Requests",
    "businessSettings": "Business Settings",
    "account": "Account",
    "logout": "Logout"
  },
  "actions": {
    "save": "Save changes",
    "saving": "Saving…",
    "cancel": "Cancel",
    "create": "Create",
    "creating": "Creating…",
    "delete": "Delete",
    "edit": "Edit",
    "logout": "Logout"
  },
  "language": {
    "label": "Language",
    "en": "English",
    "sr": "Srpski"
  }
}
```

- [ ] **Step 3: Create English preferences.json**

`apps/web/src/i18n/en/preferences.json`:
```json
{
  "title": "Account settings",
  "subtitle": "Manage your profile and security preferences.",
  "appearance": {
    "title": "Appearance",
    "theme": {
      "label": "Theme",
      "light": "Light",
      "dark": "Dark",
      "system": "System"
    },
    "language": {
      "label": "Language"
    },
    "success": "Appearance updated successfully.",
    "error": "Failed to update appearance. Please try again."
  }
}
```

- [ ] **Step 4: Create English auth.json**

`apps/web/src/i18n/en/auth.json`:
```json
{
  "login": {
    "title": "Sign in",
    "email": "Email",
    "password": "Password",
    "submit": "Sign in",
    "submitting": "Signing in…",
    "error": "Invalid email or password."
  },
  "register": {
    "title": "Create an account",
    "success": "Account created. Please sign in."
  }
}
```

- [ ] **Step 5: Create Serbian common.json**

`apps/web/src/i18n/sr/common.json`:
```json
{
  "nav": {
    "dashboard": "Kontrolna tabla",
    "employees": "Zaposleni",
    "suppliers": "Dobavljači",
    "inHouseSuppliers": "Interni dobavljači",
    "partnerSuppliers": "Partnerski dobavljači",
    "mealSelectionWindows": "Prozori za izbor obroka",
    "changeRequests": "Zahtevi za promenu",
    "businessSettings": "Podešavanja firme",
    "account": "Nalog",
    "logout": "Odjava"
  },
  "actions": {
    "save": "Sačuvaj izmene",
    "saving": "Čuvanje…",
    "cancel": "Otkaži",
    "create": "Kreiraj",
    "creating": "Kreiranje…",
    "delete": "Obriši",
    "edit": "Izmeni",
    "logout": "Odjava"
  },
  "language": {
    "label": "Jezik",
    "en": "English",
    "sr": "Srpski"
  }
}
```

- [ ] **Step 6: Create Serbian preferences.json**

`apps/web/src/i18n/sr/preferences.json`:
```json
{
  "title": "Podešavanja naloga",
  "subtitle": "Upravljajte profilom i bezbednosnim podešavanjima.",
  "appearance": {
    "title": "Izgled",
    "theme": {
      "label": "Tema",
      "light": "Svetla",
      "dark": "Tamna",
      "system": "Sistemska"
    },
    "language": {
      "label": "Jezik"
    },
    "success": "Izgled uspešno ažuriran.",
    "error": "Nije moguće ažurirati izgled. Pokušajte ponovo."
  }
}
```

- [ ] **Step 7: Create Serbian auth.json**

`apps/web/src/i18n/sr/auth.json`:
```json
{
  "login": {
    "title": "Prijava",
    "email": "Imejl",
    "password": "Lozinka",
    "submit": "Prijavite se",
    "submitting": "Prijavljivanje…",
    "error": "Pogrešan imejl ili lozinka."
  },
  "register": {
    "title": "Kreirajte nalog",
    "success": "Nalog kreiran. Molimo prijavite se."
  }
}
```

- [ ] **Step 8: Create i18n.ts**

`apps/web/src/i18n/i18n.ts`:
```typescript
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAuth from './en/auth.json';
import enCommon from './en/common.json';
import enPreferences from './en/preferences.json';
import srAuth from './sr/auth.json';
import srCommon from './sr/common.json';
import srPreferences from './sr/preferences.json';

export const defaultNS = 'common' as const;

export const resources = {
  en: { common: enCommon, auth: enAuth, preferences: enPreferences },
  sr: { common: srCommon, auth: srAuth, preferences: srPreferences },
} as const;

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'sr'],
    defaultNS,
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'] },
  });

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}

export default i18next;
```

- [ ] **Step 9: Import i18n in main.tsx before React renders**

`apps/web/src/main.tsx`:
```typescript
import './i18n/i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/app-providers.tsx';
import App from './app/app.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
```

- [ ] **Step 10: Build web to verify**

Run: `cd apps/web && npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 11: Commit**

```bash
git add apps/web/src/i18n/ apps/web/src/main.tsx apps/web/package.json package-lock.json
git commit -m "feat(web): add i18next setup with en/sr translation files"
```

---

### Task 9: Frontend — Language preference (store + selector + session restore + seeding)

**Files:**
- Modify: `apps/web/src/features/user-preferences/presentation/state/preferences.store.ts`
- Create: `apps/web/src/features/user-preferences/presentation/hooks/use-language.hook.ts`
- Modify: `apps/web/src/features/auth/application/use-restore-session.hook.ts`
- Modify: `apps/web/src/app/app-providers.tsx`
- Modify: `apps/web/src/features/employees/presentation/pages/account.page.tsx`

- [ ] **Step 1: Add language to PreferencesStore**

`apps/web/src/features/user-preferences/presentation/state/preferences.store.ts`:
```typescript
import { Language, ThemePreference } from '@food-up/shared';
import { create } from 'zustand';

type PreferencesState = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  language: Language;
  setLanguage: (language: Language) => void;
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  theme: ThemePreference.System,
  setTheme: (theme) => set({ theme }),
  language: Language.En,
  setLanguage: (language) => set({ language }),
}));
```

- [ ] **Step 2: Create useLanguage and useLanguageInit hooks**

`apps/web/src/features/user-preferences/presentation/hooks/use-language.hook.ts`:
```typescript
import { Language } from '@food-up/shared';
import { useEffect } from 'react';
import i18n from '@/i18n/i18n';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { usePreferencesStore } from '../state/preferences.store';

const SEED_KEY = 'lang_seeded';

export function useLanguage(): void {
  const language = usePreferencesStore((s) => s.language);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);
}

export function useLanguageInit(): void {
  const user = useAuthStore((s) => s.user);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const { preferencesService } = useServices();

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(SEED_KEY)) return;

    const browserLang = navigator.language.toLowerCase().startsWith('sr')
      ? Language.Sr
      : Language.En;

    if (browserLang === Language.En) {
      localStorage.setItem(SEED_KEY, '1');
      return;
    }

    preferencesService
      .update({ language: browserLang })
      .then(() => {
        setLanguage(browserLang);
        localStorage.setItem(SEED_KEY, '1');
      })
      .catch(() => {
        localStorage.setItem(SEED_KEY, '1');
      });
  }, [user]);
}
```

- [ ] **Step 3: Update use-restore-session.hook.ts to restore language**

`apps/web/src/features/auth/application/use-restore-session.hook.ts`:
```typescript
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { usePreferencesStore } from '@/features/user-preferences/presentation/state/preferences.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { useEffect, useState } from 'react';

export function useRestoreSession(): boolean {
  const { authService, preferencesService } = useServices();
  const setUser = useAuthStore((s) => s.setUser);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    authService
      .restoreSession()
      .then(async (user) => {
        if (user) {
          setUser(user);
          try {
            const prefs = await preferencesService.get();
            setTheme(prefs.theme);
            setLanguage(prefs.language);
          } catch {
            // keep defaults if preferences fetch fails
          }
        }
      })
      .finally(() => setReady(true));
  }, []);

  return ready;
}
```

- [ ] **Step 4: Call useLanguage and useLanguageInit in AppProviders**

In `apps/web/src/app/app-providers.tsx`:
- Add imports: `import { useLanguage, useLanguageInit } from '@/features/user-preferences/presentation/hooks/use-language.hook';`
- Call both hooks inside `AppProviders`:

```typescript
export function AppProviders({ children }: { children: ReactNode }) {
  useTheme();
  useLanguage();
  useLanguageInit();
  return (
    <ServiceProvider value={services}>
      // ...rest unchanged
    </ServiceProvider>
  );
}
```

- [ ] **Step 5: Add language selector to AppearanceSection in account.page.tsx**

In `apps/web/src/features/employees/presentation/pages/account.page.tsx`:

Add `Language` to the `@food-up/shared` import.

Add the options constant near `THEME_OPTIONS`:
```typescript
const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: Language.En, label: 'English' },
  { value: Language.Sr, label: 'Srpski' },
];
```

Inside `AppearanceSection`, add language state and mutation (alongside the existing theme mutation):
```typescript
const language = usePreferencesStore((s) => s.language);
const setLanguage = usePreferencesStore((s) => s.setLanguage);

const languageMutation = useMutation<
  void,
  Error,
  Language,
  { previousLanguage: Language }
>({
  mutationFn: (newLanguage: Language) =>
    preferencesService.update({ language: newLanguage }),
  onMutate: (newLanguage) => {
    const previousLanguage = language;
    setLanguage(newLanguage);
    return { previousLanguage };
  },
  onSuccess: () => {
    setFeedback({ type: 'success', message: 'Appearance updated successfully.' });
  },
  onError: (_err, _newLanguage, context) => {
    if (context) setLanguage(context.previousLanguage);
    setFeedback({
      type: 'error',
      message: 'Failed to update appearance. Please try again.',
    });
  },
});
```

Add the language Select in the JSX, after the theme Select:
```tsx
<div className='space-y-2'>
  <Label>Language</Label>
  <Select
    value={language}
    onValueChange={(v) => {
      setFeedback(null);
      languageMutation.mutate(v as Language);
    }}
    disabled={languageMutation.isPending}
  >
    <SelectTrigger className='w-full'>
      <SelectValue>
        {(v: string) => LANGUAGE_OPTIONS.find((o) => o.value === v)?.label ?? v}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      {LANGUAGE_OPTIONS.map((opt) => (
        <SelectItem key={opt.value} value={opt.value} label={opt.label}>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 6: Build web to verify**

Run: `cd apps/web && npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/user-preferences/ apps/web/src/features/auth/application/use-restore-session.hook.ts apps/web/src/app/app-providers.tsx apps/web/src/features/employees/presentation/pages/account.page.tsx
git commit -m "feat(web): add language preference selector and i18n store sync"
```

---

### Task 10: Frontend — Business Settings page

**Files:**
- Modify: `apps/web/src/features/businesses/domain/business-service.interface.ts`
- Modify: `apps/web/src/features/businesses/infrastructure/business.service.ts`
- Create: `apps/web/src/features/businesses/presentation/pages/business-settings.page.tsx`
- Modify: `apps/web/src/app/app.tsx`
- Modify: `apps/web/src/app/layouts/manager.layout.tsx`

- [ ] **Step 1: Add updateLanguage to IBusinessService**

`apps/web/src/features/businesses/domain/business-service.interface.ts`:
```typescript
import { IUpdateBusinessLanguage } from '@food-up/shared';

export interface IBusinessOption {
  id: string;
  name: string;
}

export interface IBusinessService {
  findAll(): Promise<IBusinessOption[]>;
  updateLanguage(data: IUpdateBusinessLanguage): Promise<void>;
}
```

- [ ] **Step 2: Implement updateLanguage in BusinessService**

`apps/web/src/features/businesses/infrastructure/business.service.ts`:
```typescript
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IUpdateBusinessLanguage } from '@food-up/shared';
import { IBusinessOption, IBusinessService } from '../domain/business-service.interface';

export class BusinessService implements IBusinessService {
  constructor(private readonly http: HttpClient) {}

  findAll(): Promise<IBusinessOption[]> {
    return this.http.get<IBusinessOption[]>('/api/businesses');
  }

  updateLanguage(data: IUpdateBusinessLanguage): Promise<void> {
    return this.http.patch<IUpdateBusinessLanguage, void>('/api/businesses/my', data);
  }
}
```

- [ ] **Step 3: Create BusinessSettingsPage**

`apps/web/src/features/businesses/presentation/pages/business-settings.page.tsx`:
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { Language } from '@food-up/shared';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: Language.En, label: 'English' },
  { value: Language.Sr, label: 'Srpski' },
];

export default function BusinessSettingsPage() {
  const { businessService } = useServices();
  const [language, setLanguage] = useState<Language>(Language.En);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const mutation = useMutation<void, Error, Language, { previousLanguage: Language }>({
    mutationFn: (newLanguage) =>
      businessService.updateLanguage({ language: newLanguage }),
    onMutate: (newLanguage) => {
      const previousLanguage = language;
      setLanguage(newLanguage);
      return { previousLanguage };
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Business settings updated.' });
    },
    onError: (_err, _lang, context) => {
      if (context) setLanguage(context.previousLanguage);
      setFeedback({ type: 'error', message: 'Failed to update. Please try again.' });
    },
  });

  return (
    <div className='max-w-2xl space-y-6'>
      <div>
        <h1 className='text-xl font-semibold'>Business Settings</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Configure settings that apply to your entire business.
        </p>
      </div>

      <Card>
        <CardHeader className='px-6 pt-5 pb-0'>
          <CardTitle className='text-base'>Communication Language</CardTitle>
        </CardHeader>
        <Separator className='mt-4' />
        <CardContent className='px-6 pt-4 pb-5 space-y-4'>
          <div className='space-y-2'>
            <Label>Language for Excel exports</Label>
            <Select
              value={language}
              onValueChange={(v) => {
                setFeedback(null);
                mutation.mutate(v as Language);
              }}
              disabled={mutation.isPending}
            >
              <SelectTrigger className='w-full'>
                <SelectValue>
                  {(v: string) =>
                    LANGUAGE_OPTIONS.find((o) => o.value === v)?.label ?? v
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              Column headers and labels in Excel exports use this language.
            </p>
          </div>
          {feedback && (
            <p
              className={
                feedback.type === 'success'
                  ? 'text-sm text-success'
                  : 'text-sm text-destructive'
              }
            >
              {feedback.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Add route to app.tsx**

In `apps/web/src/app/app.tsx`, add the import and route inside the manager routes block:
```typescript
import BusinessSettingsPage from '@/features/businesses/presentation/pages/business-settings.page';
// ...inside the manager <Route path='/employee/manager'> block:
<Route path='business' element={<BusinessSettingsPage />} />
```

- [ ] **Step 5: Add Business Settings item to manager sidebar**

In `apps/web/src/app/layouts/manager.layout.tsx`:
- Add `Building2` to the lucide-react import alongside `CalendarRange`, etc.
- Add a new `SidebarMenuItem` after the Change Requests item:

```tsx
<SidebarMenuItem>
  <SidebarMenuButton
    render={<NavLink to='/employee/manager/business' />}
    isActive={pathname.startsWith('/employee/manager/business')}
  >
    <Building2 />
    <span>Business Settings</span>
  </SidebarMenuButton>
</SidebarMenuItem>
```

- [ ] **Step 6: Build web**

Run: `cd apps/web && npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/businesses/ apps/web/src/app/app.tsx apps/web/src/app/layouts/manager.layout.tsx
git commit -m "feat(web): add Business Settings page with language selector"
```

---

### Task 11: Frontend — Supplier forms language field

**Files:**
- Modify: `apps/web/src/features/suppliers/presentation/pages/in-house-suppliers.page.tsx`
- Modify: `apps/web/src/features/suppliers/presentation/pages/partner-suppliers.page.tsx`

- [ ] **Step 1: Add language to in-house suppliers create form schema and default values**

In `apps/web/src/features/suppliers/presentation/pages/in-house-suppliers.page.tsx`:

Add `Language` to the `@food-up/shared` import.
Add `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` to the `@/components/ui/select` import.

Update the schema:
```typescript
const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactInfo: z.string().min(1, 'Contact info is required'),
  language: z.nativeEnum(Language),
});
type CreateSupplierFormValues = z.infer<typeof createSupplierSchema>;
```

Update form defaults:
```typescript
const createForm = useForm<CreateSupplierFormValues>({
  resolver: zodResolver(createSupplierSchema),
  defaultValues: { name: '', contactInfo: '', language: Language.En },
});
```

- [ ] **Step 2: Add language field to create form JSX**

Inside the create form, after the `contactInfo` `FormField`, add:
```tsx
<FormField
  control={createForm.control}
  name='language'
  render={({ field }) => (
    <FormItem>
      <FormLabel>Language</FormLabel>
      <FormControl>
        <Select
          value={field.value}
          onValueChange={field.onChange}
          disabled={createSupplier.isPending}
        >
          <SelectTrigger>
            <SelectValue>
              {(v: string) => (v === Language.En ? 'English' : 'Srpski')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Language.En} label='English'>English</SelectItem>
            <SelectItem value={Language.Sr} label='Srpski'>Srpski</SelectItem>
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

- [ ] **Step 3: Add language to inline edit in SupplierRow**

Update `SupplierRowProps`:
```typescript
interface SupplierRowProps {
  supplier: ISupplierResponse;
  isUpdating: boolean;
  isRemoving: boolean;
  onUpdate: (data: { name?: string; contactInfo?: string; language?: Language }) => void;
  onRemove: () => void;
  onManage: () => void;
}
```

In the `SupplierRow` component body, add language state:
```typescript
const [language, setLanguage] = useState<Language>(supplier.language);
```

Update `handleSave` to include language:
```typescript
function handleSave() {
  onUpdate({ name, contactInfo, language });
  setEditing(false);
}
```

Update `handleCancel` to reset language:
```typescript
function handleCancel() {
  setName(supplier.name);
  setContactInfo(supplier.contactInfo);
  setLanguage(supplier.language);
  setEditing(false);
}
```

Change the grid columns from `grid-cols-[1fr_1fr_auto]` to `grid-cols-[1fr_1fr_auto_auto]` in both the edit and display rows.

In the edit row, add after the contactInfo Input:
```tsx
<Select value={language} onValueChange={(v) => setLanguage(v as Language)} disabled={isUpdating}>
  <SelectTrigger className='w-28'>
    <SelectValue>{(v: string) => (v === Language.En ? 'English' : 'Srpski')}</SelectValue>
  </SelectTrigger>
  <SelectContent>
    <SelectItem value={Language.En} label='English'>English</SelectItem>
    <SelectItem value={Language.Sr} label='Srpski'>Srpski</SelectItem>
  </SelectContent>
</Select>
```

In the display row, add after the contactInfo span:
```tsx
<span className='text-sm text-muted-foreground'>
  {supplier.language === Language.En ? 'English' : 'Srpski'}
</span>
```

Also update the table header to include a Language column:
```tsx
<div className='grid grid-cols-[1fr_1fr_auto_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b'>
  <span>Name</span>
  <span>Contact info</span>
  <span>Language</span>
  <span />
</div>
```

- [ ] **Step 4: Add language inline select to partner-suppliers.page.tsx**

In `apps/web/src/features/suppliers/presentation/pages/partner-suppliers.page.tsx`, add the mutation and language column:

```typescript
import { Language } from '@food-up/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// inside the component:
const queryClient = useQueryClient();

const updateLanguage = useMutation({
  mutationFn: ({ id, language }: { id: string; language: Language }) =>
    supplierService.update(id, { language }),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['suppliers', 'partners'] }),
});
```

Update the table header to `grid-cols-[1fr_1fr_auto]`:
```tsx
<div className='grid grid-cols-[1fr_1fr_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b'>
  <span>Name</span>
  <span>Contact info</span>
  <span>Language</span>
</div>
```

Update each row to include a language select:
```tsx
{suppliers.map((supplier) => (
  <div
    key={supplier.id}
    className='grid grid-cols-[1fr_1fr_auto] items-center px-4 py-3 border-b last:border-b-0 gap-4'
  >
    <span className='text-sm font-medium'>{supplier.name}</span>
    <span className='text-sm text-muted-foreground'>{supplier.contactInfo}</span>
    <Select
      value={supplier.language}
      onValueChange={(v) =>
        updateLanguage.mutate({ id: supplier.id, language: v as Language })
      }
      disabled={
        updateLanguage.isPending && updateLanguage.variables?.id === supplier.id
      }
    >
      <SelectTrigger className='w-28'>
        <SelectValue>
          {(v: string) => (v === Language.En ? 'English' : 'Srpski')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={Language.En} label='English'>English</SelectItem>
        <SelectItem value={Language.Sr} label='Srpski'>Srpski</SelectItem>
      </SelectContent>
    </Select>
  </div>
))}
```

- [ ] **Step 5: Build web**

Run: `cd apps/web && npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/suppliers/
git commit -m "feat(web): add language field to supplier create and edit forms"
```
