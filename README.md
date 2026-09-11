# The Dreamers 🚀

Company-wise LeetCode previous-year questions with progress tracking, a "Daily Suvichar"
board, and a full admin panel. Built with **Next.js 16 (App Router)**, **MongoDB (Mongoose)**,
**Clerk** (Google auth), **Tailwind CSS v4**, **Framer Motion**, and **Recharts**.

Data is sourced from
[krishnadey30/LeetCode-Questions-CompanyWise](https://github.com/krishnadey30/LeetCode-Questions-CompanyWise)
(537 CSVs · ~200 companies).

## Features

- **Company-wise question sets** with difficulty / frequency sorting and a timeframe switcher.
- **Interactive tables** — search, filter, sort, mark solved, bookmark, open on LeetCode.
- **Global explore** across all companies + a **daily challenge**.
- **Compare** two companies to find the overlap of problems they both ask.
- **Dashboard** — solved count, difficulty breakdown, revision (bookmark) list, per-question notes.
- **Daily Suvichar** — public motivational board you post to from the admin panel.
- **About Me** with social links.
- **Admin panel** (email allowlist) — CRUD for companies, questions, thoughts, and profile.
- Cinematic **intro animation** with a synthesized launch sound (mute toggle), a **custom animated cursor**,
  aurora background, dark/light theme, and full responsiveness.

## Setup

1. **Install deps**
   ```bash
   npm install
   ```

2. **Environment** — copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` — a free [MongoDB Atlas](https://www.mongodb.com/atlas) M0 cluster connection string.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from your [Clerk](https://clerk.com) app.
     In the Clerk dashboard, enable **Google** as a social connection.
   - `ADMIN_EMAILS` — comma-separated allowlist (already set to `jatinengineervlogs@gmail.com`).

3. **Seed the database** (imports every company + question; idempotent, safe to re-run):
   ```bash
   npm run seed
   # quick test with a few companies:
   SEED_LIMIT=5 npm run seed
   ```

4. **Run**
   ```bash
   npm run dev        # http://localhost:3000
   ```

## Deploy (Vercel, free tier)

1. Push to GitHub and import the repo in Vercel.
2. Add the same env vars in **Project → Settings → Environment Variables**.
3. Deploy. Then run `npm run seed` once locally (or from a machine) pointed at the same `MONGODB_URI`.
4. In Clerk, add your production domain to the allowed origins.

## Project structure

- `src/app` — pages (landing, companies, questions, compare, suvichar, about, dashboard, admin) and API routes.
- `src/components` — UI (navbar, intro, cursor, question table, charts, admin panels).
- `src/models` — Mongoose models (Company, Question, UserProgress, Thought, Profile).
- `src/lib` — `db.ts`, `auth.ts` (admin allowlist), `data.ts` (queries), `sound.ts`, `utils.ts`.
- `scripts/seed.ts` — GitHub → MongoDB importer.
- `src/proxy.ts` — Clerk middleware protecting `/dashboard`, `/admin`, and mutation APIs.
