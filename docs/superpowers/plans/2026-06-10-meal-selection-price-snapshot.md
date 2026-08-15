# Meal Selection Price Snapshot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Snapshot `MenuItem.price` onto `MealSelection` at write time, lock prices during active selection windows, and update the cost report to read from snapshots.

**Architecture:** Add a nullable `price` column to `meal_selection`, populate it in the service at creation/update time, guard `MenuItemsService.update()` with an active-window check (using `forwardRef` to resolve the circular module dependency), and update cost report branch 1 to use `ms.price` instead of `mi.price`.

**Tech Stack:** NestJS 11, TypeORM 0.3, PostgreSQL 17, Jest 29

---

## File Map

| Action | Path |
|--------|------|
| Modify | `apps/server/src/core/meal-selections/domain/meal-selection.entity.ts` |
| Create | `apps/server/src/core/meal-selections/domain/meal-selection.entity.spec.ts` |
| Modify | `apps/server/src/core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity.ts` |
| Modify | `apps/server/src/core/meal-selections/infrastructure/persistence/meal-selection-typeorm.mapper.ts` |
| Modify | `apps/server/src/core/meal-selections/application/meal-selections.service.ts` |
| Create | `apps/server/src/core/meal-selections/application/meal-selections.service.spec.ts` |
| Modify | `apps/server/src/core/meal-selection-windows/domain/meal-selection-windows.repository.interface.ts` |
| Modify | `apps/server/src/core/meal-selection-windows/infrastructure/persistence/meal-selection-windows-typeorm.repository.ts` |
| Modify | `apps/server/src/core/meal-selection-windows/application/meal-selection-windows.service.ts` |
| Modify | `apps/server/src/core/menu-items/application/menu-items.service.ts` |
| Create | `apps/server/src/core/menu-items/application/menu-items.service.spec.ts` |
| Modify | `apps/server/src/core/menu-items/menu-items.module.ts` |
| Modify | `apps/server/src/core/meal-selection-windows/meal-selection-windows.module.ts` |
| Modify | `apps/server/src/core/reports/infrastructure/persistence/order-summary-query-typeorm.repository.ts` |
| Create | `apps/server/migrations/000003_meal_selection_price_snapshot.up.sql` |
| Create | `apps/server/migrations/000003_meal_selection_price_snapshot.down.sql` |

---

### Task 1: Add `price` to MealSelection domain entity

**Files:**
- Modify: `apps/server/src/core/meal-selections/domain/meal-selection.entity.ts`
- Create: `apps/server/src/core/meal-selections/domain/meal-selection.entity.spec.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/server/src/core/meal-selections/domain/meal-selection.entity.spec.ts`:

```typescript
import { MealSelection } from './meal-selection.entity';

describe('MealSelection', () => {
  describe('create()', () => {
    it('stores price when provided', () => {
      const ms = MealSelection.create('emp-1', 'win-1', '2026-01-01', 'mi-1', 2, 12.50);
      expect(ms.price).toBe(12.50);
    });

    it('stores null price when not provided', () => {
      const ms = MealSelection.create('emp-1', 'win-1', '2026-01-01', 'mi-1', 2);
      expect(ms.price).toBeNull();
    });

    it('stores null price when no menu item', () => {
      const ms = MealSelection.create('emp-1', 'win-1', '2026-01-01');
      expect(ms.price).toBeNull();
    });
  });

  describe('reconstitute()', () => {
    it('reconstitutes with price', () => {
      const ms = MealSelection.reconstitute('id-1', 'emp-1', 'win-1', '2026-01-01', 'mi-1', 2, 9.99);
      expect(ms.price).toBe(9.99);
    });

    it('reconstitutes with null price', () => {
      const ms = MealSelection.reconstitute('id-1', 'emp-1', 'win-1', '2026-01-01', 'mi-1', 2, null);
      expect(ms.price).toBeNull();
    });
  });

  describe('update()', () => {
    it('updates price when new menu item provided', () => {
      const ms = MealSelection.reconstitute('id-1', 'emp-1', 'win-1', '2026-01-01', 'mi-1', 2, 9.99);
      ms.update('mi-2', undefined, 15.00);
      expect(ms.price).toBe(15.00);
    });

    it('clears price when selection cleared (menuItemId = null)', () => {
      const ms = MealSelection.reconstitute('id-1', 'emp-1', 'win-1', '2026-01-01', 'mi-1', 2, 9.99);
      ms.update(null, undefined, null);
      expect(ms.price).toBeNull();
    });

    it('does not change price when menuItemId is undefined', () => {
      const ms = MealSelection.reconstitute('id-1', 'emp-1', 'win-1', '2026-01-01', 'mi-1', 2, 9.99);
      ms.update(undefined, 3, undefined);
      expect(ms.price).toBe(9.99);
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd apps/server && npm test -- --testPathPattern="meal-selection.entity.spec" --no-coverage
```

