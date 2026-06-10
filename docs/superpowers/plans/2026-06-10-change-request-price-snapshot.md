# Change Request Price Snapshot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Snapshot `MenuItem.price` onto `ChangeRequest` at approval time so cost report branches 2 and 3 are as immutable as branch 1.

**Architecture:** Add a nullable `price` column to `change_request`, capture it in the service when a CR transitions to `Approved` (by fetching `newMenuItemId`'s price), pass it through the domain entity's `changeStatus()`, and update the two live-price SQL branches in `getCostByWindow` to read `cr.price` instead.

**Tech Stack:** NestJS 11, TypeORM 0.3, PostgreSQL 17, Jest 29

---

## File Map

| Action | Path |
|--------|------|
| Modify | `apps/server/src/core/change-requests/domain/change-request.entity.ts` |
| Modify | `apps/server/src/core/change-requests/domain/change-request.entity.spec.ts` |
| Modify | `apps/server/src/core/change-requests/infrastructure/persistence/change-request.typeorm-entity.ts` |
| Modify | `apps/server/src/core/change-requests/infrastructure/persistence/change-request-typeorm.mapper.ts` |
| Modify | `apps/server/src/core/change-requests/application/change-requests.service.ts` |
| Create | `apps/server/src/core/change-requests/application/change-requests.service.approval-price.spec.ts` |
| Modify | `apps/server/src/core/reports/infrastructure/persistence/order-summary-query-typeorm.repository.ts` |
| Create | `apps/server/migrations/000004_change_request_price_snapshot.up.sql` |
| Create | `apps/server/migrations/000004_change_request_price_snapshot.down.sql` |

---

### Task 1: Add `price` to ChangeRequest domain entity

**Files:**
- Modify: `apps/server/src/core/change-requests/domain/change-request.entity.ts`
- Modify: `apps/server/src/core/change-requests/domain/change-request.entity.spec.ts`

- [ ] **Step 1: Add failing tests to the existing spec**

Append the following `describe` block to `apps/server/src/core/change-requests/domain/change-request.entity.spec.ts` (after the closing `}` of the existing `describe('ChangeRequest.changeStatus', ...)`):

```typescript
describe('ChangeRequest price snapshot', () => {
  describe('create()', () => {
    it('initialises price as null', () => {
      const cr = ChangeRequest.create('emp-1', 'win-1', 'mi-1', 1, 'sel-1');
      expect(cr.price).toBeNull();
    });
  });

  describe('reconstitute()', () => {
    it('restores a non-null price', () => {
      const cr = ChangeRequest.reconstitute(
        'cr-1', 'emp-1', 'win-1', 'mi-1', 1,
        ChangeRequestStatus.Approved, 'sel-1', false, 'mgr-1', new Date(), 12.50,
      );
      expect(cr.price).toBe(12.50);
    });

    it('restores a null price', () => {
      const cr = ChangeRequest.reconstitute(
        'cr-1', 'emp-1', 'win-1', 'mi-1', 1,
        ChangeRequestStatus.Approved, 'sel-1', false, 'mgr-1', new Date(), null,
      );
      expect(cr.price).toBeNull();
    });

    it('defaults price to null when argument is omitted', () => {
      const cr = ChangeRequest.reconstitute(
        'cr-1', 'emp-1', 'win-1', 'mi-1', 1,
        ChangeRequestStatus.Pending, 'sel-1',
      );
      expect(cr.price).toBeNull();
    });
  });

  describe('changeStatus()', () => {
    it('stores price when approved with a non-null price', () => {
      const cr = makePendingCR();
      cr.changeStatus(ChangeRequestStatus.Approved, 'mgr-1', new Date(), 9.99);
      expect(cr.price).toBe(9.99);
    });

    it('stores null price when approved with explicit null (clearSelection CR)', () => {
      const cr = makePendingCR();
      cr.changeStatus(ChangeRequestStatus.Approved, 'mgr-1', new Date(), null);
      expect(cr.price).toBeNull();
    });

    it('stores null price when rejected (no price argument)', () => {
      const cr = makePendingCR();
      cr.changeStatus(ChangeRequestStatus.Rejected, 'mgr-1', new Date());
      expect(cr.price).toBeNull();
    });

    it('stores null price when revoked (no price argument)', () => {
      const cr = makePendingCR();
      cr.changeStatus(ChangeRequestStatus.Revoked, 'emp-1', new Date());
      expect(cr.price).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd apps/server && npm test -- --testPathPattern="change-request.entity.spec" --no-coverage
```

Expected: FAIL — `cr.price` is not a property yet.

- [ ] **Step 3: Update the domain entity**

Replace the full content of `apps/server/src/core/change-requests/domain/change-request.entity.ts`:

```typescript
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { InvalidOperationException } from 'src/shared/domain/exceptions/invalid-operation.exception';
import { ChangeRequestStatus } from '@food-up/shared';
import { ChangeRequestApprovedEvent } from './events/change-request-approved.event';
import { ChangeRequestCreatedEvent } from './events/change-request-created.event';
import { ChangeRequestRejectedEvent } from './events/change-request-rejected.event';
import { ChangeRequestRevokedEvent } from './events/change-request-revoked.event';
import { ChangeRequestSelectionUpdatedEvent } from './events/change-request-selection-updated.event';

export class ChangeRequest extends Entity {
  static create(
    employeeId: string,
    mealSelectionWindowId: string,
    newMenuItemId: string | null,
    newQuantity: number | null,
    mealSelectionId?: string,
    clearSelection?: boolean,
  ): ChangeRequest {
    const changeRequest = new ChangeRequest(
      generateId(),
      employeeId,
      mealSelectionWindowId,
      newMenuItemId,
      newQuantity,
      ChangeRequestStatus.Pending,
      mealSelectionId,
      clearSelection,
      null,
      null,
      null,
    );
    changeRequest.addDomainEvent(new ChangeRequestCreatedEvent(changeRequest.id));
    return changeRequest;
  }

  static reconstitute(
    id: string,
    employeeId: string,
    mealSelectionWindowId: string,
    newMenuItemId: string | null,
    newQuantity: number | null,
    status: ChangeRequestStatus,
    mealSelectionId?: string,
    clearSelection?: boolean,
    approvedBy?: string | null,
    approvedAt?: Date | null,
    price?: number | null,
  ): ChangeRequest {
    return new ChangeRequest(
      id,
      employeeId,
      mealSelectionWindowId,
      newMenuItemId,
      newQuantity,
      status,
      mealSelectionId,
      clearSelection,
      approvedBy,
      approvedAt,
      price ?? null,
    );
  }

  private constructor(
    id: string,
    employeeId: string,
    mealSelectionWindowId: string,
    newMenuItemId: string | null,
    newQuantity: number | null,
    status: ChangeRequestStatus,
    mealSelectionId?: string,
    clearSelection?: boolean,
    approvedBy?: string | null,
    approvedAt?: Date | null,
    price: number | null = null,
  ) {
    super();
    this.id = id;
    this.employeeId = employeeId;
    this.mealSelectionWindowId = mealSelectionWindowId;
    this.mealSelectionId = mealSelectionId;
    this.newMenuItemId = newMenuItemId;
    this.newQuantity = newQuantity;
    this.status = status;
    this.approvedBy = approvedBy ?? null;
    this.approvedAt = approvedAt ?? null;
    this.clearSelection = clearSelection;
    this.price = price;

    if (newQuantity !== null && newQuantity <= 0) {
      throw new InvalidInputDataException(
        'Quantity must be a positive integer.',
      );
    }

    if (mealSelectionId === undefined) {
      if (!newMenuItemId || newQuantity === null) {
        throw new InvalidInputDataException(
          'Late selection requests require newMenuItemId and newQuantity.',
        );
      }
      if (clearSelection) {
        throw new InvalidInputDataException(
          'Cannot clear a selection that does not exist.',
        );
      }
    }
  }

  public updateSelection(
    newMenuItemId?: string,
    newQuantity?: number,
    clearSelection?: boolean,
  ) {
    if (this.status !== ChangeRequestStatus.Pending) {
      throw new InvalidOperationException(
        `Only change requests with status "${ChangeRequestStatus.Pending}" can be updated.`,
      );
    }

    if (newQuantity !== undefined && newQuantity <= 0) {
      throw new InvalidInputDataException(
        'Quantity must be a positive integer.',
      );
    }

    if (this.mealSelectionId === undefined && clearSelection) {
      throw new InvalidInputDataException(
        'Cannot clear a selection that does not exist.',
      );
    }

    this.newMenuItemId = newMenuItemId ?? this.newMenuItemId;
    this.newQuantity = newQuantity ?? this.newQuantity;
    this.clearSelection = clearSelection ?? this.clearSelection;

    this.addDomainEvent(new ChangeRequestSelectionUpdatedEvent(this.id));
  }

  public changeStatus(
    status: ChangeRequestStatus,
    approvedBy: string,
    date: Date,
    price?: number | null,
  ) {
    if (this.status !== ChangeRequestStatus.Pending) {
      throw new InvalidOperationException(
        `Only change requests with status "${ChangeRequestStatus.Pending}" can have their status changed.`,
      );
    }

    this.status = status;
    this.approvedBy = approvedBy;
    this.approvedAt = date;
    this.price = price ?? null;

    if (status === ChangeRequestStatus.Approved) {
      this.addDomainEvent(
        new ChangeRequestApprovedEvent({
          changeRequestId: this.id,
          employeeId: this.employeeId,
          mealSelectionId: this.mealSelectionId,
          newMenuItemId: this.newMenuItemId,
          newQuantity: this.newQuantity,
          clearSelection: this.clearSelection ?? false,
          status: ChangeRequestStatus.Approved,
        }),
      );
    } else if (status === ChangeRequestStatus.Rejected) {
      this.addDomainEvent(
        new ChangeRequestRejectedEvent({
          changeRequestId: this.id,
          employeeId: this.employeeId,
          status: ChangeRequestStatus.Rejected,
        }),
      );
    } else {
      this.addDomainEvent(
        new ChangeRequestRevokedEvent({
          changeRequestId: this.id,
          employeeId: this.employeeId,
          status: ChangeRequestStatus.Revoked,
        }),
      );
    }
  }

  readonly id: string;
  employeeId: string;
  mealSelectionWindowId: string;
  mealSelectionId: string | undefined;
  newMenuItemId: string | null;
  newQuantity: number | null;
  status: ChangeRequestStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
  clearSelection?: boolean;
  price: number | null;
}
```

- [ ] **Step 4: Run tests — must pass**

```bash
cd apps/server && npm test -- --testPathPattern="change-request.entity.spec" --no-coverage
```

Expected: PASS — all prior tests + 8 new tests pass.

- [ ] **Step 5: Run full suite**

```bash
cd apps/server && npm test -- --no-coverage
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/core/change-requests/domain/
git commit -m "feat(change-request): add price field to domain entity"
```

---

### Task 2: Update TypeORM entity and mapper

**Files:**
- Modify: `apps/server/src/core/change-requests/infrastructure/persistence/change-request.typeorm-entity.ts`
- Modify: `apps/server/src/core/change-requests/infrastructure/persistence/change-request-typeorm.mapper.ts`

There are no isolated unit tests for the mapper/TypeORM entity — correctness is verified via the full suite.

- [ ] **Step 1: Add `price` column to the TypeORM entity**

In `apps/server/src/core/change-requests/infrastructure/persistence/change-request.typeorm-entity.ts`, add the following column after the `approvedAt` column (before the closing `}`):

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

- [ ] **Step 2: Update the mapper**

Replace the full content of `apps/server/src/core/change-requests/infrastructure/persistence/change-request-typeorm.mapper.ts`:

```typescript
import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { ChangeRequest } from '../../domain/change-request.entity';
import { ChangeRequest as ChangeRequestPersistence } from './change-request.typeorm-entity';

export class ChangeRequestTypeOrmMapper extends TypeOrmMapper<
  ChangeRequest,
  ChangeRequestPersistence
> {
  toDomain(persistence: ChangeRequestPersistence): ChangeRequest {
    return ChangeRequest.reconstitute(
      persistence.id,
      persistence.employeeId,
      persistence.mealSelectionWindowId,
      persistence.newMenuItemId,
      persistence.newQuantity,
      persistence.status,
      persistence.mealSelectionId ?? undefined,
      persistence.clearSelection,
      persistence.approvedBy,
      persistence.approvedAt,
      persistence.price,
    );
  }

  toPersistence(domain: ChangeRequest): ChangeRequestPersistence {
    const persistence = new ChangeRequestPersistence();
    persistence.id = domain.id;
    persistence.employeeId = domain.employeeId;
    persistence.mealSelectionWindowId = domain.mealSelectionWindowId;
    persistence.mealSelectionId = domain.mealSelectionId ?? null;
    persistence.newMenuItemId = domain.newMenuItemId;
    persistence.newQuantity = domain.newQuantity;
    persistence.status = domain.status;
    persistence.approvedBy = domain.approvedBy;
    persistence.approvedAt = domain.approvedAt;
    persistence.price = domain.price;
    return persistence;
  }

  toPersistencePartial(domain: Partial<ChangeRequest>): Partial<ChangeRequestPersistence> {
    const persistence: Partial<ChangeRequestPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.employeeId !== undefined) persistence.employeeId = domain.employeeId;
    if (domain.mealSelectionWindowId !== undefined) persistence.mealSelectionWindowId = domain.mealSelectionWindowId;
    if ('mealSelectionId' in domain) persistence.mealSelectionId = domain.mealSelectionId ?? null;
    if (domain.newMenuItemId !== undefined) persistence.newMenuItemId = domain.newMenuItemId;
    if (domain.newQuantity !== undefined) persistence.newQuantity = domain.newQuantity;
    if (domain.status !== undefined) persistence.status = domain.status;
    if (domain.approvedBy !== undefined) persistence.approvedBy = domain.approvedBy;
    if (domain.approvedAt !== undefined) persistence.approvedAt = domain.approvedAt;
    if ('price' in domain) persistence.price = domain.price ?? null;
    return persistence;
  }
}
```

- [ ] **Step 3: Run full suite**

```bash
cd apps/server && npm test -- --no-coverage
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/core/change-requests/infrastructure/
git commit -m "feat(change-request): add price column to TypeORM entity and mapper"
```

---

### Task 3: Capture price in service when approving

**Files:**
- Modify: `apps/server/src/core/change-requests/application/change-requests.service.ts`
- Create: `apps/server/src/core/change-requests/application/change-requests.service.approval-price.spec.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/server/src/core/change-requests/application/change-requests.service.approval-price.spec.ts`:

```typescript
import { ChangeRequestStatus, EmployeeRole } from '@food-up/shared';
import { ChangeRequest } from '../domain/change-request.entity';
import { ChangeRequestsService } from './change-requests.service';

function makePendingCR(newMenuItemId: string | null = 'mi-1'): ChangeRequest {
  return ChangeRequest.reconstitute(
    'cr-1', 'emp-1', 'win-1', newMenuItemId, 1,
    ChangeRequestStatus.Pending, 'sel-1',
  );
}

describe('ChangeRequestsService — price snapshot on approval', () => {
  const identityId = 'identity-1';
  const managerId = 'mgr-1';

  let service: ChangeRequestsService;
  let mockRepository: { findOneByCriteriaOrThrow: jest.Mock; update: jest.Mock };
  let mockEmployeesService: { findByIdentity: jest.Mock };
  let mockMenuItemsService: { findOne: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };

  beforeEach(() => {
    mockRepository = {
      findOneByCriteriaOrThrow: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    mockEmployeesService = {
      findByIdentity: jest.fn().mockResolvedValue({
        id: managerId,
        role: EmployeeRole.Manager,
      }),
    };
    mockMenuItemsService = {
      findOne: jest.fn().mockResolvedValue({ price: 12.50 }),
    };
    mockTransactionRunner = {
      run: jest.fn().mockImplementation((cb: () => Promise<void>) => cb()),
    };

    service = new ChangeRequestsService(
      mockRepository as any,
      null as any,
      mockMenuItemsService as any,
      mockEmployeesService as any,
      null as any,
      { log: jest.fn() } as any,
      mockTransactionRunner as any,
      { emit: jest.fn() } as any,
    );
  });

  describe('updateStatus()', () => {
    it('snapshots MenuItem price onto CR when approving', async () => {
      const cr = makePendingCR('mi-1');
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(cr);

      await service.updateStatus('cr-1', identityId, ChangeRequestStatus.Approved);

      expect(mockMenuItemsService.findOne).toHaveBeenCalledWith('mi-1');
      expect(cr.price).toBe(12.50);
    });

    it('stores null price when approving a clearSelection CR (newMenuItemId = null)', async () => {
      const cr = ChangeRequest.reconstitute(
        'cr-1', 'emp-1', 'win-1', null, null,
        ChangeRequestStatus.Pending, 'sel-1', true,
      );
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(cr);

      await service.updateStatus('cr-1', identityId, ChangeRequestStatus.Approved);

      expect(mockMenuItemsService.findOne).not.toHaveBeenCalled();
      expect(cr.price).toBeNull();
    });

    it('does not fetch MenuItem price when rejecting', async () => {
      const cr = makePendingCR('mi-1');
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(cr);

      await service.updateStatus('cr-1', identityId, ChangeRequestStatus.Rejected);

      expect(mockMenuItemsService.findOne).not.toHaveBeenCalled();
      expect(cr.price).toBeNull();
    });
  });

  describe('bulkUpdateStatus()', () => {
    it('snapshots MenuItem price onto each approved CR', async () => {
      const cr = makePendingCR('mi-1');
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(cr);

      await service.bulkUpdateStatus(
        { items: [{ id: 'cr-1', status: ChangeRequestStatus.Approved }] },
        identityId,
      );

      expect(mockMenuItemsService.findOne).toHaveBeenCalledWith('mi-1');
      expect(cr.price).toBe(12.50);
    });

    it('does not fetch price when bulk-rejecting', async () => {
      const cr = makePendingCR('mi-1');
      mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(cr);

      await service.bulkUpdateStatus(
        { items: [{ id: 'cr-1', status: ChangeRequestStatus.Rejected }] },
        identityId,
      );

      expect(mockMenuItemsService.findOne).not.toHaveBeenCalled();
      expect(cr.price).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd apps/server && npm test -- --testPathPattern="change-requests.service.approval-price" --no-coverage
```

Expected: FAIL — price is not fetched or set yet.

- [ ] **Step 3: Update `updateStatus` in the service**

In `apps/server/src/core/change-requests/application/change-requests.service.ts`, replace the `updateStatus` method body with:

```typescript
@DomainEvents
async updateStatus(
  id: string,
  performedByIdentityId: string,
  status: ChangeRequestStatus,
): Promise<ChangeRequest> {
  const changeRequest = await this._repository.findOneByCriteriaOrThrow({ id });
  const performer = await this._employeesService.findByIdentity(performedByIdentityId);

  if (performer.role !== EmployeeRole.Manager) {
    throw new UnauthorizedException(
      'Only managers can change the status of a change request',
    );
  }

  let price: number | null = null;
  if (status === ChangeRequestStatus.Approved && changeRequest.newMenuItemId) {
    const menuItem = await this._menuItemsService.findOne(changeRequest.newMenuItemId);
    price = menuItem.price;
  }

  changeRequest.changeStatus(status, performer.id, new Date(), price);
  await this._repository.update(id, changeRequest);
  this._logger.log(
    `Change request status updated: id=${id} status=${status} by=${performer.id}`,
    ChangeRequestsService.name,
  );

  return changeRequest;
}
```

- [ ] **Step 4: Update the loop inside `bulkUpdateStatus`**

In `apps/server/src/core/change-requests/application/change-requests.service.ts`, inside `bulkUpdateStatus`, replace the inner loop body:

```typescript
// Before:
for (const item of dto.items) {
  const changeRequest = await this._repository.findOneByCriteriaOrThrow({ id: item.id });
  changeRequest.changeStatus(item.status, performer.id, new Date());
  await this._repository.update(item.id, changeRequest);
  results.push({
    changeRequestId: item.id,
    employeeId: changeRequest.employeeId,
    status: item.status,
  });
}

// After:
for (const item of dto.items) {
  const changeRequest = await this._repository.findOneByCriteriaOrThrow({ id: item.id });

  let price: number | null = null;
  if (item.status === ChangeRequestStatus.Approved && changeRequest.newMenuItemId) {
    const menuItem = await this._menuItemsService.findOne(changeRequest.newMenuItemId);
    price = menuItem.price;
  }

  changeRequest.changeStatus(item.status, performer.id, new Date(), price);
  await this._repository.update(item.id, changeRequest);
  results.push({
    changeRequestId: item.id,
    employeeId: changeRequest.employeeId,
    status: item.status,
  });
}
```

- [ ] **Step 5: Run tests — must pass**

```bash
cd apps/server && npm test -- --testPathPattern="change-requests.service.approval-price" --no-coverage
```

Expected: PASS — 5 tests.

- [ ] **Step 6: Run full suite**

```bash
cd apps/server && npm test -- --no-coverage
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/server/src/core/change-requests/application/
git commit -m "feat(change-request): snapshot MenuItem price onto CR at approval time"
```

---

### Task 4: Update cost report to read `cr.price`

**Files:**
- Modify: `apps/server/src/core/reports/infrastructure/persistence/order-summary-query-typeorm.repository.ts`

The `getCostByWindow` raw SQL has four UNION branches. Only branches 2 and 3 need to change — branch 1 already uses `ms.price`, branch 4 (extra quantities) is unrelated.

- [ ] **Step 1: Update branch 2 (modified selections)**

In `order-summary-query-typeorm.repository.ts`, inside `getCostByWindow`, find the second UNION member (the one that joins `change_request cr` on `cr.meal_selection_id = ms.id`). Make two changes:

Change the `SUM` expression from:
```sql
SUM(mi.price * COALESCE(cr.new_quantity, 1))
```
to:
```sql
SUM(cr.price * COALESCE(cr.new_quantity, 1))
```

Change the NULL guard in the `WHERE` clause from:
```sql
AND mi.price IS NOT NULL
```
to:
```sql
AND cr.price IS NOT NULL
```

The `INNER JOIN menu_item mi` line is **unchanged** — `mi` is still needed to reach `menu_period` and `supplier`.

- [ ] **Step 2: Update branch 3 (late selections)**

In the same method, find the third UNION member (the one that starts `FROM change_request cr` with `cr.meal_selection_id IS NULL`). Apply the same two changes:

Change:
```sql
SUM(mi.price * COALESCE(cr.new_quantity, 1))
```
to:
```sql
SUM(cr.price * COALESCE(cr.new_quantity, 1))
```

Change:
```sql
AND mi.price IS NOT NULL
```
to:
```sql
AND cr.price IS NOT NULL
```

After both edits the full `getCostByWindow` raw SQL should read:

```sql
SELECT "supplierId", "supplierName", SUM("totalCost") AS "totalCost"
FROM (
  SELECT s.id AS "supplierId", s.name AS "supplierName",
         -- price snapshot captured at selection time; NULL only for selections where menu item price was NULL
         SUM(COALESCE(ms.price, 0) * COALESCE(ms.quantity, 1)) AS "totalCost"
  FROM meal_selection ms
  INNER JOIN menu_item mi ON mi.id = ms.menu_item_id
  INNER JOIN menu_period mp ON mp.id = mi.menu_period_id
  INNER JOIN supplier s ON s.id = mp.supplier_id
  WHERE ms.meal_selection_window_id = $1
    AND ms.menu_item_id IS NOT NULL
    AND COALESCE(ms.quantity, 1) > 0
    AND NOT EXISTS (
      SELECT 1 FROM change_request cr
      WHERE cr.meal_selection_id = ms.id AND cr.status = 'approved'
    )
  GROUP BY s.id, s.name

  UNION ALL

  SELECT s.id, s.name,
         SUM(cr.price * COALESCE(cr.new_quantity, 1))
  FROM meal_selection ms
  INNER JOIN change_request cr
    ON cr.meal_selection_id = ms.id
    AND cr.status = 'approved'
    AND cr.clear_selection = false
  INNER JOIN menu_item mi ON mi.id = cr.new_menu_item_id
  INNER JOIN menu_period mp ON mp.id = mi.menu_period_id
  INNER JOIN supplier s ON s.id = mp.supplier_id
  WHERE ms.meal_selection_window_id = $1
    AND cr.new_menu_item_id IS NOT NULL
    AND cr.price IS NOT NULL
  GROUP BY s.id, s.name

  UNION ALL

  SELECT s.id, s.name,
         SUM(cr.price * COALESCE(cr.new_quantity, 1))
  FROM change_request cr
  INNER JOIN menu_item mi ON mi.id = cr.new_menu_item_id
  INNER JOIN menu_period mp ON mp.id = mi.menu_period_id
  INNER JOIN supplier s ON s.id = mp.supplier_id
  WHERE cr.meal_selection_window_id = $1
    AND cr.meal_selection_id IS NULL
    AND cr.status = 'approved'
    AND cr.clear_selection = false
    AND cr.new_menu_item_id IS NOT NULL
    AND cr.price IS NOT NULL
    AND COALESCE(cr.new_quantity, 1) > 0
  GROUP BY s.id, s.name

  UNION ALL

  SELECT s.id, s.name,
         SUM(mi.price * eq.quantity)
  FROM extra_quantity eq
  INNER JOIN menu_item mi ON mi.id = eq.menu_item_id
  INNER JOIN menu_period mp ON mp.id = mi.menu_period_id
  INNER JOIN supplier s ON s.id = mp.supplier_id
  WHERE eq.window_id = $1
    AND mi.price IS NOT NULL
  GROUP BY s.id, s.name
) AS combined
GROUP BY "supplierId", "supplierName"
ORDER BY "supplierName"
```

- [ ] **Step 3: Run full suite**

```bash
cd apps/server && npm test -- --no-coverage
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/core/reports/
git commit -m "feat(reports): read cost from change_request.price snapshot instead of live menu_item.price"
```

---

### Task 5: Write migration 000004

**Files:**
- Create: `apps/server/migrations/000004_change_request_price_snapshot.up.sql`
- Create: `apps/server/migrations/000004_change_request_price_snapshot.down.sql`

- [ ] **Step 1: Create up migration**

Create `apps/server/migrations/000004_change_request_price_snapshot.up.sql`:

```sql
ALTER TABLE change_request ADD COLUMN price NUMERIC(10, 2);
```

- [ ] **Step 2: Create down migration**

Create `apps/server/migrations/000004_change_request_price_snapshot.down.sql`:

```sql
ALTER TABLE change_request DROP COLUMN IF EXISTS price;
```

- [ ] **Step 3: Verify migration file count**

```bash
ls apps/server/migrations/
```

Expected: 8 files — pairs for 000001 through 000004.

- [ ] **Step 4: Commit**

```bash
git add apps/server/migrations/
git commit -m "feat(migrations): add change_request.price column (000004)"
```
