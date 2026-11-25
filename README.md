# The Dreamers

Company-wise LeetCode previous-year questions with progress tracking, a daily question and streak,
a daily Suvichar, and an admin panel. Built with **Next.js 16 (App Router)**, **MongoDB (Mongoose)**,
custom **email/password + Google auth** (bcrypt + signed session cookies via `jose`), **Tailwind CSS v4**
and **Framer Motion**.

## Features

- **Company-wise question sets** with an all-time / 2 years / 1 year / 6 months switcher, a level split and
  the questions each company asks most often.
- **Question lists** with search (by title or problem number), level and status filters, sorting by frequency,
  acceptance, level or title, ticks, a revision list, and a **Random unsolved** pick.
- **Questions across every company**: every problem once, most widely asked first. Open one to see
  **which companies ask it**, how often, and whether it appears in their recent (6 month / 1 year / 2 year) lists.
- **Daily question** for everyone, with your **streak** (solve at least one question a day).
- **Compare** two companies: the overlap as a share of each list, the shared questions with your ticks,
  and each company's own list.
- **Dashboard**: solved count by level, current and longest streak, this week's solves, a 40-week
  **activity heatmap**, the companies where you have solved most, and the revision list, solved list and notes.
- **Command palette**: `⌘K` / `Ctrl+K` or `/` from anywhere to jump to a company, a question or a page.
- **Daily Suvichar**, **About** with social links, **Admin panel** (email allowlist) for companies,
  questions, thoughts, users and the profile.
- Dark and light themes, full responsiveness, reduced-motion support.

Sign-in is required for Companies, Questions, Compare and the Dashboard. Home, About and Suvichar are public.

## Design

The look is documented in [DESIGN.md](DESIGN.md): graphite and safety orange, Onest and JetBrains Mono,
sharp corners, and a quiet panel (one step off the page, in your theme) behind product pictures. The
motion lives in the product pictures themselves: rows that tick off, a search that types, lists that link.

## Rate limits

Every API route is rate limited (`src/lib/rate-limit.ts`). Counters live in MongoDB, so every server
instance shares them, and expire on their own (TTL index). Subjects are stored as keyed hashes, never as
raw emails or IPs. Over a limit, a route answers `429` with `Retry-After`.

| Route | Limit |
|---|---|
| Sign in | 10 per email and 100 per IP, per 15 minutes |
| Sign up | 30 per IP per hour |
| Email code: verify | 10 per email and 100 per IP, per 10 minutes |
| Email code: resend | 30 per IP per hour (plus the per-account cooldown) |
| Google sign-in start and callback | 120 per IP per 10 minutes each |
| Search, question details | 90 and 120 per account per minute |
| Progress: read, write | 60 and 120 per account per minute |
| Admin | 300 per admin per minute |

Signed-in routes count per account, so many students behind one campus IP never share a budget.
Change the numbers in `RULES`. For page-level flood protection, add a rate limiting rule in the Vercel Firewall.

## Setup

1. **Install deps** (Node.js 20.9 or later)
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
  sign-in, sign-up) and API routes (`/api/auth/*`, `/api/progress`, `/api/questions/[id]`, `/api/search`, `/api/admin/*`).
- `src/components` — UI: `site/` (header, footer, command palette), `home/` (the home page's product pictures),
  `explore/` (questions page and drawer), `fx/` (liquid type, loop ticker), `ui/` (shared pieces),
  the question table, company charts, dashboard and admin panels.
- `src/models` — Mongoose models (User, Company, Question, UserProgress, Thought, Profile).
- `src/lib` — `db.ts`, `session.ts` (JWT cookie), `auth.ts` (guards + admin allowlist),
  `data.ts` (queries), `progress-store.ts` (shared ticks on the client), `streak.ts`, `rate-limit.ts`, `utils.ts`.
- `scripts/seed.ts` — GitHub → MongoDB importer.

Auth is enforced per-route via `requireUser()` / `requireAdmin()` in each protected page and
API handler (no middleware).

## Credits

- Product-UI fragment styles: [taste-skill](https://github.com/leonxlnx/taste-skill), MIT (see `THIRD_PARTY_NOTICES.md`).
- Icons: [Lucide](https://lucide.dev) (ISC); social marks from [Simple Icons](https://simpleicons.org) (CC0).
- Question data: [LeetCode-Questions-CompanyWise](https://github.com/krishnadey30/LeetCode-Questions-CompanyWise).
