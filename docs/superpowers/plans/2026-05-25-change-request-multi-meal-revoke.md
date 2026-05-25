# Change Request: Multi-Meal Selection & Revoke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow employees to request changes for multiple meal types at once, cancel individual meals, and revoke pending change requests.

**Architecture:** Server gains a `PATCH /api/change-requests/:id/revoke` endpoint and a new `ChangeRequestRevokedEvent`. The frontend drawer is redesigned to show every meal type for the selected day independently, with per-type item selection and a Remove option; submission loops sequentially. The window-status card gains a Revoke button + AlertDialog per pending request.

**Tech Stack:** NestJS 11, TypeORM, React 19, TanStack Query, shadcn/ui (AlertDialog), react-i18next.

---

## File Map

| File | Action |
|------|--------|
| `apps/server/src/core/change-requests/domain/events/change-request-revoked.event.ts` | Create |
| `apps/server/src/core/change-requests/domain/change-request.entity.ts` | Modify – split `else` in `changeStatus` |
| `apps/server/src/core/change-requests/domain/change-request.entity.spec.ts` | Create – TDD for Revoked event |
| `apps/server/src/core/change-requests/infrastructure/change-request-event-handler.service.ts` | Modify – add no-op revoke listener |
| `apps/server/src/core/change-requests/application/change-requests.service.ts` | Modify – add `revoke()` |
| `apps/server/src/core/change-requests/application/change-requests.service.revoke.spec.ts` | Create – TDD for `revoke()` |
| `apps/server/src/core/change-requests/presentation/rest/change-requests.controller.ts` | Modify – add `PATCH /:id/revoke` |
| `apps/web/src/i18n/en/employees.json` | Modify – new keys |
| `apps/web/src/i18n/sr/employees.json` | Modify – new keys |
| `apps/web/src/features/change-requests/domain/change-request-service.interface.ts` | Modify – add `revoke()` |
| `apps/web/src/features/change-requests/infrastructure/change-request.service.ts` | Modify – implement `revoke()` |
| `apps/web/src/features/change-requests/application/use-my-change-requests.hook.ts` | Modify – add `useRevokeChangeRequest` |
| `apps/web/src/features/employees/presentation/pages/components/create-change-request-drawer.tsx` | Rewrite |
| `apps/web/src/features/employees/presentation/pages/components/create-change-request-sheet.tsx` | Delete |
| `apps/web/src/features/employees/presentation/pages/components/window-status-card.tsx` | Modify – revoke button + AlertDialog |

---

## Task 1: ChangeRequestRevokedEvent

**Files:**
- Create: `apps/server/src/core/change-requests/domain/events/change-request-revoked.event.ts`

- [ ] **Create the event file**

```typescript
import { ChangeRequestStatus } from '@food-up/shared';
import { IEvent } from 'src/shared/domain/event.interface';

export interface ChangeRequestRevokedPayload {
  changeRequestId: string;
  employeeId: string;
  status: ChangeRequestStatus;
}

export class ChangeRequestRevokedEvent implements IEvent {
  static readonly EVENT_NAME = 'changeRequest.revoked';
  readonly name = ChangeRequestRevokedEvent.EVENT_NAME;

  constructor(public readonly payload: ChangeRequestRevokedPayload) {}
}
```

- [ ] **Commit**

```bash
git add apps/server/src/core/change-requests/domain/events/change-request-revoked.event.ts
git commit -m "feat(server): add ChangeRequestRevokedEvent domain event"
```

---

## Task 2: Entity – emit ChangeRequestRevokedEvent for Revoked status

**Files:**
- Create: `apps/server/src/core/change-requests/domain/change-request.entity.spec.ts`
- Modify: `apps/server/src/core/change-requests/domain/change-request.entity.ts`

- [ ] **Write the failing test**

`apps/server/src/core/change-requests/domain/change-request.entity.spec.ts`:

