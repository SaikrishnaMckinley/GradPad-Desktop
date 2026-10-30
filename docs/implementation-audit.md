# GradPad — Implementation Audit

**Last updated:** 2026-03-16  
**Supabase:** Connected (`.env.local`)

---

## Feature 1: Authentication & user profiles

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Signup | **Verified (client → Supabase Auth)** | `SignupForm` uses `signUpWithEmail()` → `supabase.auth.signUp()`; password **not** sent to `POST /signup` Server Action |
| Login | **Verified (client → Supabase Auth)** | `LoginForm` uses `signInWithEmail()` |
| Logout | **Verified** | `SignOutButton` → `signOutClient()` + `router.refresh()` |
| Session after refresh | **Verified (design)** | `@supabase/ssr` cookies via middleware `updateSession` |
| Protected routes | **Verified** | `src/middleware.ts` redirects unauthenticated users |
| Session expiration UX | **Verified** | Stale auth cookie → `/login?session=expired` |
| Password reset request | **Verified (client)** | `ForgotPasswordForm` → `resetPasswordForEmail` |
| Password update (logged in / after reset) | **Verified (client)** | `/settings/account` → `updatePassword()` |
| Profile on signup | **Verified (DB trigger)** | `handle_new_user` in initial migration |
| Profile viewing | **Verified** | `/profile/[username]` loads from `profiles` |
| Profile editing | **Verified** | `/settings/profile` server action `updateProfile` (RLS: own row only) |
| Avatar upload | **Blocked (config)** | Code in `AvatarUpload.tsx`; **`avatars` bucket not on project yet** — run `supabase/migrations/20260316120000_storage_avatars.sql` |
| Loading / error / success states | **Implemented** | Auth forms + profile settings + toasts for avatar |

### Auth tests run (2026-03-16)

| Test | Result |
|------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `profiles` table reachable | Pass (prior check) |
| Live `signUp` API | **Rate limited** (`email rate limit exceeded`) after repeated attempts — wait ~1 min or use Supabase dashboard to adjust auth rate limits |
| `listBuckets` (anon) | Empty — storage migration not applied |

### Password in Network tab

- **Before:** Server Actions posted `_1_password` in `POST http://localhost:3000/signup` (visible in DevTools).
- **After:** Signup/login use the **browser Supabase client**; credentials go to `https://<project>.supabase.co/auth/v1/...` over HTTPS.
- **Note:** Any password login will still appear in **your own** DevTools on the Supabase request. That is expected; it is not sent through the Next.js app server.

---

## Other features (unchanged)

| Feature | Status |
|---------|--------|
| App shell / UI | Complete (static fixtures in sidebar/feed) |
| Communities & membership | Static UI only |
| Channels | Static UI only |
| Posts & engagement | Static UI only |
| Events & RSVP | Static UI only |
| Chat | Static UI only |
| Connections | Static UI only |
| Notifications | Missing route |
| Global search | Missing |
| Community admin | Missing |

---

## Next feature (after Feature 1 sign-off)

**Communities & memberships** — replace `dev-shell-data.ts` with Supabase queries and join flows.

---

## User action required

1. Run **`20260316120000_storage_avatars.sql`** in Supabase SQL Editor (for avatar upload).
2. Wait out **auth rate limits** or lower limits in Supabase Auth settings before retrying signup.
3. Confirm **Redirect URLs**: `http://localhost:3000/auth/callback`.
