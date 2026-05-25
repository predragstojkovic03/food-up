# Change Request: Multi-Meal Selection & Revoke

**Date:** 2026-05-25

## Problem

Two bugs in the employee change request flow:

1. The `CreateChangeRequestDrawer` only allows changing one meal type per submission. Employees with breakfast, salad, and lunch ordered must open the drawer three separate times. The `existingSelection` lookup also uses `find()` (first match only), so the wrong `mealSelectionId` is referenced when multiple meal types exist on a day.

2. Employees cannot cancel an ordered meal after the window deadline, and cannot revoke a pending change request they already submitted.

---

## Design

### 1. Drawer Redesign (`create-change-request-drawer.tsx`)

**State:**
```ts
pendingChanges: Record<mealSelectionId, { newMenuItemId: string | null; clearSelection: boolean }>
```

**Flow:**
1. Employee picks a day (unchanged).
2. Drawer shows **all meal types the employee has a selection for on that day**: `selections.filter(s => s.date === selectedDay && s.menuItemId !== null)`, grouped by meal type in `TYPE_ORDER`.
3. Each meal type group renders independently:
   - Current selection at top of group — greyed out, non-clickable, labelled with the existing badge.
   - Alternative items for that same meal type below — tappable to toggle as the replacement (selecting clears any previous selection within the same group).
   - A "Remove [type]" row at the bottom — sets `clearSelection: true` and clears `newMenuItemId` for that `mealSelectionId`.
4. The submit button is enabled when `pendingChanges` has at least one entry.
5. Submit iterates `pendingChanges` **sequentially** and calls `changeRequestService.create()` for each:
   - On first failure: stop, surface the error, drawer stays open. Successfully created requests are left as pending (visible in the list).
   - On full success: invalidate `['change-requests', 'my']`, close and reset drawer.

**Cleanup:** `create-change-request-sheet.tsx` is an unused duplicate — deleted.

**i18n:** All new label strings added to the `employees` translation namespace.

---

### 2. Revoke Flow (`window-status-card.tsx`)

Each pending change request row in the collapsible list gains a small "Revoke" button (destructive outline style). Only `Pending` requests render the button; other statuses show only their badge.

Tapping "Revoke" opens a shadcn `AlertDialog` with:
- **Title:** `t('changeRequest.revokeDialog.title')`
- **Body:** Names the current meal and the requested meal (e.g. "This will cancel your pending request to change Chicken Fillet to Pasta Carbonara on Wednesday, Jun 4. Your original selection will remain.")
- **Actions:** "Keep it" (cancel) and "Revoke" (destructive confirm)

On confirm: calls `changeRequestService.revoke(id)`, invalidates `['change-requests', 'my']`.

`IChangeRequestService` gains:
```ts
revoke(id: string): Promise<void>;
```
Infrastructure service calls `PATCH /api/change-requests/:id/revoke`.

**i18n:** All dialog strings added to the `employees` translation namespace.

---

### 3. Server Changes

#### New domain event
`ChangeRequestRevokedEvent` — mirrors the structure of `ChangeRequestRejectedEvent` (contains `changeRequestId` and `employeeId`).

#### Entity update (`change-request.entity.ts`)
`changeStatus` currently emits `ChangeRequestRejectedEvent` for all non-Approved outcomes. Split the `else` branch into explicit cases:
- `Rejected` → emit `ChangeRequestRejectedEvent`
- `Revoked` → emit `ChangeRequestRevokedEvent`

#### Event handler (`change-request-event-handler.service.ts`)
Add listener for `ChangeRequestRevokedEvent` — no-op for now (no meal selection mutation on revoke), but the hook exists for future use.

#### New service method (`change-requests.service.ts`)
```ts
async revoke(id: string, identityId: string): Promise<void>
```
- Finds employee by `identityId`.
- Loads change request by `id` and verifies `employeeId === employee.id` (throws `UnauthorizedException` if not).
- Calls `changeRequest.changeStatus(ChangeRequestStatus.Revoked, employee.id, new Date())`.
- Persists and dispatches domain events via `@DomainEvents`.

#### New endpoint (`change-requests.controller.ts`)
```
PATCH /api/change-requests/:id/revoke
```
- Guard: `@RequiredIdentityType(IdentityTypeEnum.Employee)` — no manager role required.
- No request body.
- Full Swagger decorators (`@ApiOperation`, `@ApiResponse`).

---

## Files Changed

| File | Change |
|------|--------|
| `apps/web/src/features/employees/presentation/pages/components/create-change-request-drawer.tsx` | Full redesign |
| `apps/web/src/features/employees/presentation/pages/components/create-change-request-sheet.tsx` | Deleted |
| `apps/web/src/features/employees/presentation/pages/components/window-status-card.tsx` | Add revoke button + AlertDialog |
| `apps/web/src/features/change-requests/domain/change-request-service.interface.ts` | Add `revoke()` |
| `apps/web/src/features/change-requests/infrastructure/change-request.service.ts` | Implement `revoke()` |
| `apps/web/src/features/change-requests/application/use-my-change-requests.hook.ts` | Add `useRevokeChangeRequest` mutation |
| `apps/server/src/core/change-requests/domain/events/change-request-revoked.event.ts` | New file |
| `apps/server/src/core/change-requests/domain/change-request.entity.ts` | Split `else` in `changeStatus` |
| `apps/server/src/core/change-requests/infrastructure/change-request-event-handler.service.ts` | Add revoke listener |
| `apps/server/src/core/change-requests/application/change-requests.service.ts` | Add `revoke()` method |
| `apps/server/src/core/change-requests/presentation/rest/change-requests.controller.ts` | Add `PATCH /:id/revoke` |
| Translation files (`employees` namespace) | Add all new i18n keys |

---

## Out of Scope

- Bulk create endpoint (frontend uses sequential submission instead).
- Bulk employee revoke endpoint (single-item revoke is sufficient).
- Late selections for meal types the employee has no existing selection for (separate server-side concern).