```typescript
import { ChangeRequestStatus } from '@food-up/shared';
import { ChangeRequest } from './change-request.entity';
import { ChangeRequestApprovedEvent } from './events/change-request-approved.event';
import { ChangeRequestRejectedEvent } from './events/change-request-rejected.event';
import { ChangeRequestRevokedEvent } from './events/change-request-revoked.event';

function makePendingCR(): ChangeRequest {
  return ChangeRequest.reconstitute(
    'cr-1',
    'emp-1',
    'window-1',
    'item-1',
    1,
    ChangeRequestStatus.Pending,
    'sel-1',
  );
}

describe('ChangeRequest.changeStatus', () => {
  it('emits ChangeRequestRevokedEvent when status is Revoked', () => {
    const cr = makePendingCR();
    cr.changeStatus(ChangeRequestStatus.Revoked, 'emp-1', new Date());
    const events = cr.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ChangeRequestRevokedEvent);
  });

  it('emits ChangeRequestRejectedEvent when status is Rejected', () => {
    const cr = makePendingCR();
    cr.changeStatus(ChangeRequestStatus.Rejected, 'manager-1', new Date());
    const events = cr.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ChangeRequestRejectedEvent);
  });

  it('emits ChangeRequestApprovedEvent when status is Approved', () => {
    const cr = makePendingCR();
    cr.changeStatus(ChangeRequestStatus.Approved, 'manager-1', new Date());
    const events = cr.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ChangeRequestApprovedEvent);
  });

  it('throws when attempting to change status of a non-Pending request', () => {
    const cr = ChangeRequest.reconstitute(
      'cr-1', 'emp-1', 'window-1', 'item-1', 1,
      ChangeRequestStatus.Approved, 'sel-1',
    );
    expect(() => cr.changeStatus(ChangeRequestStatus.Rejected, 'manager-1', new Date())).toThrow();
  });
});
```

- [ ] **Run tests to confirm failure**

```bash
cd apps/server && npx jest --testPathPattern=change-request.entity.spec --no-coverage
```

Expected: FAIL — `ChangeRequestRevokedEvent` does not exist yet / Revoked test expects `ChangeRequestRevokedEvent` but gets `ChangeRequestRejectedEvent`.

- [ ] **Update `changeStatus` in the entity**

In `apps/server/src/core/change-requests/domain/change-request.entity.ts`:

1. Add import at the top:
```typescript
import { ChangeRequestRevokedEvent } from './events/change-request-revoked.event';
```

2. Replace the `else` block in `changeStatus` (lines 163–171):
```typescript
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
```

- [ ] **Run tests to confirm they pass**

```bash
cd apps/server && npx jest --testPathPattern=change-request.entity.spec --no-coverage
```

Expected: PASS (4 tests).

- [ ] **Commit**

```bash
git add apps/server/src/core/change-requests/domain/change-request.entity.ts \
        apps/server/src/core/change-requests/domain/change-request.entity.spec.ts
git commit -m "feat(server): emit ChangeRequestRevokedEvent on Revoked status"
```

---

## Task 3: Event handler – no-op listener for ChangeRequestRevokedEvent

**Files:**
- Modify: `apps/server/src/core/change-requests/infrastructure/change-request-event-handler.service.ts`

- [ ] **Add import and listener**

Add the import at the top:
```typescript
import { ChangeRequestRevokedEvent } from '../domain/events/change-request-revoked.event';
```

Add the method to the `ChangeRequestEventHandler` class after `handleRejected`:
```typescript
  @OnEvent(ChangeRequestRevokedEvent.EVENT_NAME)
  async handleRevoked(_event: ChangeRequestRevokedEvent): Promise<void> {
    // no notification sent on employee self-revoke
  }
```

- [ ] **Commit**

```bash
git add apps/server/src/core/change-requests/infrastructure/change-request-event-handler.service.ts
git commit -m "feat(server): add no-op handler for ChangeRequestRevokedEvent"
```

---

## Task 4: Service – `revoke()` method

**Files:**
- Create: `apps/server/src/core/change-requests/application/change-requests.service.revoke.spec.ts`
- Modify: `apps/server/src/core/change-requests/application/change-requests.service.ts`

- [ ] **Write the failing test**

`apps/server/src/core/change-requests/application/change-requests.service.revoke.spec.ts`:

