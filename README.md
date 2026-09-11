# The Dreamers 🚀

Company-wise LeetCode previous-year questions with progress tracking, a "Daily Suvichar"
board, and a full admin panel. Built with **Next.js 16 (App Router)**, **MongoDB (Mongoose)**,
custom **email/password auth** (bcrypt + signed session cookies via `jose`), **Tailwind CSS v4**,
**Framer Motion**, and **Recharts**.


## Features

- **Email/password accounts** stored in MongoDB (passwords bcrypt-hashed, JWT session cookie).
- **Company-wise question sets** with difficulty / frequency sorting and a timeframe switcher.
- **Interactive tables** — search, filter, sort, mark solved, bookmark, open on LeetCode.
- **Global explore** across all companies + a **daily challenge**.
- **Compare** two companies to find the overlap of problems they both ask.
- **Dashboard** — solved count, difficulty breakdown, revision (bookmark) list, per-question notes.
- **Daily Suvichar** — public motivational board you post to from the admin panel.
- **About Me** with social links (Google Drive image links auto-convert to direct URLs).
- **Admin panel** (email allowlist) — CRUD for companies, questions, thoughts, and profile.
- Custom animated cursor, aurora background, dark/light theme, and full responsiveness.

Sign-in is required for Companies, Explore, and Compare. Home, About, and Suvichar are public.

## Setup

1. **Install deps**
   ```bash
   npm install
   ```

2. **Environment** — copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` — a free [MongoDB Atlas](https://www.mongodb.com/atlas) M0 cluster connection string.
   - `AUTH_SECRET` — any long random string. Generate one with:
     `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
   - `ADMIN_EMAILS` — comma-separated allowlist (accounts with these emails see `/admin`).

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
   Sign up, then to get admin access sign up with an email listed in `ADMIN_EMAILS`.

## Deploy (Vercel, free tier)

1. Push to GitHub and import the repo in Vercel.
2. Add the same env vars in **Project → Settings → Environment Variables**
   (`MONGODB_URI`, `AUTH_SECRET`, `ADMIN_EMAILS`).
3. Deploy. The database is already seeded in Atlas, so no re-seed is needed
   (run `npm run seed` again only if you want to refresh data).

## Project structure

- `src/app` — pages (landing, companies, questions, compare, suvichar, about, dashboard, admin,
  sign-in, sign-up) and API routes (`/api/auth/*`, `/api/progress`, `/api/admin/*`).
- `src/components` — UI (navbar, auth form/provider, cursor, question table, charts, admin panels).
- `src/models` — Mongoose models (User, Company, Question, UserProgress, Thought, Profile).
- `src/lib` — `db.ts`, `session.ts` (JWT cookie), `auth.ts` (guards + admin allowlist),
  `data.ts` (queries), `utils.ts`.
- `scripts/seed.ts` — GitHub → MongoDB importer.

Auth is enforced per-route via `requireUser()` / `requireAdmin()` in each protected page and
API handler (no middleware).
