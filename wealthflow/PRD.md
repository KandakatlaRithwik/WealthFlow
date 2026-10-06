# WealthFlow — Product Requirements Document (Phase 1)

## Problem
Most personal finance apps track transactions but don't build behavior. Users
know what they spent but don't build the habits (saving daily, reviewing
budgets weekly, investing monthly) that actually change their trajectory.

## Objective
Combine transaction tracking, habit formation, goal tracking, and net-worth
visibility into one connected product, so that logging a transaction updates
every dependent view (dashboard totals, category charts, savings rate,
insights, reports) automatically.

## Users
- **User:** manages their own financial data, habits, goals, assets.
- **Admin:** manages platform users and reviews feedback/complaints; never
  sees another user's financial figures directly, only aggregate stats.

## Core user journey
Register → onboarding (income/goal/currency) → Dashboard → log income/expense
→ create + complete habits → create goal + contribute → add assets/liabilities
→ view wealth analytics & insights → export report.

## Success criteria (Phase 1 acceptance)
See the checklist in the original spec, section 60. This build satisfies the
authentication, transaction, habit+streak, goal, wealth/net-worth, dashboard,
and admin items with real (not mocked) calculations. Notification delivery,
PDF export, and habit-reminder scheduling are scaffolded for Phase 2.

## Explicitly out of scope for Phase 1
Bank integration, trading execution, payment processing, AI financial
advisor, guaranteed-return claims.
