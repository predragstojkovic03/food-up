# @food-up/shared

Shared TypeScript enums and interfaces consumed by both `apps/server` and `apps/web`. This package has no framework dependencies and contains no business logic — only type contracts.

---

## Contents

### Enums

| Enum | Values |
|---|---|
| `ChangeRequestStatus` | `Pending`, `Approved`, `Rejected` |
| `EmployeeRole` | `Manager`, `Employee` |
| `IdentityType` | `Employee`, `Supplier` |
| `MealType` | `Breakfast`, `Lunch`, `Dinner`, `Bread` (and others) |
| `SupplierType` | Supplier category values |

### Interfaces

Request/response contracts shared between client and server:

`IAuthResponse`, `IBusinessInviteResponse`, `IChangeRequestResponse`, `IEmployeeResponse`, `IMealSelectionResponse`, `IMealSelectionWindowResponse`, `IMealResponse`, `IMenuItemResponse`, `IMenuPeriodResponse`, `IReportItemResponse`, `IReportsResponse`, `ISupplierResponse`

---

## Usage

Import directly from the package name in both apps:

```typescript
import { EmployeeRole, MealType, IEmployeeResponse } from '@food-up/shared';
```

The package is an npm workspace and resolves automatically — no install step needed.

---

## Adding New Types

1. Add the type to `src/enums/` or `src/interfaces/`
2. Re-export it from the relevant `index.ts` barrel file
3. Re-build (or re-watch) the package so the change is picked up:

```bash
# One-time build
npm run build:shared

# Or watch mode (use during active development)
npm run watch:shared
```

Changes take effect immediately for the server (TypeScript path alias). The web app's Vite dev server hot-reloads on the rebuilt output.

---

## What NOT to Add

- No classes (use plain interfaces or type aliases)
- No decorators (`@IsString()`, `@ApiProperty()`, etc.) — those belong in the app that uses them
- No business logic or utility functions
- No framework imports (NestJS, React, TypeORM, etc.)

If something is only used by one app, keep it in that app.
