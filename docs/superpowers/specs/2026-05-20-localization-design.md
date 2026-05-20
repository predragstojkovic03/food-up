# Localization Feature Design

**Date:** 2026-05-20
**Status:** Approved

## Overview

Add language/localization support to Food-Up. Users can set their UI language. Outbound emails and Excel exports use language settings derived from the relevant entity context, not from the request. Serbian and English are the supported languages at launch.

---

## Data Model

### New shared enum

```typescript
// shared/src/enums/language.enum.ts
export enum Language {
  En = 'en',
  Sr = 'sr',
}
```

Added to the shared package so both frontend and backend reference the same values.

### `UserPreferences` — add `language: Language`

Non-nullable. Server-side default is `Language.En` when the record is first created on registration. Immediately after registration completes, the frontend detects the browser locale, maps it to a supported `Language` value (falling back to `En` if unsupported), and calls `PATCH /user-preferences { language }` to persist the real preference. From that point the server always has a concrete value.

This field governs:
- The user's UI language
- The language of employee notification emails (looked up via `employee.identityId`)

### `Supplier` — add `language: Language`

Non-nullable, default `Language.En`. Set by the manager when creating or editing a **managed** supplier. Governs the language of outbound emails sent to that managed supplier.

Not used for standalone suppliers (see `BusinessSupplier` below).

### `BusinessSupplier` — add `language: Language`

Non-nullable, default `Language.En`. Set by the manager when enrolling or editing a **standalone** supplier relationship. Governs the language of outbound emails sent to that standalone supplier in the context of this business.

Standalone suppliers can be engaged by multiple businesses; each business independently sets the communication language via this field.

### `Business` — add `language: Language`

Non-nullable, default `Language.En`. Set by the manager in the new Business Settings page. Governs the language of Excel export column headers and sheet labels.

---

## Language Resolution Summary

| Context | Source field | Set by |
|---|---|---|
| UI rendering | `userPreferences.language` | User (auto-seeded from browser on registration) |
| Employee notification emails | `userPreferences.language` via `employee.identityId` | User |
| Managed supplier emails | `supplier.language` | Manager |
| Standalone supplier emails | `businessSupplier.language` | Manager |
| Excel exports | `business.language` | Manager |

---

## Domain Service: `SuppliersDomainService`

The resolution of supplier email language varies by supplier type. Rather than branching on `supplier.type` throughout the codebase, a domain service encapsulates this rule. It is stateless, takes already-loaded domain objects, and has no infrastructure dependencies.

```typescript
// suppliers/domain/suppliers.domain-service.ts
class SuppliersDomainService {
  resolveEmailLanguage(supplier: Supplier & { type: SupplierType.Managed }): Language;
  resolveEmailLanguage(supplier: Supplier & { type: SupplierType.Standalone }, businessSupplier: BusinessSupplier): Language;
  resolveEmailLanguage(supplier: Supplier, businessSupplier?: BusinessSupplier): Language {
    if (supplier.isManaged()) return supplier.language;
    return businessSupplier!.language;
  }
}
```

The overload signatures enforce at compile time that a `BusinessSupplier` is required when a standalone supplier is passed — no non-null assertion escapes to the caller. The implementation body uses `supplier.isManaged()` rather than comparing `supplier.type` directly, keeping the type check behind the domain entity's own interface.

The application service fetches the `BusinessSupplier` when needed and passes it in. No other layer branches on supplier type for language resolution.

**Why a domain service and not application layer:** The branching rule is a domain concern — it reflects how the domain models the managed-vs-standalone ownership distinction. It spans two aggregate concepts (`Supplier` and `BusinessSupplier`) so it doesn't belong on either entity alone.

**Why not normalize managed suppliers into `BusinessSupplier`:** `BusinessSupplier` represents a bilateral partnership (standalone supplier ↔ business). `managing_business_id` represents ownership (business created and owns this supplier). These are semantically different relationships. Merging them would conflate partner and owner and require a discriminator flag, which is not cleaner.

---

## Frontend i18n

### Library

`i18next` + `react-i18next` + `i18next-browser-languagedetector`. Initialized in `apps/web/src/i18n/i18n.ts` before the React tree mounts. Supported languages: `['en', 'sr']`, fallback: `'en'`.

### Translation file structure

```
apps/web/src/i18n/
├── i18n.ts
├── en/
│   ├── common.json      # nav, buttons, status labels, errors
│   ├── auth.json
│   ├── meals.json
│   ├── suppliers.json
│   ├── reports.json
│   └── preferences.json
└── sr/
    └── (mirrors en/)
```

### Typed translation keys

i18next's `CustomTypeOptions` is configured so that calling `t('nonexistent.key')` is a TypeScript compile error. All translation keys are validated at compile time.

### Language initialization on registration

After a user registers, the frontend detects the browser locale via `i18next-browser-languagedetector`, maps it to `Language.En` or `Language.Sr`, and immediately calls `PATCH /user-preferences { language }`. This happens once, at registration time, ensuring the server always has a real language stored rather than an `En` default that may not reflect the user's actual locale.

### Language selector UI

A two-option select ("English" / "Srpski") added to the existing appearance settings section on the account page alongside the theme toggle. Selecting a language calls `i18n.changeLanguage()` and `PATCH /user-preferences { language }` in the same handler.

---

## Backend Translation Module

### Location

```
apps/server/src/shared/i18n/
├── i18n.helper.ts        # t() function
└── translations/
    ├── en.ts
    └── sr.ts
```

### Translation files

Plain TypeScript objects with namespaced keys:

```typescript
// en.ts
export default {
  mail: {
    mealWindow: {
      subject: 'Your meal selection window is open',
      body: '...',
    },
    changeRequest: {
      subject: '...',
      body: '...',
    },
  },
  excel: {
    columns: {
      employeeName: 'Employee',
      meal: 'Meal',
      mealType: 'Meal type',
    },
  },
}
```

Both `en.ts` and `sr.ts` must have the same shape; TypeScript enforces this via a shared type.

### `t()` function — callback selector pattern

```typescript
function t(selector: (tr: typeof en) => string, language: Language): string {
  const tr = language === Language.Sr ? sr : en;
  return selector(tr);
}
```

The callback approach gives full type safety without recursive template literal types. The TypeScript compiler validates the path at compile time. Usage:

```typescript
t(k => k.mail.mealWindow.subject, employee.preferences.language)
t(k => k.excel.columns.employeeName, business.language)
```

No class, no NestJS module, no injection — a pure importable function.

---

## Manager-facing UI Surfaces

### New Business Settings page

Route: `/employee/manager/business`

Added to the manager sidebar navigation. Contains the business language selector ("English" / "Srpski") as its initial content. Introduces the `businesses` presentation layer on the frontend — the backend `businesses` feature already exists but has no frontend pages.

### Supplier forms

`language` is added as a required select field to:
- Managed supplier creation form
- Standalone supplier edit form (within the business-supplier relationship context)

The form does not distinguish between the two storage locations (`supplier.language` vs `businessSupplier.language`) — the backend resolves this transparently.

---

## Architecture Constraints

- Meals are user-generated and are **not translated**.
- Language is never inferred from the HTTP request context on the server — it always comes from a stored entity field.
- The `Language` enum lives in `shared/` and is the single source of truth for both client and server.
- Adding a new language in the future requires: adding the enum value, adding translation files in `apps/web/src/i18n/`, and adding a translation object in `apps/server/src/shared/i18n/translations/`. No architectural changes needed.
