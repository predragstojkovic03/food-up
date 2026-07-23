# Password Input UX — Design Spec

**Date:** 2026-07-23
**Scope:** Registration forms (employee + supplier) and login page

---

## Problem

Registration forms have no confirm password field, so users cannot catch typos before submitting. No password field in the app has a show/hide toggle, forcing users to type blind.

---

## Solution Overview

1. Install shadcn's `input-group` component for composing inputs with inline addons.
2. Create a shared `PasswordInput` component (`src/components/ui/password-input.tsx`) that wraps `InputGroupInput` + `InputGroupAddon` with an Eye/EyeOff toggle. It manages its own visibility state and is a drop-in replacement for `<Input type="password">`.
3. Add a `confirmPassword` field to both registration schemas with a cross-field match validation.
4. Add i18n strings for the new label and error message (EN + SR).

---

## Component: `PasswordInput`

**Location:** `src/components/ui/password-input.tsx`

**API:** Accepts all standard HTML input props (no extra required props). Compatible with React Hook Form's `field` spread. Renders `InputGroupInput` + `InputGroupAddon align="inline-end"` with a toggle button showing `Eye` or `EyeOff` from `lucide-react`. Manages `showPassword` state internally.

**Usage:**
```tsx
<PasswordInput placeholder="••••••••" {...field} />
```

---

## Schema Changes (`register.page.tsx`)

Both `employeeSchema` and `supplierSchema` gain a `confirmPassword` field and a `.refine()` check:

```ts
const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

Same pattern for `supplierSchema`. Type inference updated accordingly. `defaultValues` includes `confirmPassword: ''`.

---

## Form Changes

**`EmployeeRegisterForm` and `SupplierRegisterForm`:**
- Swap `<Input type="password">` → `<PasswordInput>` on the existing password field.
- Add a new `FormField` for `confirmPassword` immediately after the password field, also using `<PasswordInput>`.

**`LoginPage`:**
- Swap `<Input type="password">` → `<PasswordInput>` on the password field. No schema changes needed.

---

## i18n Changes

**`en/auth.json`** — add under `register.fields`:
```json
"confirmPassword": "Confirm password"
```

**`sr/auth.json`** — add under `register.fields`:
```json
"confirmPassword": "Potvrdite lozinku"
```

The `.refine()` error message is a hardcoded English string (`'Passwords do not match'`), consistent with how all other Zod messages are handled in the codebase (they are not routed through `t()`). `FormMessage` renders it directly.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/ui/password-input.tsx` | New component |
| `apps/web/src/features/auth/presentation/pages/register.page.tsx` | Schemas + confirmPassword fields + PasswordInput swap |
| `apps/web/src/features/auth/presentation/pages/login.page.tsx` | PasswordInput swap |
| `apps/web/src/i18n/en/auth.json` | New strings |
| `apps/web/src/i18n/sr/auth.json` | New strings |

---

## Out of Scope

- Password strength meter
- Any other password fields outside of auth (none exist currently)