```typescript
import { ChangeRequestStatus } from '@food-up/shared';
import { ChangeRequest } from '../domain/change-request.entity';
import { ChangeRequestsService } from './change-requests.service';
import { UnauthorizedException } from 'src/shared/domain/exceptions/unauthorized.exception';

function makePendingCR(employeeId: string): ChangeRequest {
  return ChangeRequest.reconstitute(
    'cr-1',
    employeeId,
    'window-1',
    'item-1',
    1,
    ChangeRequestStatus.Pending,
    'sel-1',
  );
}

describe('ChangeRequestsService.revoke', () => {
  const identityId = 'identity-1';
  const employeeId = 'emp-1';

  let service: ChangeRequestsService;
  let mockRepository: { findOneByCriteriaOrThrow: jest.Mock; update: jest.Mock };
  let mockEmployeesService: { findByIdentity: jest.Mock };

  beforeEach(() => {
    mockRepository = {
      findOneByCriteriaOrThrow: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    mockEmployeesService = {
      findByIdentity: jest.fn().mockResolvedValue({ id: employeeId }),
    };

    service = new ChangeRequestsService(
      mockRepository as any,
      null as any,
      null as any,
      mockEmployeesService as any,
      null as any,
      { log: jest.fn() } as any,
      null as any,
      { emit: jest.fn() } as any,
    );
  });

  it('throws UnauthorizedException when employee does not own the change request', async () => {
    mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(makePendingCR('other-emp'));

    await expect(service.revoke('cr-1', identityId)).rejects.toThrow(UnauthorizedException);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('sets status to Revoked and persists', async () => {
    const cr = makePendingCR(employeeId);
    mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(cr);

    await service.revoke('cr-1', identityId);

    expect(cr.status).toBe(ChangeRequestStatus.Revoked);
    expect(mockRepository.update).toHaveBeenCalledWith('cr-1', cr);
  });
});
```

- [ ] **Run tests to confirm failure**

```bash
cd apps/server && npx jest --testPathPattern=change-requests.service.revoke.spec --no-coverage
```

Expected: FAIL — `service.revoke is not a function`.

- [ ] **Add `revoke()` to the service**

In `apps/server/src/core/change-requests/application/change-requests.service.ts`, add after the `update()` method:

```typescript
  @DomainEvents
  async revoke(id: string, identityId: string): Promise<void> {
    const employee = await this._employeesService.findByIdentity(identityId);

    const changeRequest = await this._repository.findOneByCriteriaOrThrow({ id });

    if (changeRequest.employeeId !== employee.id) {
      throw new UnauthorizedException(
        'Employee can only revoke their own change requests.',
      );
    }

    changeRequest.changeStatus(ChangeRequestStatus.Revoked, employee.id, new Date());
    await this._repository.update(id, changeRequest);
    this._logger.log(`Change request revoked: id=${id}`, ChangeRequestsService.name);
  }
```

- [ ] **Run tests to confirm they pass**

```bash
cd apps/server && npx jest --testPathPattern=change-requests.service.revoke.spec --no-coverage
```

Expected: PASS (2 tests).

- [ ] **Commit**

```bash
git add apps/server/src/core/change-requests/application/change-requests.service.ts \
        apps/server/src/core/change-requests/application/change-requests.service.revoke.spec.ts
git commit -m "feat(server): add revoke() method to ChangeRequestsService"
```

---

## Task 5: Controller – `PATCH /:id/revoke` endpoint

**Files:**
- Modify: `apps/server/src/core/change-requests/presentation/rest/change-requests.controller.ts`

- [ ] **Add the endpoint**

Add after the `update()` handler (before `updateStatus`):

```typescript
  @ApiOperation({ summary: 'Revoke a change request (employee self-service)' })
  @ApiResponse({ status: 200 })
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @ApiBearerAuth()
  @Patch(':id/revoke')
  async revoke(
    @Param('id') id: string,
    @CurrentIdentity() user: JwtPayload,
  ): Promise<void> {
    await this._changeRequestsService.revoke(id, user.sub);
  }
```

- [ ] **Run the full test suite to check for regressions**

