# User Auth Flow: API Docs + Expo Implementation

## Context

`c:\ReactNative\mlf` is the existing Next.js + Prisma + MongoDB backend ("MLF Law Firm Portal"). It already has a **complete, working** user-facing authentication API (mobile + 6-digit PIN, with OTP-based first-time setup and forgot-PIN reset) built for a companion mobile app. That mobile app is a separate sibling repo, `c:\ReactNative\mlf-mobile-fnz` — a fresh Expo Router (SDK 57) scaffold that currently contains only a placeholder screen and no auth code at all.

Two things are needed:
1. **API documentation** for the five user-facing auth capabilities (login, forgot PIN, set PIN, OTP send, OTP verify) — complete request/response detail, admin excluded (admin is not a separate flow; it's just a role on the same `User` model using the same endpoints). Stored under `c:\ReactNative\mlf\docs\` alongside the existing related docs (`mobile-app-build-prompt.md`, `schema-api-reference.md`, `mlf flows/unified_login_flow.md`).
2. **The actual Expo implementation** of that flow in `c:\ReactNative\mlf-mobile-fnz`, wired to the real backend, using the stack already planned for that app: `expo-secure-store` + `@tanstack/react-query` + `zustand` + `zod`.

The backend (`c:\ReactNative\mlf`) is **read-only** for this task except for adding the one new doc file — its auth code is done and working and must not change.

---

## Deliverable A — API documentation: `c:\ReactNative\mlf\docs\user-auth-api.md`

A new, standalone, complete reference (existing docs cover this only partially/narratively). Follow the house style seen in `docs/site-architecture.md` (H1 title, one-line summary, numbered `## Contents` TOC, `---` dividers, tables, a mermaid flow diagram).

Content outline:

1. **Overview** — mobile + PIN auth, first-time OTP setup, forgot-PIN reset. State plainly: no public signup; admin uses the identical endpoints (role is just a field on the returned user).
2. **Response envelope** — success `{ ok: true, data }`, error `{ ok: false, error: { code, message, details? } }`, and the full error-code list (`VALIDATION`, `RATE_LIMITED`, `INVALID_CREDENTIALS`, `PIN_LOCKED`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `SERVER_ERROR`, `DB_UNAVAILABLE`).
3. **Constants** — PIN = 6 digits, OTP = 4 digits, OTP expiry 600s, PIN lockout after 5 failed attempts for 15 minutes.
4. **Endpoint reference**, one section per endpoint, each with: method+path, purpose, request body (field, type, rule), success response (status + example JSON), every error case (status, code, example JSON, when it happens), and endpoint-specific validation/business rules. Cover, in flow order:
   - `POST /api/auth/check-mobile`
   - `POST /api/auth/login`
   - `POST /api/auth/send-otp` (purposes: `setup`, `forgot_pin`)
   - `POST /api/auth/verify-otp`
   - `POST /api/auth/setup-pin` (Set PIN)
   - `POST /api/auth/forgot-pin/reset` (Forgot PIN)
   - `GET /api/auth/me`
   - `POST /api/auth/logout`
   - Note there is no standalone `/forgot-pin` POST route — "Forgot PIN" is the three-call sequence `send-otp{forgot_pin}` → `verify-otp{forgot_pin}` → `forgot-pin/reset`.
5. **`PublicUser` shape** — the exact object returned by login/setup-pin/forgot-pin-reset/me (`unitId`, `mobile`, `roles`, `name?`, `designation?`, `email?`, `address?`, `photoUrl?`, `clientUnitId?`, `permissions`).
6. **End-to-end flow diagram** (mermaid sequence or flowchart) tying all calls together for: existing user, first-time user, forgot-PIN.
7. **Token handling note for native clients** — only `login`, `setup-pin`, `forgot-pin/reset` return `accessToken`; store it and send `Authorization: Bearer <token>` on every subsequent call; web instead relies on an httpOnly cookie (mention both since it's the same endpoints).

Source of truth to pull exact field names/status codes/messages from (already confirmed accurate):
- `c:\ReactNative\mlf\app\api\auth\{check-mobile,login,send-otp,verify-otp,setup-pin,forgot-pin\reset,me,logout}\route.ts`
- `c:\ReactNative\mlf\lib\api\response.ts`, `lib\auth\constants.ts`, `lib\auth\pin-rules.ts`, `lib\validations\auth.schema.ts`, `lib\auth\session.ts` (PublicUser), `lib\auth\login-flow.ts` (AUTH_API map)

---

## Deliverable B — Expo implementation in `c:\ReactNative\mlf-mobile-fnz`

Port the web step machine (`features/auth/components/login-form.tsx` + `phone-step.tsx`/`pin-step.tsx`/`otp-step.tsx`, driven by `lib/auth/login-flow.ts`'s `LoginStep`/`AUTH_API`/`nextStepAfterCheckMobile`) into the Expo app. Confirmed against the actual `login-form.tsx` source: step values are `phone | pin | otp_setup | setup_pin | otp_forgot | reset_pin`; PIN lockout uses a live countdown; OTP verify yields a single-use `otpProofToken` consumed by setup-pin/forgot-pin-reset; weak-PIN rule (`isWeakPin`) blocks all-same-digit and ascending/descending 6-digit sequences plus a fixed blocklist.

### 1. Dependencies
```
npx expo install expo-secure-store
npm install @tanstack/react-query zustand zod
```
`expo-secure-store` needs `expo install` (native module, SDK-pinned); the other three are pure JS. Run `npx expo start -c` after install.

### 2. Folder structure (new files under `src/`)
```
src/core/
  env.ts                       # getApiBaseUrl() — EXPO_PUBLIC_API_BASE_URL, else Platform-aware localhost default
  api/client.ts                # ApiError + request/apiGet/apiPost, envelope unwrap, Bearer attach, 401 auto-clear
  storage/secure-store.ts       # getToken/setToken/deleteToken over expo-secure-store
  query-client.ts               # shared QueryClient

src/features/auth/
  types.ts                      # LoginStep, CheckMobileStatus, OtpPurpose, PublicUser
  constants.ts                  # AUTH_API path map, PIN_LENGTH=6, OTP_LENGTH=4, isWeakPin(), nextStepAfterCheckMobile()
  schemas.ts                    # zod: mobileSchema, pinSchema, otpSchema, per-request schemas
  api.ts                        # typed request/response interfaces + one fetch fn per endpoint
  hooks.ts                      # react-query mutations per endpoint + useLogout()
  store.ts                      # zustand: { user, accessToken, isHydrated, setSession, clearSession, hydrate }
  hooks/use-resend-countdown.ts # port of web's useResendCountdown
  components/
    phone-step.tsx
    pin-step.tsx                # shared: login PIN / set PIN / reset PIN (showConfirm + locked props)
    otp-step.tsx                # shared: setup + forgot_pin (mode prop)
    login-flow.tsx              # step-machine orchestrator (ports login-form.tsx)

src/components/ui/
  primary-button.tsx
  text-field.tsx
  code-input.tsx                # boxed digit input, reused for OTP(4) and PIN(6)

src/app/
  _layout.tsx                   # QueryClientProvider, global.css import (moved here from index.tsx), hydrate() + splash gating
  index.tsx                     # auth gate: isHydrated ? Redirect to (app)/home or (auth)/login : loading view
  (auth)/_layout.tsx            # Stack, headerShown:false
  (auth)/login.tsx              # renders <LoginFlow/>
  (app)/_layout.tsx             # Stack, headerShown:false
  (app)/home.tsx                # placeholder authenticated screen + logout button
```
Move the `import "../../global.css"` line out of `src/app/index.tsx` (current placeholder) into `src/app/_layout.tsx`, since new leaf routes need NativeWind styling too and `index.tsx`'s role changes to a redirect gate.

### 3. Routing approach
One routable screen per side of the auth boundary, **not** one route per `LoginStep`: `(auth)/login.tsx` renders the whole step machine, with step transitions kept as local React state inside `login-flow.tsx` (exactly like the web version), because steps carry sensitive single-use data (`otpProofToken`) that shouldn't round-trip through router params/back-stack. Expo Router itself is used only for the top-level split: `(auth)` vs `(app)` route groups, gated by a single redirect at `src/app/index.tsx` based on zustand's `user`/`isHydrated`.

### 4. API client (`src/core/api/client.ts`, `src/core/env.ts`)
- `getApiBaseUrl()`: `EXPO_PUBLIC_API_BASE_URL` env if set, else `Platform.select` → `10.0.2.2:3000` (Android emulator) / `localhost:3000` (iOS simulator).
- `ApiError extends Error { code, status, details? }`.
- `request<T>(path, { method, body, timeoutMs=15000 })`: attaches stored Bearer token when present, `AbortController` timeout, unwraps `{ok,data}` → returns `data`, throws `ApiError` from `{ok:false,error}` (or a synthesized `NETWORK_ERROR`/timeout).
- On a 401 from any non-`/api/auth/*` call, clears the zustand session via `useAuthStore.getState().clearSession()` (read/write store outside React, no circular import since `store.ts` never imports `client.ts`).

### 5. Auth state (`src/features/auth/store.ts`, `src/core/storage/secure-store.ts`)
Plain zustand (no persist middleware) — token lives only in SecureStore, mirrored in memory:
- `setSession(user, accessToken)` → sets state + `setToken()`.
- `clearSession()` → resets state + `deleteToken()`. Pure local reset; a `useLogout()` hook in `hooks.ts` best-effort calls `POST /logout` then `clearSession()` then navigates to `/(auth)/login`.
- `hydrate()` (called once from `_layout.tsx`): read SecureStore token → if present, call `GET /me` imperatively → `setSession` on success, `deleteToken()`+reset on failure → always set `isHydrated: true` at the end. Gate the native splash screen (`expo-splash-screen`) on this.

### 6. Zod schemas (`src/features/auth/schemas.ts`)
Mirror `lib/validations/auth.schema.ts` + `lib/auth/pin-rules.ts`: `mobileSchema` (10-digit, starts 6–9), `pinSchema` (`^\d{6}$`), `otpSchema` (`^\d{4}$`), ported `isWeakPin()` (same blocklist + ascending/descending check), and per-request schemas (`checkMobileSchema`, `loginSchema`, `sendOtpSchema`, `verifyOtpSchema`, `setupPinSchema`/`forgotPinResetSchema` with a `pin === confirmPin` refine). Client-side validation is UX-only; server remains source of truth.

### 7. React Query layer (`src/features/auth/api.ts`, `hooks.ts`)
One response interface + fetch function per endpoint (`checkMobile`, `login`, `sendOtp`, `verifyOtp`, `setupPin`, `forgotPinReset`, `getMe`, `logout`), matching Deliverable A's documented shapes exactly. `hooks.ts` wraps each in `useMutation`. The boot-time `/me` check stays imperative inside `store.hydrate()`, not a query hook.

### 8. Screens
| Screen | Responsibilities | Mutation(s) |
|---|---|---|
| `login-flow.tsx` | Owns `LoginStep` state, mobile/pin/otp/otpProofToken values, PIN-lockout countdown; orchestrates all handlers (`handleCheckMobile`, `sendOtp`, `handleVerifyOtp`, `handleLogin`, `handleSetupPin`, `handleResetPin`, `handleForgotPin`) 1:1 with `login-form.tsx` | all |
| `phone-step.tsx` | 10-digit mobile entry, client-gated Continue | `checkMobile` |
| `pin-step.tsx` (login mode) | 6-digit PIN entry, "Forgot PIN?" link, lockout banner + live countdown | `login` |
| `otp-step.tsx` | 4-digit OTP entry, resend with countdown, reused for setup/forgot | `verifyOtp`, `sendOtp` (resend) |
| `pin-step.tsx` (`showConfirm`) | PIN + confirm PIN, client-side match + weak-PIN check, reused for set/reset | `setupPin` or `forgotPinReset` |
| `(app)/home.tsx` | Minimal authenticated placeholder — greet by name/mobile, show role/unitId, Logout | `useLogout()` |

`code-input.tsx` is a single shared boxed-digit component (hidden `TextInput` + rendered boxes) for both OTP(4) and PIN(6) — no third-party OTP package needed.

### 9. Error-code → UX mapping
`VALIDATION`→inline field error · `RATE_LIMITED`→inline banner with `retryAfterSec` · `INVALID_CREDENTIALS`→inline PIN error with `attemptsRemaining`, clear PIN field · `PIN_LOCKED`(423)→locked sub-state with live countdown + prominent Forgot-PIN action · `CONFLICT`(setup-pin: already set)→inline error + "start over" link · `NOT_FOUND`→inline, no navigation · `UNAUTHORIZED` on setup-pin/forgot-pin-reset (expired/reused proof token)→inline "verify again" + start-over link · `UNAUTHORIZED` on `/me`/other protected calls→silent `clearSession()` + redirect to login · `SERVER_ERROR`/`DB_UNAVAILABLE`/`NETWORK_ERROR`→generic inline banner. No toast library added; success = navigation to Home.

### 10. Env setup
`c:\ReactNative\mlf-mobile-fnz\.env` (gitignored) + committed `.env.example` with `EXPO_PUBLIC_API_BASE_URL=`. Metro auto-inlines `EXPO_PUBLIC_*`. Restart with `npx expo start -c` after changes. Physical-device testing: set the var to the dev machine's LAN IP.

---

## Verification

1. Backend: `cd c:\ReactNative\mlf && npm run dev` (port 3000; note OTP is a **real SMS** via 2Factor — no dev bypass — so testing paths B/C need a real receivable test mobile number).
2. Mobile: install the 4 new deps, `npx expo start`, run on Android emulator and/or iOS simulator.
3. **Path A (existing user, PIN login):** check-mobile → "pin" → correct PIN → lands on Home; kill/reopen app → should skip straight to Home via SecureStore + `hydrate()` + `/me`.
4. **Path B (first-time user):** check-mobile → "otp_required" → auto send-otp → real OTP → verify → Set-PIN (matching, non-weak PIN) → Home.
5. **Path C (forgot PIN):** from PIN screen, "Forgot PIN?" → send-otp(forgot_pin) → verify → Reset-PIN → Home; confirm old PIN now fails, new PIN works.
6. **Path D (lockout):** 5 wrong PINs → attempts 1–4 show decreasing `attemptsRemaining`; 5th returns 423 with locked banner + countdown; confirm "Forgot PIN" still works while locked.
7. Edge cases: `not_found` mobile shows inline error, no navigation; corrupted/expired token falls back to login gate; airplane mode mid-request shows network-error banner.
8. `git status` in `c:\ReactNative\mlf` should show only the one new `docs/user-auth-api.md` file — no other changes to that repo.
