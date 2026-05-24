# Extra Quantities for Non-Employee Guests

**Date:** 2026-05-24
**Status:** Approved for implementation

---

## Context

Managers occasionally need to order meals for non-employee guests or visitors who are not registered on the platform. These extra quantities must be:
- Ordered from the correct supplier (tied to a specific menu item)
- Included in the supplier emails and XLSX exports (merged into totals, no separate labelling)
- Optionally attributed to a named guest — named guests appear as individual rows in XLSX per-day sheets; anonymous extras appear only in summary totals
- Factored into an estimated cost summary shown in the window detail panel

---

## Data Model

One new entity: `ExtraQuantity`

| Field | Type | Notes |
|---|---|---|
| `id` | ULID string | Primary key |
| `windowId` | string | FK → meal_selection_window |
| `menuItemId` | string | FK → menu_item |
| `quantity` | number | ≥ 1 |
| `guestName` | string \| null | Optional; drives day-sheet behaviour |

Date and supplier are derived at query time from the menu item — no denormalization needed.

---

## Backend

### Domain layer
- **`extra-quantity.entity.ts`** — `ExtraQuantity` domain entity with `create(windowId, menuItemId, quantity, guestName)` and `reconstitute()`. No domain events.
- **`extra-quantities.repository.interface.ts`** — `I_EXTRA_QUANTITIES_REPOSITORY` symbol + interface:
  ```ts
  insert(entity: ExtraQuantity): Promise<void>
  findByWindow(windowId: string): Promise<ExtraQuantity[]>
  remove(id: string): Promise<void>
  ```

### Infrastructure layer
- **`extra-quantity.typeorm-entity.ts`** — columns: `id`, `windowId`, `menuItemId`, `quantity`, `guestName` (varchar nullable). `ORM_SYNC` adds the table automatically in dev.
- **`extra-quantities-typeorm.repository.ts`** — standard implementation respecting `TransactionContext`.

### Application layer
- **`ExtraQuantitiesService`** — thin service with `add`, `remove`, `findByWindow`. Wired into the module.
- **`OrderSummaryQueryTypeOrmRepository` additions:**
  - **`_queryExtras(windowId, supplierId?)`** — fourth aggregation source; joins `extra_quantity → menu_item → meal → menu_period → supplier`. Returns the same `RawRow` shape as the other three sources.
  - `getByWindow` and `getByWindowAndSupplier` call `_queryExtras` alongside the existing three and pass results through `_aggregate()`. No change to the aggregated output shape — extras are silently merged into totals.
  - **`_queryNamedGuestExtras(windowId)`** — returns `EmployeeDaySelectionRow[]` for extras where `guestName IS NOT NULL`. The `employeeName` field contains the guest name. Called from `getEmployeeSelections` and appended to the result before sorting.
- **`ReportsService` addition:**
  - **`getCostSummary(windowId)`** — new query method on `IOrderSummaryQueryRepository`: `getCostByWindow(windowId): Promise<{ supplierId: string; supplierName: string; totalCost: number }[]>`. Computes `SUM(mi.price * effective_quantity)` across all four sources (unaffected + modified + late + extras) using a UNION query. Items with `price IS NULL` are excluded. Service method maps to `IWindowCostSummary[]`.

### Presentation layer
- **`ExtraQuantitiesController`** (`/extra-quantities`):

  | Method | Path | Description |
  |---|---|---|
  | `POST` | `/extra-quantities` | Add a row |
  | `DELETE` | `/extra-quantities/:id` | Remove a row |
  | `GET` | `/extra-quantities` | `?windowId=` → list all for window |

- **`ReportsController` addition:**
  - `GET /reports/cost-summary?windowId=` → `IWindowCostSummary[]`

- **DTOs:**
  - `CreateExtraQuantityDto` — `windowId`, `menuItemId`, `quantity` (`@IsInt @Min(1)`), `guestName` (optional string)
  - `ExtraQuantityResponseDto` — `@Expose()` on all fields
  - `WindowCostSummaryResponseDto` — `supplierId`, `supplierName`, `totalCost`

---

## Shared interfaces (`shared/src/interfaces/`)

```ts
export interface IExtraQuantity {
  id: string;
  windowId: string;
  menuItemId: string;
  quantity: number;
  guestName: string | null;
}

export interface IWindowCostSummary {
  supplierId: string;
  supplierName: string;
  totalCost: number;
}
```

---

## Frontend

### Service layer
- **`IExtraQuantityService`** interface:
  ```ts
  getByWindow(windowId: string): Promise<IExtraQuantity[]>;
  add(data: { windowId: string; menuItemId: string; quantity: number; guestName?: string }): Promise<IExtraQuantity>;
  remove(id: string): Promise<void>;
  ```
- **`ExtraQuantityService`** HTTP implementation (`POST /api/extra-quantities`, `DELETE /api/extra-quantities/:id`, `GET /api/extra-quantities?windowId=`).
- Wired into `service-container.ts` and `app-providers.tsx`.