Expected: FAIL — `MealSelection.create` signature mismatch.

- [ ] **Step 3: Update the domain entity**

Replace the full content of `apps/server/src/core/meal-selections/domain/meal-selection.entity.ts`:

```typescript
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { MealSelectionCreatedEvent } from './events/meal-selection-created.event';
import { MealSelectionMenuItemChangedEvent } from './events/meal-selection-menu-item-changed.event';
import { MealSelectionQuantityChangedEvent } from './events/meal-selection-quantity-changed.event';
import { MealSelectionUpdatedEvent } from './events/meal-selection-updated.event';

export class MealSelection extends Entity {
  static create(
    employeeId: string,
    mealSelectionWindowId: string,
    date: string,
    menuItemId?: string,
    quantity?: number,
    price: number | null = null,
  ): MealSelection {
    const mealSelection = new MealSelection(
      generateId(),
      employeeId,
      mealSelectionWindowId,
      date,
      menuItemId,
      quantity,
      price,
    );

    mealSelection.addDomainEvent(
      new MealSelectionCreatedEvent(mealSelection.id),
    );

    return mealSelection;
  }

  static reconstitute(
    id: string,
    employeeId: string,
    mealSelectionWindowId: string,
    date: string,
    menuItemId?: string,
    quantity?: number | null,
    price: number | null = null,
  ): MealSelection {
    return new MealSelection(
      id,
      employeeId,
      mealSelectionWindowId,
      date,
      menuItemId,
      quantity ?? undefined,
      price,
    );
  }

  private constructor(
    id: string,
    employeeId: string,
    mealSelectionWindowId: string,
    date: string,
    menuItemId?: string,
    quantity?: number,
    price: number | null = null,
  ) {
    super();

    this._id = id;
    this._employeeId = employeeId;
    this._mealSelectionWindowId = mealSelectionWindowId;
    this._date = date;
    this._menuItemId = menuItemId;
    this._quantity = quantity;
    this._price = price;
  }

  private readonly _id: string;
  private readonly _employeeId: string;
  private _menuItemId: string | undefined;
  private readonly _mealSelectionWindowId: string;
  private _quantity: number | undefined;
  private readonly _date: string;
  private _price: number | null;

  get id(): string {
    return this._id;
  }

  get employeeId(): string {
    return this._employeeId;
  }

  get menuItemId(): string | undefined {
    return this._menuItemId;
  }

  set menuItemId(value: string | undefined) {
    this._menuItemId = value;
    this.addDomainEvent(new MealSelectionMenuItemChangedEvent(this.id, value));
  }

  get mealSelectionWindowId(): string {
    return this._mealSelectionWindowId;
  }

  get quantity(): number | undefined {
    return this._quantity;
  }

  set quantity(value: number | undefined) {
    this._quantity = value;
    this.addDomainEvent(new MealSelectionQuantityChangedEvent(this.id, value));
  }

  get date(): string {
    return this._date;
  }

  get price(): number | null {
    return this._price;
  }

  // menuItemId: undefined = don't change, null = clear selection, string = change to this item
  // quantity:   undefined = don't change, null = clear
  // price:      undefined = don't change, null = clear, number = set
  update(menuItemId?: string | null, quantity?: number | null, price?: number | null) {
    if (menuItemId !== undefined) {
      this.menuItemId = menuItemId ?? undefined;
    }
    if (quantity !== undefined) {
      this.quantity = quantity ?? undefined;
    }
    if (price !== undefined) {
      this._price = price;
    }
    this.addDomainEvent(new MealSelectionUpdatedEvent(this.id));
  }
}
```

- [ ] **Step 4: Run tests — must pass**

```bash
cd apps/server && npm test -- --testPathPattern="meal-selection.entity.spec" --no-coverage
```

Expected: PASS — 8 tests.

- [ ] **Step 5: Update TypeORM entity**

In `apps/server/src/core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity.ts`, add the `price` column after the `quantity` column:

```typescript
@Column('numeric', {
  precision: 10,
  scale: 2,
  nullable: true,
  transformer: {
    from: (v: string | null) => (v != null ? Number(v) : null),
    to: (v) => v,
  },
})
price: number | null;
```

- [ ] **Step 6: Update the mapper**