```bash
cd apps/server && npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Commit**

```bash
git add apps/server/src/core/change-requests/presentation/rest/change-requests.controller.ts
git commit -m "feat(server): add PATCH /change-requests/:id/revoke endpoint"
```

---

## Task 6: i18n – new translation keys

**Files:**
- Modify: `apps/web/src/i18n/en/employees.json`
- Modify: `apps/web/src/i18n/sr/employees.json`

- [ ] **Add keys to the English file**

Merge the following into the `"changeRequest"` object in `apps/web/src/i18n/en/employees.json`:

```json
"selectChanges": "Select changes",
"noSelectionsForDay": "No meals ordered for this day.",
"removeType": "Remove {{type}}",
"submitError": "Some requests could not be submitted. Please try again.",
"submitCount": "Submit {{count}} change request(s)",
"revokeButton": "Revoke",
"revokeDialog": {
  "title": "Revoke change request?",
  "bodyChange": "This will cancel your pending request to change {{currentMeal}} to {{requestedMeal}} on {{date}}. Your original selection will remain.",
  "bodyClear": "This will cancel your pending request to remove {{currentMeal}} on {{date}}. Your original selection will remain.",
  "cancel": "Keep it",
  "confirm": "Revoke",
  "noMeal": "No selection"
}
```

Full updated `"changeRequest"` section:
```json
"changeRequest": {
  "title": "Request a change",
  "selectDay": "Select a day",
  "noDaysAvailable": "No future days available for change requests.",
  "selectChanges": "Select changes",
  "noSelectionsForDay": "No meals ordered for this day.",
  "removeType": "Remove {{type}}",
  "submitError": "Some requests could not be submitted. Please try again.",
  "submitCount": "Submit {{count}} change request(s)",
  "currentBadge": "(current)",
  "revokeButton": "Revoke",
  "revokeDialog": {
    "title": "Revoke change request?",
    "bodyChange": "This will cancel your pending request to change {{currentMeal}} to {{requestedMeal}} on {{date}}. Your original selection will remain.",
    "bodyClear": "This will cancel your pending request to remove {{currentMeal}} on {{date}}. Your original selection will remain.",
    "cancel": "Keep it",
    "confirm": "Revoke",
    "noMeal": "No selection"
  }
}
```

- [ ] **Add keys to the Serbian file**

Full updated `"changeRequest"` section in `apps/web/src/i18n/sr/employees.json`:
```json
"changeRequest": {
  "title": "Zatražite promenu",
  "selectDay": "Izaberite dan",
  "noDaysAvailable": "Nema dostupnih budućih dana za zahteve za promenu.",
  "selectChanges": "Izaberite promene",
  "noSelectionsForDay": "Nema narudžbina za ovaj dan.",
  "removeType": "Ukloni {{type}}",
  "submitError": "Neki zahtevi nisu mogli biti poslati. Pokušajte ponovo.",
  "submitCount": "Pošalji {{count}} zahtev(a) za promenu",
  "currentBadge": "(trenutno)",
  "revokeButton": "Opozovi",
  "revokeDialog": {
    "title": "Opozovite zahtev za promenu?",
    "bodyChange": "Ovo će otkazati vaš zahtev na čekanju za promenu {{currentMeal}} u {{requestedMeal}} na dan {{date}}. Vaš originalni izbor će ostati.",
    "bodyClear": "Ovo će otkazati vaš zahtev na čekanju za uklanjanje {{currentMeal}} na dan {{date}}. Vaš originalni izbor će ostati.",
    "cancel": "Zadrži",
    "confirm": "Opozovi",
    "noMeal": "Bez izbora"
  }
}
```

- [ ] **Commit**

```bash
git add apps/web/src/i18n/en/employees.json apps/web/src/i18n/sr/employees.json
git commit -m "feat(web): add i18n keys for multi-meal drawer and revoke dialog"
```

---

## Task 7: Frontend – revoke() service method and mutation hook

**Files:**
- Modify: `apps/web/src/features/change-requests/domain/change-request-service.interface.ts`
- Modify: `apps/web/src/features/change-requests/infrastructure/change-request.service.ts`
- Modify: `apps/web/src/features/change-requests/application/use-my-change-requests.hook.ts`

- [ ] **Add `revoke()` to the interface**

Full file content for `apps/web/src/features/change-requests/domain/change-request-service.interface.ts`:

```typescript
import {
  IBulkUpdateChangeRequestStatus,
  ICreateChangeRequest,
  IRichChangeRequest,
} from '@food-up/shared';

