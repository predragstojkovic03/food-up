# Google OAuth Design

**Date:** 2026-08-26
**Status:** Approved

## Overview

Add Google OAuth login to Food-Up. Employees migrate to Google-only login once they link their account. The manager retains both password and Google login as a fallback. Auto-linking matches an existing identity by Google email on first sign-in — no self-registration, the manager must have created the account first.

---

## 1. Data Model

### Identity entity changes

`passwordHash` becomes nullable. A new `googleId` field (nullable string) is added — this is the stable `sub` Google assigns each user.

**Invariant:** at least one of `passwordHash` or `googleId` must be non-null. Enforced in the constructor; violated state throws a domain error.

**Factory methods:**

- `Identity.createWithPassword(email, hash, type)` — unchanged for all currently existing accounts
- `Identity.createWithGoogle(email, googleId, type)` — `passwordHash` is null, for future accounts created via Google directly
- `Identity.linkGoogle(googleId)` — instance method; adds `googleId`. For employees, also nullifies `passwordHash` (enforces Google-only). For managers, preserves `passwordHash` (keeps both paths open). The application service passes `identity.type` to determine which behaviour to apply.

**`LocalStrategy` guard:** if `passwordHash` is null, return `null` (→ 401). Error message: "This account uses Google login."

### Database

- `password_hash` column: change to nullable
- `google_id` column: add as nullable, unique

---

## 2. Backend Auth Flow

### New env vars

Three new variables added to `EnvironmentVariables`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback   # local
                    https://yourdomain.com/auth/google/callback  # production
```

`WEB_APP_URL` (already exists) is used for the post-callback redirect to the frontend.

### GoogleStrategy

A new Passport strategy (`passport-google-oauth20`). Configured with `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`. Requests scopes `email` and `profile`. On success, passes `{ googleId: profile.id, email: profile.emails[0].value }` to the auth service. The strategy itself does no identity logic.

### `AuthService.findOrLinkGoogleIdentity(googleId, email)`

1. Look up identity by `googleId` → if found, issue session (returning user)
2. If not found, look up by email → if found, call `identity.linkGoogle(googleId)` (clears password for employees, preserves for managers), persist, issue session
3. If no identity matches → throw `UnauthorizedException` (no self-registration)

Session issuance uses the existing `issueSessionForIdentity()` — no changes to token logic.

### New controller endpoints (both `@Public()`)

- `GET /auth/google` — triggers `GoogleStrategy` redirect to Google's login page
- `GET /auth/google/callback` — OAuth code exchange handled by `GoogleStrategy`; on success calls `findOrLinkGoogleIdentity()`, sets the httpOnly refresh cookie (same as current login), then redirects the browser to:
  ```
  {WEB_APP_URL}/auth/callback?token={accessToken}
  ```
  On failure, redirects to:
  ```
  {WEB_APP_URL}/auth/callback?error=google_auth_failed
  ```

### Why redirect instead of JSON

The OAuth callback is a browser navigation, not a fetch. There is no JavaScript waiting for a JSON response — the only way to return control to the SPA is a redirect. The access token travels in the URL query param; the frontend reads it, stores it in memory, and immediately clears it from the URL.

---

## 3. Frontend Changes

### Login page

Add a "Sign in with Google" button. It must be a plain anchor (`<a href="/auth/google">`) or `window.location.href` — not a fetch call — to trigger the full browser navigation the OAuth flow requires.

### New `/auth/callback` route

A transient page (not wrapped in `AuthLayout` or `MainLayout`) that runs on mount:

1. Read `token` from URL query params
2. If present: store in Zustand auth store (same as current login response), call `history.replaceState` to remove the token from the URL, navigate to the main app
3. If `?error=...` is present or `token` is absent: redirect to `/login` and display an error message

The user sees only a brief spinner; this page is never a destination.

### No changes to auth store or HTTP client

Both already operate on in-memory access tokens. The Google flow delivers the token via URL instead of a JSON body; everything downstream is identical.

---

## 4. Account Linking Logic

Linking happens automatically on the first Google sign-in. The server matches by email (`identity` table), which is safe because:

- All employee emails are provisioned by the manager (controlled list)
- Google Workspace verifies ownership of those emails

No explicit "link account" UI is needed. The transition for each employee happens the first time they click "Sign in with Google."

---

## 5. Local Development

Register both redirect URIs in the same Google Cloud Console project:

```
https://yourdomain.com/auth/google/callback    ← production
http://localhost:3000/auth/google/callback     ← local dev
```

Google explicitly permits `http://localhost` URIs for development. Same Client ID and Client Secret are used for both environments; `GOOGLE_CALLBACK_URL` in the local `.env` points to localhost.

---

## 6. Optional Future Hardening

- Validate the `hd` (hosted domain) claim in the Google token to restrict sign-in to the client's Workspace domain (e.g. reject any email not `@theirdomain.com`). Not required for MVP with a single known client.
