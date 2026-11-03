# English Tracker

A mobile-first PWA for running a structured English study routine: a fixed weekly plan, a daily Anki streak, vocabulary and grammar tracking, a writing log, weekly reflections and periodic level tests. Built for my own study plan and used daily on phone and laptop.

**Stack:** React 18 · TypeScript · Vite · TanStack Query · Supabase (Postgres, Auth, Row Level Security) · vite-plugin-pwa · Vitest · GitHub Actions + GitHub Pages

## Features

- **Today view:** the day's task comes from the weekly plan, with a step checklist, resource links and two daily checks (Anki review + main study). Streaks skip Sundays (rest day) instead of breaking on them.
- **Resources:** books, podcasts, channels and apps with status (queued / active / done), skills and progress. Active ones show up on the Today view.
- **Vocabulary in three groups:** new, known-but-not-used, comfortable. The middle group is the focus.
- **Grammar board:** each topic is 🔴 / 🟡 / 🟢. Writing mistakes that repeat twice automatically create a 🟡 topic, or pull a 🟢 topic back to 🟡.
- **Writing log** for weekly Write & Improve levels and error tags.
- **Level tests:** British Council + EF SET scores side by side with deltas and the next retest window (6 to 8 weeks).
- **Anki export:** pending phrases and words as a tab-separated file Anki imports directly (`File > Import`).
- **Installable PWA**, synced across devices through Supabase. Full JSON backup from Settings.

## Architecture notes

- `src/lib/` holds framework-free domain logic (plan, streaks, Anki export, error promotion, dates) and is unit tested with Vitest.
- `src/api/hooks.ts` wraps Supabase in three generic hooks, `useRows`, `useSave` and `useRemove`, typed by table name. Writes are optimistic (TanStack Query `onMutate`) and roll back on error.
- Client-generated UUIDs let optimistic inserts render immediately with a stable key.
- All tables use RLS with a single `user_id = auth.uid()` policy; `user_id` defaults to `auth.uid()`.
- `HashRouter` + Supabase PKCE auth flow: GitHub Pages has no SPA rewrites, and PKCE returns `?code=` in the query string so it never collides with `#/routes`.
- Dates are stored as local calendar days (`YYYY-MM-DD`), never UTC, so a late-night check-in lands on the right day.

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and run it.
3. **Authentication > URL Configuration:** set **Site URL** to your deployed URL (for example `https://<user>.github.io/english-tracker/`) and add `http://localhost:5173/` under **Redirect URLs** for local development.
4. **Project Settings > API:** copy the **Project URL** and the **anon public** key.

### 2. Run locally

```bash
cp .env.example .env   # fill in the two values from step 1.4
npm install
npm run dev            # http://localhost:5173
npm test
```

### 3. Deploy to GitHub Pages

1. Push this repo to GitHub (branch `main`).
2. **Settings > Secrets and variables > Actions:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. **Settings > Pages > Source:** select **GitHub Actions**.
4. Every push to `main` runs typecheck, tests and build, then deploys to `https://<user>.github.io/<repo>/`.

The anon key is designed to be public: data access is enforced by RLS in the database, not by hiding the key.

## Project structure

```
src/
  api/          Supabase client + generic data hooks
  auth/         Session context, password recovery
  components/   Layout, shared UI, modals
  lib/          Domain logic + unit tests
  pages/        One file per tab
supabase/migrations/  Schema and RLS policies
```
