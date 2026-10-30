# GradPad-Desktop — project context (handoff)

Use this doc when continuing work in **this repo** (Cursor chat, new agents, teammates). It summarizes decisions from the **GRAD PAD** design repo work and **Chris’s staging directive**.

---

## Product goal

Ship the **new Grad Pad UI** (copied from `/Users/saikrishna/Desktop/GRAD PAD `) as a **Next.js app** that talks to **the same backend as the web app** — **no Electron**, no new AWS infra for desktop.

| Repo | Role |
|------|------|
| **GradPad-Desktop** (this repo) | Staging API client + new UI |
| **GRAD PAD** | Design/demo experiments (Supabase + static demo UI); not the desktop source of truth |
| **gradpad-web** | Reference for **how to call staging API** (auth, axios, paths) |
| **gradpad-api** | Django REST backend; **only place to add new REST routes** if the UI needs them |

---

## Chris / team requirements (Oct 2026)

**Desktop must use existing staging — same database and auth as web.**

- **Do:** Point app at `https://api-staging.gradpad.io/api/`
- **Do:** Same JWT flow as web (`gradpad_access_token`, `gradpad_refresh_token`, `Authorization: Bearer …`, header `Accept: application/json; version=v1`)
- **Don’t:** New Cognito, RDS, SES, or Supabase for desktop
- **Don’t:** Ship RDS passwords, Secrets Manager, or direct Postgres in the app

**AWS CLI / Secrets Manager** (`dev/credentials/staging`, assume role `GradPadDeveloper`, secret `GradPadRDSStagingPostgresIn-…`) is for **developers** working on **gradpad-api** or debugging — **not** embedded in GradPad-Desktop.

**Staging metadata (dev reference only, not app env):**

- API: `https://api-staging.gradpad.io/api/`
- DB name: `gradpad_staging` (API only)
- Uploads bucket: `gradpad-staging-uploads` (via API, not direct S3 keys in client)
- Region: `us-east-1`

---

## Architecture

```
GradPad-Desktop (Next.js)
    → HTTPS → api-staging.gradpad.io (gradpad-api)
                    → gradpad_staging (RDS)
```

- **No separate “desktop API”** in this repo — only HTTP client modules under `src/lib/api/`.
- If an endpoint is missing, add it in **gradpad-api**, mirroring what **gradpad-web** already uses.

**Shell:** Next.js in browser for now; optional **Tauri** later. **Electron was explicitly rejected.**

---

## Environment (runtime)

```env
NEXT_PUBLIC_API_BASE_URL=https://api-staging.gradpad.io/api/
NEXT_PUBLIC_DEMO_STATIC_UI=true   # false when live API lists are wired
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Copy from `.env.example` → `.env.local`.

---

## What is already implemented in this repo

- UI ported from GRAD PAD (layout, home, communities demo, events, chat fixtures, Montserrat, sidebars, etc.)
- `src/lib/api/config.ts`, `server-fetch.ts` (server reads + 401 refresh), `/api/auth/*` BFF routes (browser does not call staging for auth)
- Auth: login/logout/signup/OTP/password via `/api/auth/*`; `token-storage.ts` (localStorage + cookie for middleware); refresh token in httpOnly cookie for server refresh
- Live shell (when `NEXT_PUBLIC_DEMO_STATIC_UI=false`): `community/list/` + `channels/joined/` on the server via `api-sidebar.ts`
- Middleware: demo skips auth; when demo off, requires `gradpad_access_token` cookie
- Session shell: `get-api-session-profile.ts` → `users/detail/`
- Auth pages no longer gated on Supabase
- `npm run build` succeeds
- README with setup commands

---

## What is NOT done yet (priority order)

### Phase 1 — Auth parity with gradpad-web

- Done in desktop: BFF routes + server `auth/token/refresh/` on 401; signup OTP + verify/resend; password reset + change
- Remaining: reset confirm page if linking from email; QA against staging

### Phase 2 — Real data when `NEXT_PUBLIC_DEMO_STATIC_UI=false`

Sidebar shell wired to **`community/list/`** + **`channels/joined/`** (server). Pages still use **fixtures** or **Supabase** in places.

| Feature | API (gradpad-api) | Web reference |
|---------|-------------------|---------------|
| My communities / sidebar | `community/list/`, `channels/joined/` | `api/communities.ts`, `api/channels.ts` |
| Discover | `communities/all/` | `api/communities.ts` |
| Community detail | `communities/<uuid>/…` | `api/communities.ts` |
| Home / posts | groups, posts | `api/post.ts`, `api/groups.ts` |
| Events | `events/…` | `api/events.ts` |
| Chat | `chat/…` | `api/chat.ts` |
| Profile | `users/detail/`, `users/<id>/details/` | `api/profile.ts` |

**Slug vs UUID:** Demo UI uses slugs (e.g. UCLA); API uses **community UUIDs**. Need mapping (API slug field if present, or cookie/context like web).

### Phase 3 — Cleanup

- Remove Supabase deps and `src/lib/supabase/*` when API paths cover features
- Remove or gate demo fixtures
- Organize `src/lib/api/` by domain (auth, communities, events, chat) like `gradpad-web/api/*.ts`

### Phase 4 — Ship

- Push to GitHub (repo was empty except `.git` at start)
- Team runbook: staging login QA
- Optional deploy (Vercel) with only public API URL in env

---

## Key file paths (this repo)

| Area | Path |
|------|------|
| API base | `src/lib/api/config.ts`, `http.ts` |
| Client auth | `src/lib/auth/client-auth.ts`, `token-storage.ts` |
| Server session | `src/lib/auth/get-api-session-profile.ts`, `get-session-profile.ts` |
| Middleware | `src/middleware.ts` |
| Demo mode | `src/lib/demo-mode.ts`, `src/lib/fixtures/*` |
| Shell layout | `src/components/layout/PlatformShell.tsx`, `AppShell.tsx` |
| Login UI | `src/components/auth/LoginForm.tsx`, `src/app/(auth)/login/page.tsx` |

---

## gradpad-web auth pattern (mirror this)

- Login POST `auth/login/` with email/password → store `access` / `refresh` (shape may vary; desktop extracts `access`, `refresh`, `key`, or `tokens.access`)
- localStorage: `gradpad_access_token`, `gradpad_refresh_token`
- Desktop also sets cookie `gradpad_access_token` for Next middleware
- Authenticated requests: `Authorization: Bearer <token>`

---

## Suggested reply to Chris (unchanged)

> Desktop uses **staging API only** (`https://api-staging.gradpad.io/api/`), same auth/data as web. No new AWS infra. RDS secrets are for API/dev only, not bundled in the app.

---

## Continuing in Cursor

1. Open folder: `/Users/saikrishna/Desktop/GradPad-Desktop`
2. Point the agent at this file: `docs/PROJECT_CONTEXT.md`
3. Example prompts:
   - “Phase 1: add token refresh like gradpad-web”
   - “Wire communities/user/ for sidebar with demo off”
   - “Remove Supabase from communities queries and use staging API”

**Do not** rebuild backend in this repo or add Electron unless the team explicitly changes direction.
