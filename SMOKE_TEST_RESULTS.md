# Smoke Test Results

Date: 2026-05-31

## Completed

- `npx.cmd tsc --noEmit` passed.
- `npm.cmd run build` passed.
- `npm.cmd run start -- -p 3011` started successfully.
- Local Docker PostgreSQL container `wasteverity-postgres` was reachable on `127.0.0.1:5432`.
- `npx.cmd prisma migrate dev --name init` reported the database was already in sync.
- `npm.cmd run seed` completed and created the demo owner, staff and admin accounts.
- `npx.cmd prisma generate` passed after restarting the stale dev server that held the Prisma DLL.
- `npm.cmd run test:smoke` passed: 9 tests, 9 passed.
- Fixed a supplier edit form stale-state issue found by the smoke suite, then reran the full suite successfully.
- Added focused API boundary coverage for anonymous redirects, admin-only APIs, admin business-context blocking and staff supplier mutation blocking.
- `npm.cmd run test:smoke` passed after API coverage was added: 13 tests, 13 passed.
- Reports now render low stock, expiry and waste summaries in addition to CSV exports; smoke coverage checks those sections.
- Public/protected route checks against the compiled server:
  - `/` returned `200`
  - `/login` returned `200`
  - `/pricing` returned `200`
  - `/dashboard` returned `307`
  - `/admin` returned `307`
  - `/api/auth/providers` returned `200`
- Patched Next.js to `15.5.18` and confirmed `npm.cmd run build` passes without the previous Edge Runtime warning.
- `npm.cmd audit --json` reports 0 vulnerabilities after Next/PostCSS updates and dependency overrides.
- Added smoke/API coverage for team management, notification preferences, Stripe portal config handling, validation failures and tenant isolation.
- Installed local PostgreSQL 16, migrated and seeded the `wasteverity` database.
- `npm.cmd run test:smoke` passed with the local PostgreSQL service: 18 tests, 18 passed.

## Current Local Setup

The repo now has a local `.env` for the PostgreSQL-backed demo database:

```text
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/wasteverity?schema=public
```

The dev server is started by Playwright when running `npm.cmd run test:smoke`.

## Remaining Gaps

- Stripe checkout still needs real `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` and `STRIPE_WEBHOOK_SECRET`.
- Public Terms and Privacy copy still needs final company details and legal sign-off.
- Continue expanding report-specific tenant isolation edge cases.
