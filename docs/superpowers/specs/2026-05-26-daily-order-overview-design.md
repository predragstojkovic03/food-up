# Daily Order Overview — Design Spec

**Date:** 2026-05-26
**Feature:** Per-day employee order overview for managers in the meal selection windows view

## Overview

When a manager expands a meal selection window in the windows list, each date section header gets a small icon button. Clicking it opens a Dialog showing a table of all employees and what they ordered for that day. Employees who never submitted any selection record for that date are highlighted red so the manager can spot gaps immediately.

## Backend

### Endpoint

`GET /api/meal-selections/window/:windowId/daily-overview`

Returns `IWindowDailyOverviewItem[]` — one flat item per (employee × date) combination covering all dates in the window. The frontend groups by date trivially; all business logic (status derivation, name resolution) stays on the server.

### Response Type (`shared/`)

```typescript
interface IWindowDailyOverviewItem {
  employeeId: string;
  employeeName: string;
  date: string; // ISO date string 'YYYY-MM-DD'
  status: 'ordered' | 'skipped' | 'no_record';
  meals: Array<{ name: string; type: MealType }>;
}
```

- `ordered` — selection record exists and at least one `menuItemId` is non-null
- `skipped` — selection record exists but all `menuItemId` values are null (employee went through wizard, chose nothing)
- `no_record` — employee has no selection row at all for this date

### Architecture

Follows the existing **Query Repository Pattern**:

- `application/queries/meal-selection-overview-query-repository.interface.ts` — symbol + interface
- `application/queries/meal-selection-overview-query.service.ts` — thin `@Injectable` wrapping the query repository
- `application/queries/dto/window-daily-overview-item.dto.ts` — plain TS type (no class-transformer)
- `infrastructure/persistence/meal-selection-overview-query-typeorm.repository.ts` — `createQueryBuilder` + `getRawMany`, respects `TransactionContext`

The query LEFT JOINs all employees in the business against `meal_selection` rows for the window, then against `menu_item` to resolve meal names. Status is derived in the SQL `CASE` expression or in the repository mapping layer.

The endpoint is added to the existing `MealSelectionController` (or a dedicated controller if module boundaries require it), guarded by `@EmployeeRole(EmployeeRole.Manager)`.

## Frontend

### Trigger

In `WindowDetails` (`meal-selection-windows.page.tsx`), each date section header row becomes a `flex items-center justify-between` container. The date text stays on the left; a small icon button (`Users` from lucide-react) is added on the right. Clicking it opens the Dialog for that date.

State: a single `string | null` piece of state (`openDate`) on `WindowDetails` — when non-null it holds the currently selected date and the Dialog renders open.

### Data Fetching

A new TanStack Query hook `useWindowDailyOverview(windowId)` fetches the endpoint when `WindowDetails` mounts (the manager has already expanded the row). The query key is `['meal-selections', 'daily-overview', windowId]`. Data is cached so switching between day Dialogs is instant.

### Dialog

- `DialogHeader`: "Orders for [formatted date]" — using the existing `formatDate` utility
- `DialogContent`: scrollable table, `max-h-[70vh] overflow-y-auto`
- No `DialogFooter` — read-only view, dismissed via X button or backdrop

### Table

| Column | Content |
|--------|---------|
| Employee | Employee name |
| Meals ordered | Comma-separated meal names; `—` if status is `skipped` |
| Status | Badge — "Ordered" (default variant) / "Skipped" (secondary variant); no badge for `no_record` |

Row styling:
- `ordered` — default row appearance
- `skipped` — default row appearance (conscious choice, no negative signal)
- `no_record` — `bg-destructive/10` row background to flag the gap

Rows sorted alphabetically by `employeeName`.

### i18n

New keys added to `en/meals.json` (or `en/employees.json` — to be decided during implementation) and their Serbian equivalents:

```json
{
  "dailyOverview": {
    "title": "Orders for {{date}}",
    "colEmployee": "Employee",
    "colMeals": "Meals ordered",
    "colStatus": "Status",
    "statusOrdered": "Ordered",
    "statusSkipped": "Skipped",
    "noMeals": "—"
  }
}
```

## Non-Goals

- No write operations — this is a read-only view
- No filtering or sorting controls in the Dialog
- No pagination — employee count per business is expected to be small

## Verification

1. Start dev server
2. Log in as a manager; navigate to Meal Selection Windows
3. Expand a window with at least one date that has a mix of ordered, skipped, and no-record employees
4. Click the icon button next to a date — Dialog opens with correct title
5. Confirm ordered employees appear with meal names and "Ordered" badge
6. Confirm skipped employees appear with `—` and "Skipped" badge, no red highlight
7. Confirm no-record employees appear with red row background
8. Confirm rows are sorted alphabetically
9. Open another date's Dialog — data appears instantly (cached)
10. Confirm manager regression: existing window expand/collapse behaviour unchanged