Replace the full content of `apps/server/src/core/meal-selections/infrastructure/persistence/meal-selection-typeorm.mapper.ts`:

```typescript
import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { MealSelection } from '../../domain/meal-selection.entity';
import { MealSelection as MealSelectionPersistence } from './meal-selection.typeorm-entity';

export class MealSelectionTypeOrmMapper extends TypeOrmMapper<
  MealSelection,
  MealSelectionPersistence
> {
  toDomain(persistence: MealSelectionPersistence): MealSelection {
    return MealSelection.reconstitute(
      persistence.id,
      persistence.employeeId,
      persistence.mealSelectionWindow.id,
      persistence.date,
      persistence.menuItem?.id ?? undefined,
      persistence.quantity ?? undefined,
      persistence.price ?? null,
    );
  }

  toPersistence(domain: MealSelection): MealSelectionPersistence {
    const persistence = new MealSelectionPersistence();
    persistence.id = domain.id;
    persistence.employeeId = domain.employeeId;
    persistence.menuItem = domain.menuItemId
      ? ({ id: domain.menuItemId } as any as MenuItem)
      : null;
    persistence.mealSelectionWindow = { id: domain.mealSelectionWindowId } as any;
    persistence.date = domain.date;
    persistence.quantity = domain.quantity ?? null;
    persistence.price = domain.price;
    return persistence;
  }

  toPersistencePartial(
    domain: Partial<MealSelection>,
  ): Partial<MealSelectionPersistence> {
    const persistence: Partial<MealSelectionPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.employeeId !== undefined) persistence.employeeId = domain.employeeId;
    if (domain.date !== undefined) persistence.date = domain.date;
    if (domain.quantity !== undefined) persistence.quantity = domain.quantity ?? null;
    if (domain.menuItemId !== undefined)
      persistence.menuItem = domain.menuItemId
        ? ({ id: domain.menuItemId } as any)
        : null;
    if (domain.mealSelectionWindowId !== undefined)
      persistence.mealSelectionWindow = { id: domain.mealSelectionWindowId } as any;
    if (domain.price !== undefined) persistence.price = domain.price ?? null;
    return persistence;
  }
}
```

- [ ] **Step 7: Run full test suite**

```bash
cd apps/server && npm test -- --no-coverage
```

Expected: all 17 existing tests pass + 8 new tests pass.

- [ ] **Step 8: Commit**

```bash
git add apps/server/src/core/meal-selections/
git commit -m "feat(meal-selection): add price field to domain entity, TypeORM entity, and mapper"
```

---

### Task 2: Capture price in MealSelectionsService

**Files:**
- Modify: `apps/server/src/core/meal-selections/application/meal-selections.service.ts`
- Create: `apps/server/src/core/meal-selections/application/meal-selections.service.spec.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/server/src/core/meal-selections/application/meal-selections.service.spec.ts`:

```typescript
import { MealSelectionsService } from './meal-selections.service';

describe('MealSelectionsService', () => {
  let service: MealSelectionsService;
  let mockRepository: any;
  let mockWindowsService: any;
  let mockEmployeesService: any;
  let mockMenuItemsService: any;

  const employeeId = 'emp-1';
  const windowId = 'win-1';
  const menuItemId = 'mi-1';
  const identityId = 'identity-1';

  beforeEach(() => {
    mockRepository = { insert: jest.fn(), findOneByCriteriaOrThrow: jest.fn(), update: jest.fn() };
    mockEmployeesService = {
      findByIdentity: jest.fn().mockResolvedValue({ id: employeeId }),
    };
    mockWindowsService = {
      findOne: jest.fn().mockResolvedValue({
        id: windowId,
        isActive: true,
        targetDates: new Set(['2026-01-01']),
        menuPeriodIds: ['period-1'],
      }),
    };
    mockMenuItemsService = {
      findOne: jest.fn().mockResolvedValue({
        id: menuItemId,
        menuPeriodId: 'period-1',
        price: 12.50,
      }),
    };

    service = new MealSelectionsService(
      mockRepository,
      mockWindowsService,
      mockEmployeesService,
      mockMenuItemsService,
      { log: jest.fn() } as any,
    );
  });

  describe('create()', () => {
    it('captures price from menu item onto selection', async () => {
      const result = await service.create(identityId, {
        mealSelectionWindowId: windowId,
        date: '2026-01-01',
        menuItemId,
      });

      expect(result.price).toBe(12.50);
    });

    it('stores null price when no menu item', async () => {
      const result = await service.create(identityId, {
        mealSelectionWindowId: windowId,
        date: '2026-01-01',
      });

      expect(result.price).toBeNull();
    });

    it('stores null price when menu item has no price', async () => {
      mockMenuItemsService.findOne.mockResolvedValue({
        id: menuItemId,
        menuPeriodId: 'period-1',
        price: null,
      });

      const result = await service.create(identityId, {
        mealSelectionWindowId: windowId,
        date: '2026-01-01',
        menuItemId,
      });

      expect(result.price).toBeNull();
    });
  });

  describe('update()', () => {
    it('updates price when new menu item provided', async () => {
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue({
        id: 'sel-1',
        employeeId,
        mealSelectionWindowId: windowId,
        price: 9.99,
        update: jest.fn(),
      });

      await service.update('sel-1', identityId, { menuItemId: 'mi-2' });

      const selection = mockRepository.findOneByCriteriaOrThrow.mock.results[0].value;
      expect(selection.update).toHaveBeenCalledWith('mi-2', undefined, 12.50);
    });

    it('clears price when menuItemId set to null', async () => {
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue({
        id: 'sel-1',
        employeeId,
        mealSelectionWindowId: windowId,
        price: 9.99,
        update: jest.fn(),
      });

      await service.update('sel-1', identityId, { menuItemId: null });

      const selection = mockRepository.findOneByCriteriaOrThrow.mock.results[0].value;
      expect(selection.update).toHaveBeenCalledWith(null, undefined, null);
    });

    it('does not change price when menuItemId not in dto', async () => {
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue({
        id: 'sel-1',
        employeeId,
        mealSelectionWindowId: windowId,
        price: 9.99,
        update: jest.fn(),
      });

      await service.update('sel-1', identityId, { quantity: 3 });

      const selection = mockRepository.findOneByCriteriaOrThrow.mock.results[0].value;
      expect(selection.update).toHaveBeenCalledWith(undefined, 3, undefined);
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd apps/server && npm test -- --testPathPattern="meal-selections.service.spec" --no-coverage
```

Expected: FAIL — price not captured yet.

- [ ] **Step 3: Update MealSelectionsService**

Replace the full content of `apps/server/src/core/meal-selections/application/meal-selections.service.ts`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { MenuItemsService } from 'src/core/menu-items/application/menu-items.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { MealSelection } from '../domain/meal-selection.entity';
import {
  I_MEAL_SELECTIONS_REPOSITORY,
  IMealSelectionsRepository,
  RichMealSelection,
} from '../domain/meal-selections.repository.interface';
import { CreateMealSelectionDto } from '../presentation/rest/dto/create-meal-selection.dto';
import { UpdateMealSelectionDto } from '../presentation/rest/dto/update-meal-selection.dto';