### `IReportService` addition
```ts
getCostSummary(windowId: string): Promise<IWindowCostSummary[]>;
```
Calls `GET /api/reports/cost-summary?windowId=`.

### `WindowDetails` component additions
Two new React Query entries:
```ts
['extra-quantities', windowId]  →  extraQuantityService.getByWindow(windowId)
['reports', 'cost-summary', windowId]  →  reportService.getCostSummary(windowId)
```
Both shown only when `isExpired` (same condition as the send panel).

### New components (co-located in `meal-selection-windows.page.tsx`)

**`ExtraQuantitiesSection`**

- Renders saved rows as read-only: `guestName | mealName — supplierName · date | qty | × remove`
- Rows with `guestName` show the name; rows without show an em dash
- "+ Add row" reveals an inline form at the bottom:
  - Guest name `<input>` (optional)
  - Date `<select>` — options from `window.targetDates`
  - Meal `<select>` — options from `menuItems.filter(i => i.day === selectedDate)`, displayed as `meal.name — supplierName`
  - Qty `<input type="number" min="1">`
  - "Save" (`POST`) and "Cancel" buttons
- On save: invalidates `['extra-quantities', windowId]` and `['reports', 'cost-summary', windowId]`
- On remove: `DELETE`, same invalidations
- Hint text: *"Named guests appear as individual rows in XLSX day sheets. Anonymous extras are counted in summary totals only."*

**`CostSummarySection`**

- Per-supplier rows: `supplierName | totalCost (formatted as locale currency)`
- Grand total row (bold)
- Disclaimer: *"Items without a price are excluded from this estimate."*
- Hidden when `costSummary` array is empty (no priced items)

---

## XLSX behaviour

- **Summary (supplier) sheets** — extras merged into totals transparently. No change to existing sheet format.
- **Day sheets** — named guest extras appear as additional rows (same columns as employee rows: name | soup | meal | bread | dessert). Anonymous extras do not appear in day sheets.

---

## Email behaviour

Extras are merged into supplier totals in `getByWindowAndSupplier`. The email table shows higher quantities with no distinction. No change to email format.

---

## i18n

All new UI strings go through the existing `react-i18next` system. The window detail page uses `useTranslation('meals')`, so new keys live under `windows.detail` in `apps/web/src/i18n/en/meals.json` and `apps/web/src/i18n/sr/meals.json`.

Generic action words (`cancel`, `save`) already exist in `common.json` — reuse them. No backend i18n changes are needed (guest names are user-supplied data, not translated strings).

### New keys in `windows.detail`

**`extras` namespace:**

| Key | English | Serbian |
|---|---|---|
| `extras.title` | Additional quantities | Dodatne količine |
| `extras.subtitle` | guests / visitors | gosti / posetioci |
| `extras.guestNameHeader` | Guest name | Ime gosta |
| `extras.guestNameOptional` | optional | opciono |
| `extras.mealHeader` | Meal | Obrok |
| `extras.qtyHeader` | Qty | Kol. |
| `extras.addRow` | + Add row | + Dodaj red |
| `extras.newRowTitle` | New row | Novi red |
| `extras.dateLabel` | Date | Datum |
| `extras.mealLabel` | Meal | Obrok |
| `extras.mealFilteredHint` | (filtered to {{date}}) | (filtrirano na {{date}}) |
| `extras.qtyLabel` | Qty | Kol. |
| `extras.guestNamePlaceholder` | e.g. Ana Marković | npr. Ana Marković |
| `extras.saveRow` | Save row | Sačuvaj red |
| `extras.hint` | Named guests appear as individual rows in XLSX day sheets. Anonymous extras are counted in summary totals only. | Imenovani gosti pojavljuju se kao pojedinačni redovi u dnevnim listovima XLSX-a. Anonimni dodaci broje se samo u zbiru. |

**`costSummary` namespace:**

| Key | English | Serbian |
|---|---|---|
| `costSummary.title` | Estimated cost | Procena troškova |
| `costSummary.subtitle` | employee selections + additional quantities | izbori zaposlenih + dodatne količine |
| `costSummary.total` | Total | Ukupno |
| `costSummary.disclaimer` | Items without a price are excluded from this estimate. | Stavke bez cene nisu uključene u ovu procenu. |

---

## Verification

1. Run `npm run start:dev`.
2. Open an expired window → "Additional quantities" section is visible below the XLSX download button.
3. Add an anonymous extra (no name): verify it increases the quantity in the supplier email preview and XLSX summary sheet; verify it does NOT appear in the day sheet.
4. Add a named extra: verify it appears as an individual row in the XLSX day sheet for the correct date; verify the quantity is also reflected in the summary sheet total.
5. Check the cost summary: add/remove extras and confirm the per-supplier and grand total update correctly.
6. Items with no price: verify they're excluded from the cost total with the disclaimer shown.
7. Send an email after adding extras: verify the supplier receives the correct (merged) quantities.
