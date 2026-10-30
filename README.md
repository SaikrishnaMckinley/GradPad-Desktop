# GradPad Desktop

Next.js client for Grad Pad — same UI as the design repo, backed by **staging** (`https://api-staging.gradpad.io/api/`). No Electron; run in the browser or wrap later (e.g. Tauri) if needed.

**Continuing work / full context:** read [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) (Chris requirements, what’s done, roadmap, gradpad-web references).

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Demo UI** (`NEXT_PUBLIC_DEMO_STATIC_UI=true`, default): browse home, UCLA community, events, and chat with fixtures — no login required.
- **Staging login**: sign in at `/login` with a staging account. Tokens are stored as `gradpad_access_token` in `localStorage` and a cookie for middleware.

## Scripts

| Command        | Description        |
| -------------- | ------------------ |
| `npm run dev`  | Dev server         |
| `npm run build`| Production build   |
| `npm run start`| Production server  |

## Backend

This app does **not** provision AWS or RDS. It only talks to the existing staging API and matches auth patterns from `gradpad-web`.