@Injectable()
export class MealSelectionsService {
  constructor(
    @Inject(I_MEAL_SELECTIONS_REPOSITORY)
    private readonly _repository: IMealSelectionsRepository,
    private readonly _mealSelectionWindowsService: MealSelectionWindowsService,
    private readonly _employeesService: EmployeesService,
    private readonly _menuItemsService: MenuItemsService,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  async create(
    identityId: string,
    dto: CreateMealSelectionDto,
  ): Promise<MealSelection> {
    const employee = await this._employeesService.findByIdentity(identityId);

    const mealSelectionWindow = await this._mealSelectionWindowsService.findOne(
      dto.mealSelectionWindowId,
    );

    if (!mealSelectionWindow.isActive) {
      throw new InvalidInputDataException(
        'Meal selection window is not active',
      );
    }

    if (!mealSelectionWindow.targetDates.has(dto.date)) {
      throw new InvalidInputDataException(
        `Date ${dto.date} is not a valid target date for this meal selection window`,
      );
    }

    let menuItemPrice: number | null = null;
    if (dto.menuItemId) {
      const menuItem = await this._menuItemsService.findOne(dto.menuItemId);

      if (!mealSelectionWindow.menuPeriodIds.includes(menuItem.menuPeriodId)) {
        throw new InvalidInputDataException(
          `Menu item ${dto.menuItemId} does not belong to any menu period of window ${dto.mealSelectionWindowId}`,
        );
      }

      menuItemPrice = menuItem.price;
    }

    const mealSelection = MealSelection.create(
      employee.id,
      mealSelectionWindow.id,
      dto.date,
      dto.menuItemId,
      dto.quantity,
      menuItemPrice,
    );

    await this._repository.insert(mealSelection);
    this._logger.log(
      `Meal selection created: id=${mealSelection.id} employeeId=${employee.id} windowId=${dto.mealSelectionWindowId} date=${dto.date}`,
      MealSelectionsService.name,
    );

    return mealSelection;
  }

  async findAll(): Promise<MealSelection[]> {
    return this._repository.findAll();
  }

  findOne(id: string): Promise<MealSelection> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  findByWindow(windowId: string): Promise<MealSelection[]> {
    return this._repository.findByWindow(windowId);
  }

  async findByEmployeeAndWindow(
    employeeId: string,
    windowId: string,
  ): Promise<MealSelection | null> {
    const results = await this._repository.findAllByEmployeeAndWindow(
      employeeId,
      windowId,
    );
    return results[0] ?? null;
  }

  async findMySelectionsForWindow(
    identityId: string,
    windowId: string,
  ): Promise<RichMealSelection[]> {
    const employee = await this._employeesService.findByIdentity(identityId);
    return this._repository.findRichByEmployeeAndWindow(employee.id, windowId);
  }

  async update(
    id: string,
    identityId: string,
    dto: UpdateMealSelectionDto,
  ): Promise<MealSelection> {
    const employee = await this._employeesService.findByIdentity(identityId);

    const mealSelection = await this._repository.findOneByCriteriaOrThrow({
      id,
      employeeId: employee.id,
    });

    const mealSelectionWindow = await this._mealSelectionWindowsService.findOne(
      mealSelection.mealSelectionWindowId,
    );

    if (!mealSelectionWindow.isActive) {
      throw new InvalidInputDataException(
        'Meal selection window is not active',
      );
    }

    let menuItemPrice: number | null | undefined = undefined;
    if (dto.menuItemId) {
      const menuItem = await this._menuItemsService.findOne(dto.menuItemId);

      if (!mealSelectionWindow.menuPeriodIds.includes(menuItem.menuPeriodId)) {
        throw new InvalidInputDataException(
          `Menu item ${dto.menuItemId} does not belong to any menu period of window ${mealSelection.mealSelectionWindowId}`,
        );
      }

      menuItemPrice = menuItem.price;
    } else if (dto.menuItemId === null) {
      menuItemPrice = null;
    }

    mealSelection.update(dto.menuItemId, dto.quantity, menuItemPrice);

    await this._repository.update(id, mealSelection);
    this._logger.log(`Meal selection updated: id=${id}`, MealSelectionsService.name);

    return mealSelection;
  }

  async delete(id: string): Promise<void> {
    await this._repository.delete(id);
    this._logger.log(`Meal selection deleted: id=${id}`, MealSelectionsService.name);
  }

  existsByEmployeeWindowWithSameMealTypeAndDateAs(
    employeeId: string,
    windowId: string,
    newMenuItemId: string,
  ): Promise<boolean> {
    return this._repository.existsByEmployeeWindowWithSameMealTypeAndDateAs(
      employeeId,
      windowId,
      newMenuItemId,
    );
  }
}
```

- [ ] **Step 4: Run tests — must pass**

```bash
cd apps/server && npm test -- --testPathPattern="meal-selections.service.spec" --no-coverage
```

Expected: PASS — 6 tests.

- [ ] **Step 5: Run full suite**

```bash
cd apps/server && npm test -- --no-coverage
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/core/meal-selections/application/
git commit -m "feat(meal-selection): capture MenuItem price snapshot on create and update"
```

---

### Task 3: Add `existsActiveByMenuPeriodId` to window repository and service

**Files:**
- Modify: `apps/server/src/core/meal-selection-windows/domain/meal-selection-windows.repository.interface.ts`
- Modify: `apps/server/src/core/meal-selection-windows/infrastructure/persistence/meal-selection-windows-typeorm.repository.ts`
- Modify: `apps/server/src/core/meal-selection-windows/application/meal-selection-windows.service.ts`

- [ ] **Step 1: Add method to repository interface**

In `apps/server/src/core/meal-selection-windows/domain/meal-selection-windows.repository.interface.ts`, add the new method to `IMealSelectionWindowsRepository`:

```typescript
export interface IMealSelectionWindowsRepository
  extends IRepository<MealSelectionWindow> {
  findAllByBusiness(businessId: string): Promise<MealSelectionWindow[]>;
  findLatestActiveByBusiness(businessId: string): Promise<MealSelectionWindow>;
  findLatestPublishedByBusiness(
    businessId: string,
  ): Promise<MealSelectionWindow | null>;
  existsActiveByMenuPeriodId(menuPeriodId: string): Promise<boolean>;
}
```

- [ ] **Step 2: Implement in TypeORM repository**

In `apps/server/src/core/meal-selection-windows/infrastructure/persistence/meal-selection-windows-typeorm.repository.ts`, add the method after `findLatestPublishedByBusiness`:

```typescript
async existsActiveByMenuPeriodId(menuPeriodId: string): Promise<boolean> {
  const count = await this._repository
    .createQueryBuilder('msw')
    .innerJoin('msw.menuPeriods', 'mp')
    .where('mp.id = :menuPeriodId', { menuPeriodId })
    .andWhere('msw.endTime > :now', { now: new Date() })
    .andWhere('msw.isLocked = false')
    .getCount();
  return count > 0;
}
```

- [ ] **Step 3: Expose via service**

In `apps/server/src/core/meal-selection-windows/application/meal-selection-windows.service.ts`, add this method at the end of the class (before the closing brace):

```typescript
existsActiveByMenuPeriodId(menuPeriodId: string): Promise<boolean> {
  return this._repository.existsActiveByMenuPeriodId(menuPeriodId);
}
```

- [ ] **Step 4: Run full test suite**

```bash
cd apps/server && npm test -- --no-coverage
```

Expected: all tests pass (TypeScript compilation confirms interface is satisfied).

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/core/meal-selection-windows/
git commit -m "feat(meal-selection-windows): add existsActiveByMenuPeriodId repository method"
```

---

### Task 4: Add price lock guard to MenuItemsService

**Files:**
- Modify: `apps/server/src/core/menu-items/application/menu-items.service.ts`
- Create: `apps/server/src/core/menu-items/application/menu-items.service.spec.ts`
- Modify: `apps/server/src/core/menu-items/menu-items.module.ts`
- Modify: `apps/server/src/core/meal-selection-windows/meal-selection-windows.module.ts`

**Context:** `MealSelectionWindowsService` already injects `MenuItemsService`, so adding the reverse dependency creates a circular module dependency. NestJS resolves this with `forwardRef()`.

- [ ] **Step 1: Write failing test**

Create `apps/server/src/core/menu-items/application/menu-items.service.spec.ts`:

```typescript
import { InvalidOperationException } from 'src/shared/domain/exceptions/invalid-operation.exception';
import { MenuItemsService } from './menu-items.service';

describe('MenuItemsService.update()', () => {
  let service: MenuItemsService;
  let mockRepository: any;
  let mockMealSelectionWindowsService: any;

  const menuItemId = 'mi-1';

  beforeEach(() => {
    mockRepository = {
      findOneByCriteriaOrThrow: jest.fn().mockResolvedValue({
        id: menuItemId,
        menuPeriodId: 'period-1',
        price: 10.00,
        day: '2026-01-01',
      }),
      update: jest.fn(),
    };
    mockMealSelectionWindowsService = {
      existsActiveByMenuPeriodId: jest.fn().mockResolvedValue(false),
    };

    service = new MenuItemsService(
      mockRepository,
      { findWithMealsByMenuPeriodIds: jest.fn() } as any,
      { findOne: jest.fn() } as any,
      { findOne: jest.fn() } as any,
      mockMealSelectionWindowsService,
    );
  });

  it('throws InvalidOperationException when updating price with active window', async () => {
    mockMealSelectionWindowsService.existsActiveByMenuPeriodId.mockResolvedValue(true);

    await expect(
      service.update(menuItemId, { price: 15.00 }),
    ).rejects.toThrow(InvalidOperationException);

    expect(mockMealSelectionWindowsService.existsActiveByMenuPeriodId)
      .toHaveBeenCalledWith('period-1');
  });

  it('allows price update when no active window', async () => {
    mockMealSelectionWindowsService.existsActiveByMenuPeriodId.mockResolvedValue(false);

    await expect(
      service.update(menuItemId, { price: 15.00 }),
    ).resolves.not.toThrow();
  });

  it('skips active-window check when price not in dto', async () => {
    await service.update(menuItemId, { day: '2026-02-01' });

    expect(mockMealSelectionWindowsService.existsActiveByMenuPeriodId)
      .not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd apps/server && npm test -- --testPathPattern="menu-items.service.spec" --no-coverage
```

Expected: FAIL — constructor signature mismatch.

- [ ] **Step 3: Update MenuItemsService**

Replace the full content of `apps/server/src/core/menu-items/application/menu-items.service.ts`:

```typescript
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { MealsService } from 'src/core/meals/application/meals.service';
import { MenuPeriodsService } from 'src/core/menu-periods/application/menu-periods.service';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { InvalidOperationException } from 'src/shared/domain/exceptions/invalid-operation.exception';
import { MenuItem } from '../domain/menu-item.entity';
import {
  I_MENU_ITEMS_REPOSITORY,
  IMenuItemsRepository,
} from '../domain/menu-items.repository.interface';
import { MenuItemWithMealDto } from './queries/dto/find-menu-items-with-meals.dto';
import { MenuItemsQueryService } from './queries/menu-items-query.service';

@Injectable()
export class MenuItemsService {
  constructor(
    @Inject(I_MENU_ITEMS_REPOSITORY)
    private readonly _repository: IMenuItemsRepository,
    private readonly _menuItemsQueryService: MenuItemsQueryService,
    private readonly _mealsService: MealsService,
    private readonly _menuPeriodsService: MenuPeriodsService,
    @Inject(forwardRef(() => MealSelectionWindowsService))
    private readonly _mealSelectionWindowsService: MealSelectionWindowsService,
  ) {}

  async create(dto: {
    price?: number | null;
    menuPeriodId: string;
    day: string;
    mealId: string;
  }): Promise<MenuItem> {
    const meal = await this._mealsService.findOne(dto.mealId);

    const menuPeriod = await this._menuPeriodsService.findOne(dto.menuPeriodId);

    if (menuPeriod.supplierId !== meal.supplierId) {
      throw new InvalidInputDataException(
        `Meal with ID ${meal.id} does not belong to the supplier of menu period ${dto.menuPeriodId}`,
      );
    }

    const existingMealOnSameDay = await this._repository.findOneByCriteria({
      menuPeriodId: dto.menuPeriodId,
      day: dto.day,
      mealId: meal.id,
    });

    if (existingMealOnSameDay) {
      throw new InvalidInputDataException(
        `Meal with ID ${meal.id} is already assigned to menu period ${dto.menuPeriodId} on day ${dto.day}`,
      );
    }

    const menuItem = MenuItem.create(
      dto.price,
      dto.menuPeriodId,
      dto.day,
      meal.id,
    );

    await this._repository.insert(menuItem);

    return menuItem;
  }

  async findAll(): Promise<MenuItem[]> {
    return this._repository.findAll();
  }

  async findByMenuPeriod(menuPeriodId: string): Promise<MenuItem[]> {
    return this._repository.findByCriteria({ menuPeriodId } as any);
  }

  async findOne(id: string): Promise<MenuItem> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  async update(
    id: string,
    dto: { price?: number | null; day?: string },
  ): Promise<MenuItem> {
    const menuItem = await this.findOne(id);

    if (dto.price !== undefined) {
      const locked = await this._mealSelectionWindowsService.existsActiveByMenuPeriodId(
        menuItem.menuPeriodId,
      );
      if (locked) {
        throw new InvalidOperationException(
          'Cannot change price while a meal selection window referencing this menu period is active.',
        );
      }
      menuItem.price = dto.price;
    }

    if (dto.day !== undefined) {
      menuItem.day = dto.day;
    }

    await this._repository.update(id, menuItem);

    return menuItem;
  }

  findWithMealsByMenuPeriods(
    menuPeriodIds: string[],
  ): Promise<MenuItemWithMealDto[]> {
    return this._menuItemsQueryService.findWithMealsByMenuPeriodIds(
      menuPeriodIds,
    );
  }

  findBulkByMenuPeriodIds(menuPeriodIds: string[]): Promise<MenuItem[]> {
    return this._repository.findBulkByMenuPeriodIdsWithMeal(menuPeriodIds);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
```

- [ ] **Step 4: Update MenuItemsModule to resolve circular dependency**

Replace the full content of `apps/server/src/core/menu-items/menu-items.module.ts`:

```typescript
import { forwardRef, Module } from '@nestjs/common';
import { MealSelectionWindowsModule } from '../meal-selection-windows/meal-selection-windows.module';
import { MealsModule } from '../meals/meals.module';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import { MenuItemsService } from './application/menu-items.service';
import { I_MENU_ITEMS_QUERY_REPOSITORY } from './application/queries/menu-items-query-repository.interface';
import { MenuItemsQueryService } from './application/queries/menu-items-query.service';
import { MenuItemsRepositoryProvide } from './infrastructure/menu-items.providers';
import { MenuItemsQueryTypeOrmRepository } from './infrastructure/persistence/menu-items-query-typeorm.repository';
import { MenuItemsController } from './presentation/rest/menu-items.controller';

@Module({
  imports: [MealsModule, MenuPeriodsModule, forwardRef(() => MealSelectionWindowsModule)],
  controllers: [MenuItemsController],
  providers: [
    MenuItemsRepositoryProvide,
    MenuItemsService,
    MenuItemsQueryService,
    {
      provide: I_MENU_ITEMS_QUERY_REPOSITORY,
      useClass: MenuItemsQueryTypeOrmRepository,
    },
  ],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
```

- [ ] **Step 5: Update MealSelectionWindowsModule to use forwardRef for MenuItemsModule**

In `apps/server/src/core/meal-selection-windows/meal-selection-windows.module.ts`, change the `MenuItemsModule` import to use `forwardRef`. Replace the import line:

```typescript
import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { bullmqTelemetry } from 'src/shared/infrastructure/notifications/bullmq-telemetry';
import {
  MEAL_WINDOW_QUEUE,
  WINDOW_DEADLINE_QUEUE,
} from 'src/shared/infrastructure/notifications/queue-names';
import { EmployeesModule } from '../employees/employees.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import { MealSelectionWindowsService } from './application/meal-selection-windows.service';
import { MealSelectionWindowEventHandler } from './infrastructure/meal-selection-window-event-handler.service';
import { MealSelectionWindowsRepositoryProvider } from './infrastructure/meal-selection-windows.providers';
import { MealSelectionWindowsController } from './presentation/rest/meal-selection-windows.controller';

@Module({
  imports: [
    MenuPeriodsModule,
    EmployeesModule,
    forwardRef(() => MenuItemsModule),
    BullModule.registerQueue(
      { name: MEAL_WINDOW_QUEUE, telemetry: bullmqTelemetry },
      { name: WINDOW_DEADLINE_QUEUE, telemetry: bullmqTelemetry },
    ),
  ],
  providers: [
    MealSelectionWindowsRepositoryProvider,
    MealSelectionWindowsService,
    MealSelectionWindowEventHandler,
  ],
  exports: [MealSelectionWindowsService],
  controllers: [MealSelectionWindowsController],
})
export class MealSelectionWindowsModule {}
```

- [ ] **Step 6: Run tests — must pass**

```bash
cd apps/server && npm test -- --testPathPattern="menu-items.service.spec" --no-coverage
```

Expected: PASS — 3 tests.

- [ ] **Step 7: Run full suite**

```bash
cd apps/server && npm test -- --no-coverage
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add apps/server/src/core/menu-items/ apps/server/src/core/meal-selection-windows/meal-selection-windows.module.ts
git commit -m "feat(menu-items): lock price update when active meal selection window references menu period"
```

---

### Task 5: Update cost report to use price snapshot

**Files:**
- Modify: `apps/server/src/core/reports/infrastructure/persistence/order-summary-query-typeorm.repository.ts`

- [ ] **Step 1: Update branch 1 of `getCostByWindow()`**

In `order-summary-query-typeorm.repository.ts`, find the `getCostByWindow()` method (around line 103). In branch 1 (the first `SELECT` inside the `FROM (...)` subquery — "Selections with no approved CR"), make two changes:

**Change the SUM** from:
```sql
SUM(mi.price * COALESCE(ms.quantity, 1)) AS "totalCost"
```
To:
```sql
SUM(COALESCE(ms.price, 0) * COALESCE(ms.quantity, 1)) AS "totalCost"
```

**Remove the filter** (delete this line from branch 1 only):
```sql
AND mi.price IS NOT NULL
```

Branches 2, 3, and 4 are **not changed** — they continue to read `mi.price` live.

- [ ] **Step 2: Run full test suite**

```bash
cd apps/server && npm test -- --no-coverage
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/core/reports/
git commit -m "feat(reports): read cost from meal_selection.price snapshot instead of live menu_item.price"
```

---

### Task 6: Write migration 000003

**Files:**
- Create: `apps/server/migrations/000003_meal_selection_price_snapshot.up.sql`
- Create: `apps/server/migrations/000003_meal_selection_price_snapshot.down.sql`

- [ ] **Step 1: Create up migration**

Create `apps/server/migrations/000003_meal_selection_price_snapshot.up.sql`:

```sql
ALTER TABLE meal_selection ADD COLUMN price NUMERIC(10, 2);
```

- [ ] **Step 2: Create down migration**

Create `apps/server/migrations/000003_meal_selection_price_snapshot.down.sql`:

```sql
ALTER TABLE meal_selection DROP COLUMN IF EXISTS price;
```

- [ ] **Step 3: Verify migration file count**

```bash
ls apps/server/migrations/
```

Expected: 6 files — `000001_*.up.sql`, `000001_*.down.sql`, `000002_*.up.sql`, `000002_*.down.sql`, `000003_*.up.sql`, `000003_*.down.sql`.

- [ ] **Step 4: Commit**

```bash
git add apps/server/migrations/
git commit -m "feat(migrations): add meal_selection.price column (000003)"
```
