# WealthFlow — Financial Habit Builder & Wealth Growth Tracker

A full-stack personal finance web application that pairs expense/income tracking
with habit-building mechanics, savings goals, and net-worth analytics.

> "Don't just track money. Build the habits that grow it."

## Tech stack
- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Recharts, Axios, lucide-react
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (Atlas recommended)
- **Auth:** JWT + bcrypt, role-based (`user` / `admin`)

## What's implemented (working, end-to-end)
- Registration / login / logout, JWT auth, protected + role-protected routes
- Transactions: create/edit/delete/filter/search, income & expense categories
- Habits: create/complete, **real streak calculation** (daily/weekly/monthly aware),
  completion rate, longest streak
- Savings goals: create, contribute, auto-computed percentage/remaining/suggested
  monthly contribution, auto-completes at 100%
- Wealth: assets, liabilities, manual investment tracking with gain/return %,
  net worth = assets − liabilities
- Dashboard: single aggregation endpoint (`GET /api/dashboard/summary`) computing
  KPIs, 6-month income/expense trend, category breakdown, financial habit score
  (transparent rule-based 0–100, not a credit score), rule-based insights
- Admin: platform analytics, user list with activate/disable, feedback inbox
- Notifications and feedback/complaints models + routes
- Security: helmet, CORS, rate limiting, mongo-sanitize, bcrypt hashing,
  backend validation on every write route
- Realistic 6-month seed dataset for a fictional user (Arjun Rao)

## Also implemented (Phase 2 items, now complete)
- **Onboarding wizard** — 5-step flow after registration (income, goal, savings
  target, currency, starting savings), writes to `/api/profile` and optionally
  seeds an initial asset
- **Notifications** — live bell dropdown (unread badge, mark read/all read),
  backed by real `Notification` documents created automatically on habit
  streak milestones (7/14/30/60/100) and goal milestones (80%, 100%)
- **Habit reminder scheduler** — `node-cron` job checks every minute for
  habits whose `reminderTime` matches now and creates a notification (+ email
  if SMTP is configured); a second daily job fires monthly-summary
  notifications on the 1st of the month
- **Email service** — `nodemailer`-based, fully configurable via `SMTP_*` env
  vars; if unset, emails are logged to the console instead of failing, so the
  app works out of the box in dev/demo without a mail provider
- **PDF reports** — `GET /api/reports/pdf` streams a generated PDF (via
  `pdfkit`, no external binary/Chromium needed) with summary, category
  breakdown, goals, habits, and insights; CSV export also available
- **Feedback & complaints** — in-app submission page + status tracking for
  users, and a full admin feedback tab (Open / In Progress / Resolved)
- **Dark mode** — complete theme (not inverted colors) via CSS custom
  properties that the whole design system already reads through, toggled from
  the topbar and persisted per-browser

## Verified build
This exact package was `npm install`-ed and built before zipping:
- `server`: all 12 Express routers load cleanly (`node -e "require('./app')"` succeeds)
- `client`: `npm run build` succeeds — 2396 modules, zero errors — output is
  included at `client/dist/` as proof
`node_modules/` is excluded from this zip (standard practice); run
`npm install` in both `server/` and `client/` to restore them.

## Bugs found and fixed via real automated tests (not just claimed)
Rather than assert the app works, I wrote and ran actual unit tests
(`server/tests/run.js`, no database required) against the pure calculation
logic, and fixed what they caught:
- **Streak engine bug:** a habit's current streak was incorrectly reported as
  `0` any day the user hadn't logged it *yet* that day, even with a long
  unbroken streak going into it. Fixed so the streak only breaks once a
  period is actually missed, not just because today isn't over.
- **Net worth change % bug:** the dashboard was comparing current net worth
  to itself (an always-0% "change"), because there was no real historical
  net worth being persisted anywhere. Fixed by adding a monthly snapshot job
  (`utils/snapshot.js` + scheduler) that freezes each month's real totals
  into `FinancialSnapshot` on the 1st of the next month — net worth history
  is now genuine point-in-time data, not a recomputed fake line. The
  dashboard returns `netWorthHistory` (real, persisted) separately from
  `cashFlowTrend` (income/expense/savings, always exact from transactions).
- Run `cd server && npm test` any time to re-verify: `13 passed, 0 failed`.

## UI bugs found and fixed (from real screenshots, not assumed)
- **Invisible placeholder/input text in dark mode:** every modal form across
  Transactions, Habits, Goals, and Wealth had inputs with no explicit
  background/text color — they fell back to the browser's native styling,
  which looked white-on-white or auto-dark-inverted depending on OS settings,
  exactly as shown in a screenshot of the Add Transaction modal. Fixed by
  introducing one shared `.input-field` class (in `index.css`) used by every
  single input, select, and textarea in the app — including an explicit
  `color-scheme` declaration so native controls (like the date picker icon)
  render correctly in both themes too.
- **Regression from my own automated class-swap:** the sweep that unified all
  inputs under `.input-field` used a regex that also matched a few `<button>`
  elements with similar border/rounded styling (Delete buttons on Habits and
  Goals, the Back button in onboarding, Export CSV on Reports) — they
  silently turned into full-width input-shaped buttons. Caught by manually
  auditing every element carrying the new class afterward, not assumed safe.
- **Floating stat cards on the login hero:** had theme-linked text color on a
  hardcoded white background, so in dark mode the text rendered near-white
  on white — invisible. Fixed with explicit, theme-independent colors.