export interface IChangeRequestService {
  getMy(): Promise<IRichChangeRequest[]>;
  getByWindow(windowId: string): Promise<IRichChangeRequest[]>;
  getPendingCount(windowId: string): Promise<number>;
  create(data: ICreateChangeRequest): Promise<IRichChangeRequest>;
  bulkUpdateStatus(data: IBulkUpdateChangeRequestStatus): Promise<void>;
  revoke(id: string): Promise<void>;
}
```

- [ ] **Implement `revoke()` in the service**

Add to `apps/web/src/features/change-requests/infrastructure/change-request.service.ts` after `bulkUpdateStatus`:

```typescript
  revoke(id: string): Promise<void> {
    return this.http.patch<Record<string, never>, void>(`/api/change-requests/${id}/revoke`, {});
  }
```

- [ ] **Add `useRevokeChangeRequest` to the hook file**

Full file content for `apps/web/src/features/change-requests/application/use-my-change-requests.hook.ts`:

```typescript
import { useServices } from '@/shared/infrastructure/di/service.context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMyChangeRequests() {
  const { changeRequestService } = useServices();

  return useQuery({
    queryKey: ['change-requests', 'my'],
    queryFn: () => changeRequestService.getMy(),
  });
}

export function useRevokeChangeRequest() {
  const { changeRequestService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => changeRequestService.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests', 'my'] });
    },
  });
}
```

- [ ] **Commit**

```bash
git add apps/web/src/features/change-requests/domain/change-request-service.interface.ts \
        apps/web/src/features/change-requests/infrastructure/change-request.service.ts \
        apps/web/src/features/change-requests/application/use-my-change-requests.hook.ts
git commit -m "feat(web): add revoke() to change request service and mutation hook"
```

---

## Task 8: Redesign CreateChangeRequestDrawer

**Files:**
- Rewrite: `apps/web/src/features/employees/presentation/pages/components/create-change-request-drawer.tsx`
- Delete: `apps/web/src/features/employees/presentation/pages/components/create-change-request-sheet.tsx`

- [ ] **Rewrite the drawer**

Full file content for `apps/web/src/features/employees/presentation/pages/components/create-change-request-drawer.tsx`:

```typescript
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRSD } from '@/lib/utils';
import { useServices } from '@/shared/infrastructure/di/service.context';
import {
  IMyMealSelectionResponse,
  IRelevantMealSelectionWindowResponse,
  MealType,
} from '@food-up/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TYPE_ORDER: MealType[] = [
  MealType.Breakfast,
  MealType.Soup,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Salad,
  MealType.Dessert,
];

const TYPE_LABEL_KEYS: Record<MealType, string> = {
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Bread]: 'Bread',
  [MealType.Soup]: 'Soup',
  [MealType.Lunch]: 'Main',
  [MealType.Dinner]: 'Dinner',
  [MealType.Salad]: 'Salad',
  [MealType.Dessert]: 'Dessert',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

type PendingChange = { newMenuItemId: string | null; clearSelection: boolean };