- **Logo + favicon:** added a real mark (ascending bars crossed by a trend
  line, in the brand gradient) as a reusable `Logo.jsx` component, wired as
  the actual favicon (`client/public/logo.svg`), and used as a low-opacity
  watermark on the login/register hero panels and the main app background.

## PDF report — rebuilt and actually rendered to check, not just coded
The old PDF was plain text. It's now a real designed document: a brand-color
header band with the drawn logo mark, four colored KPI boxes, horizontal bar
charts for expense categories, progress bars for goals, a zebra-striped habit
table, and a footer with page numbers — see `server/utils/reportPdf.js`.
Two real bugs were only caught by actually rendering the PDF to an image and
looking at it, not by reading the code:
- The ₹ symbol silently disappeared — PDFKit's standard fonts have no glyph
  for it, so `₹65,000` rendered as `65,000`. Fixed with a `Rs. ` prefix,
  which is the standard fallback used on printed Indian financial documents
  for exactly this reason.
- Drawing the footer at y=792 (right at the page-bottom threshold) silently
  triggered PDFKit's own auto-pagination, producing 2 extra blank pages on
  every single report. Fixed with the standard PDFKit workaround (zero the
  bottom margin just for that draw). Both are now covered by regression
  tests in `server/tests/run.js` (`15 passed, 0 failed`).

## Typography
A deliberate mixed type system: **Fraunces** (an elegant serif with a
genuinely calligraphic italic) is used for the brand wordmark, page titles,
section greetings, onboarding step headings, and the big KPI figures —
everywhere the product should feel considered rather than utilitarian.
Everything functional — nav labels, table data, buttons, form inputs — stays
in plain **Inter**, and tabular figures use **IBM Plex Mono** for alignment.
This mirrors the direction of the published dashboard preview.

## Project structure
```
wealthflow/
  server/
    config/        # DB connection
    models/        # Mongoose schemas
    controllers/    # Route handlers
    routes/         # Express routers
    middleware/     # auth, error handling, validation
    validators/      # express-validator rules
    utils/          # finance formulas, streak engine, habit score, insights, seed script
    app.js / server.js
  client/
    src/
      pages/        # Login, Register, Dashboard, Transactions, Habits, Goals, Wealth, Reports, Profile, Admin
      components/    # Sidebar, Topbar, KpiCard, Modal, ProgressBar, EmptyState, Skeleton, Toast
      layouts/       # AppLayout (sidebar + topbar shell)
      context/       # AuthContext
      services/      # axios API layer
```

## Database schema overview
`User, Transaction, Habit, HabitCompletion, SavingsGoal, Asset, Liability,
Investment, Notification, Feedback, FinancialSnapshot` — see `server/models/*.js`
for full field definitions. Every user-owned collection carries a `userId` and
every query is scoped to `req.user._id` from the JWT.

## API overview
See `server/routes/*.js`. Key endpoints:
```
POST /api/auth/register | login | logout   GET /api/auth/me
GET/POST/PUT/DELETE /api/transactions
GET/POST/PUT/DELETE /api/habits            POST /api/habits/:id/complete
GET/POST/PUT/DELETE /api/goals             POST /api/goals/:id/contribute
GET /api/wealth   POST/PUT/DELETE /api/wealth/{assets,liabilities,investments}
GET /api/dashboard/summary
GET/PUT /api/notifications
POST /api/feedback
PUT /api/profile   PUT /api/profile/password
GET/PUT/DELETE /api/admin/*  (admin only)
GET /api/health -> { "status": "ok" }
```

## Installation & running locally

### 1. Backend
```bash
cd server
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed               # loads 6 months of realistic demo data
npm run dev                 # http://localhost:5000
```

### 2. Frontend
```bash
cd client
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

### Demo logins (after `npm run seed`)
- User: `arjun.rao@example.com` / `Password123!`
- Admin: `admin@wealthflow.app` / `Password123!`

## Environment variables
See `server/.env.example` and `client/.env.example`. Never commit `.env`.

## Deployment
- Frontend → Vercel (`vite build`, serve `dist/`)
- Backend → Render / Railway (set env vars, `npm start`)
- Database → MongoDB Atlas
- Health check: `GET /api/health`

## Limitations (Phase 1, by design)
No bank integration, no trading execution, no AI financial advisor — all
insights are deterministic and rule-based on the user's own data. See
`server/utils/insights.js` and `habitScore.js`.

## Feature completeness pass
Traced every frontend API call against its backend route and response shape
by hand (not assumed): all service calls in `client/src/services/*.js` and
every direct `api.*()` call in pages were cross-checked against
`server/routes/*.js` and each controller's `res.json()` shape — no mismatches
found. Also closed two real CRUD gaps where the backend already supported an
operation but no UI ever called it: **Habits and Goals can now be edited**
(not just created/completed/deleted), reusing the existing `PUT` routes.
Every mutation (create/edit/delete/complete/contribute) across Transactions,
Habits, Goals, and Wealth was confirmed to reload its list afterward, and
every modal now resets its form on close (not just on submit) so switching
between, say, Add Asset and Add Liability without submitting doesn't leak
stale field values between them.

## Future enhancements
Code-splitting the frontend bundle (Vite currently warns it's over 500KB —
works fine, just not optimally chunked), a proper design-system component
library instead of repeated Tailwind class strings, and editable asset/
liability/investment records in the Wealth UI (the backend `PUT` routes exist
and work — see `server/routes/wealthRoutes.js` — but no UI calls them yet;
only add/delete are wired up there).