interface CreateChangeRequestDrawerProps {
  window: IRelevantMealSelectionWindowResponse;
  selections: IMyMealSelectionResponse[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChangeRequestDrawer({
  window,
  selections,
  open,
  onOpenChange,
}: CreateChangeRequestDrawerProps) {
  const { t } = useTranslation('employees');
  const { mealSelectionWindowService, changeRequestService } = useServices();
  const queryClient = useQueryClient();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingChange>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const futureDates = window.targetDates.filter((d) => d > today);

  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery({
    queryKey: ['meal-selection-windows', 'menu-items', window.id],
    queryFn: () => mealSelectionWindowService.getMenuItems(window.id),
    enabled: open,
  });

  const daySelections = selectedDay
    ? selections.filter((s) => s.date === selectedDay && s.menuItemId !== null)
    : [];

  const dayMenuItems = selectedDay ? menuItems.filter((m) => m.day === selectedDay) : [];

  function handleDaySelect(date: string) {
    setSelectedDay(date);
    setPendingChanges({});
    setSubmitError(null);
  }

  function handleClose() {
    setSelectedDay(null);
    setPendingChanges({});
    setSubmitError(null);
    onOpenChange(false);
  }

  function handleSelectItem(selectionId: string, menuItemId: string) {
    setPendingChanges((prev) => ({
      ...prev,
      [selectionId]: { newMenuItemId: menuItemId, clearSelection: false },
    }));
  }

  function handleRemove(selectionId: string) {
    setPendingChanges((prev) => ({
      ...prev,
      [selectionId]: { newMenuItemId: null, clearSelection: true },
    }));
  }

  function handleClearChange(selectionId: string) {
    setPendingChanges((prev) => {
      const next = { ...prev };
      delete next[selectionId];
      return next;
    });
  }

  async function handleSubmit() {
    const entries = Object.entries(pendingChanges);
    if (entries.length === 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      for (const [selectionId, change] of entries) {
        await changeRequestService.create({
          mealSelectionWindowId: window.id,
          mealSelectionId: selectionId,
          newMenuItemId: change.newMenuItemId ?? undefined,
          newQuantity: change.newMenuItemId ? 1 : undefined,
          clearSelection: change.clearSelection || undefined,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['change-requests', 'my'] });
      handleClose();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : t('changeRequest.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const changeCount = Object.keys(pendingChanges).length;

  return (
    <Drawer open={open} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DrawerContent className="max-h-[85dvh] px-0">
        <div className="overflow-y-auto flex flex-col flex-1">
          <DrawerHeader className="px-4">
            <DrawerTitle>{t('changeRequest.title')}</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 space-y-5 pb-2">
            {/* Step 1 — pick a day */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('changeRequest.selectDay')}
              </p>
              {futureDates.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t('changeRequest.noDaysAvailable')}</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {futureDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => handleDaySelect(date)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                        selectedDay === date
                          ? 'border-primary bg-primary/5 text-primary font-medium'
                          : 'border-border bg-card hover:bg-muted'
                      }`}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2 — per-type selection */}
            {selectedDay && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('changeRequest.selectChanges')}
                </p>

                {menuItemsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                  </div>
                ) : daySelections.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    {t('changeRequest.noSelectionsForDay')}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {TYPE_ORDER.filter((type) =>
                      daySelections.some((s) => s.meal?.type === type),
                    ).map((type) => {
                      const sel = daySelections.find((s) => s.meal?.type === type)!;
                      const typeOptions = dayMenuItems.filter(
                        (m) => m.meal.type === type && m.id !== sel.menuItemId,
                      );
                      const pending = pendingChanges[sel.id];

                      return (
                        <div key={type} className="space-y-1.5">
                          <p className="text-xs text-muted-foreground font-medium">
                            {TYPE_LABEL_KEYS[type]}
                          </p>

                          {/* Current selection — greyed, non-interactive */}
                          <div className="px-3 py-2.5 rounded-lg border border-border bg-muted text-sm text-muted-foreground">
                            {sel.meal!.name}
                            <span className="ml-2 text-xs">{t('changeRequest.currentBadge')}</span>
                          </div>

                          {/* Alternatives */}
                          {typeOptions.map((item) => {
                            const isSelected = pending?.newMenuItemId === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() =>
                                  isSelected
                                    ? handleClearChange(sel.id)
                                    : handleSelectItem(sel.id, item.id)
                                }
                                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 font-medium'
                                    : 'border-border bg-card hover:bg-muted'
                                }`}
                              >
                                <span>{item.meal.name}</span>
                                {item.price != null && (
                                  <span className="ml-auto text-xs text-muted-foreground float-right">
                                    {formatRSD(item.price)}
                                  </span>
                                )}
                              </button>
                            );
                          })}

                          {/* Remove option */}
                          <button
                            onClick={() =>
                              pending?.clearSelection
                                ? handleClearChange(sel.id)
                                : handleRemove(sel.id)
                            }
                            className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                              pending?.clearSelection
                                ? 'border-destructive bg-destructive/5 text-destructive font-medium'
                                : 'border-border bg-card hover:bg-muted text-muted-foreground'
                            }`}
                          >
                            {t('changeRequest.removeType', { type: TYPE_LABEL_KEYS[type] })}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {submitError && (
                  <p className="text-sm text-destructive mt-2">{submitError}</p>
                )}
              </div>
            )}
          </div>

          <DrawerFooter className="px-4">
            <Button
              className="w-full"
              disabled={changeCount === 0 || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? t('actions.submitting', { ns: 'common' })
                : changeCount > 0
                  ? t('changeRequest.submitCount', { count: changeCount })
                  : t('actions.submit', { ns: 'common' })}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

- [ ] **Delete the unused sheet component**

```bash
rm apps/web/src/features/employees/presentation/pages/components/create-change-request-sheet.tsx
```

- [ ] **Commit**

```bash
git add apps/web/src/features/employees/presentation/pages/components/create-change-request-drawer.tsx
git rm apps/web/src/features/employees/presentation/pages/components/create-change-request-sheet.tsx
git commit -m "feat(web): redesign change request drawer for multi-meal selection and cancel"
```

---

## Task 9: Add revoke button and AlertDialog to WindowStatusCard

**Files:**
- Modify: `apps/web/src/features/employees/presentation/pages/components/window-status-card.tsx`

- [ ] **Update imports at the top of the file**

Add to the existing imports block:

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRevokeChangeRequest } from '@/features/change-requests/application/use-my-change-requests.hook';
```

- [ ] **Add `revokeTargetId` state inside `WindowStatusCard`**

Inside `WindowStatusCard`, after the existing `useState` calls (after `const [crSheetOpen, setCrSheetOpen] = useState(false);`):

```typescript
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null);
  const revokeTarget = changeRequests.find((cr) => cr.id === revokeTargetId) ?? null;
  const { mutate: revokeChangeRequest, isPending: isRevoking } = useRevokeChangeRequest();
```

- [ ] **Add Revoke button to each pending change request row**

Replace the change request row `<div>` (inside `CollapsibleContent`, the `changeRequests.map` block) with:

```typescript
                    {changeRequests.map((cr) => (
                      <div
                        key={cr.id}
                        className='flex items-start justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2'
                      >
                        <div className='space-y-0.5 min-w-0'>
                          <p className='text-xs font-medium'>
                            {cr.date ? formatDate(cr.date) : '—'}
                          </p>
                          <p className='text-xs text-muted-foreground truncate'>
                            {cr.currentMeal?.name ?? t('changeRequest.revokeDialog.noMeal')}
                            {' → '}
                            {cr.requestedMeal?.name ?? '—'}
                          </p>
                        </div>
                        <div className='flex items-center gap-2 shrink-0'>
                          {cr.status === ChangeRequestStatus.Pending && (
                            <button
                              onClick={() => setRevokeTargetId(cr.id)}
                              className='text-xs px-2 py-1 rounded border border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors'
                            >
                              {t('changeRequest.revokeButton')}
                            </button>
                          )}
                          <Badge
                            variant={STATUS_VARIANTS[cr.status]}
                            className='text-xs'
                          >
                            {STATUS_LABELS[cr.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
```

- [ ] **Add the AlertDialog before the closing `</>` of the component return**

Add before the closing `</>` fragment (after `<CreateChangeRequestDrawer ... />`):

```typescript
      <AlertDialog
        open={!!revokeTargetId}
        onOpenChange={(open) => { if (!open) setRevokeTargetId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('changeRequest.revokeDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {revokeTarget && (
                revokeTarget.requestedMeal
                  ? t('changeRequest.revokeDialog.bodyChange', {
                      currentMeal: revokeTarget.currentMeal?.name ?? t('changeRequest.revokeDialog.noMeal'),
                      requestedMeal: revokeTarget.requestedMeal.name,
                      date: revokeTarget.date ? formatDate(revokeTarget.date) : '—',
                    })
                  : t('changeRequest.revokeDialog.bodyClear', {
                      currentMeal: revokeTarget.currentMeal?.name ?? t('changeRequest.revokeDialog.noMeal'),
                      date: revokeTarget.date ? formatDate(revokeTarget.date) : '—',
                    })
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('changeRequest.revokeDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={isRevoking}
              onClick={() => {
                if (revokeTargetId) {
                  revokeChangeRequest(revokeTargetId, {
                    onSuccess: () => setRevokeTargetId(null),
                  });
                }
              }}
            >
              {t('changeRequest.revokeDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
```

- [ ] **Run the TypeScript compiler to check for type errors**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add apps/web/src/features/employees/presentation/pages/components/window-status-card.tsx
git commit -m "feat(web): add revoke button and confirmation dialog for pending change requests"
```
