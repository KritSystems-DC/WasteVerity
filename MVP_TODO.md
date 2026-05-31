# WasteVerity MVP Status

Last refreshed: 2026-05-31

## Current Status

The MVP is locally runnable, seeded with demo data, covered by browser/API smoke tests and has a production deployment checklist. Real owner accounts can be created through `/register`; demo seed accounts should remain local-only.

The production build now runs Prisma Client generation automatically, Next has been patched to `15.5.18`, and `npm audit` currently reports zero vulnerabilities.

The remaining work is split into two tracks:

- Local app work: product features, tests, legal copy, billing behavior and production account setup inside the app.
- Git / deployment work: repository hygiene, commits, remote Git hosting, deployment environment variables, migrations and release checks.

## Local App Work

### Completed

- [x] Fixed build-blocking JSX issues.
- [x] Added server-side page protection for customer and admin pages.
- [x] Enforced server-side auth and role checks on protected API routes.
- [x] Completed supplier create, update and delete flow.
- [x] Fixed supplier edit form submission after smoke testing found stale-state behavior.
- [x] Completed staff request submit, review and add-to-reorder flow.
- [x] Added billing status API/UI and Stripe checkout/webhook placeholders.
- [x] Wired stock, reorder and waste CSV exports.
- [x] Added waste CSV export and fixed stock CSV escaping.
- [x] Replaced placeholder expiry page with expired/expiring stock view.
- [x] Replaced placeholder waste page with waste record list and record-waste flow.
- [x] Improved reports beyond CSV download with low stock, expiry and waste summaries.
- [x] Replaced placeholder Terms and Privacy pages with launch-review draft copy.
- [x] Hardened `/register` for real owner account creation with validation, business name and clear errors.
- [x] Added controlled `admin:create` operator script for production admin account creation.
- [x] Added smoke coverage for registering a new owner account and logging in.
- [x] Added smoke-test notes for seeded demo accounts.
- [x] Added focused Playwright tests for protected APIs and role boundaries.
- [x] Updated the production build script to run `prisma generate` before `next build`.
- [x] Patched Next.js from `14.0.0` to `15.5.18` and removed the Edge Runtime build warning.
- [x] Resolved npm audit findings with patched Next/PostCSS versions and narrow dependency overrides for `postcss` and `uuid`.
- [x] Added owner team management for listing, creating, role updates and removing business users.
- [x] Added notification preference settings backed by existing business/integration records.
- [x] Added Stripe customer portal session endpoint and billing-page action.
- [x] Added admin business/log filtering and business-detail users/recent logs.
- [x] Tightened supplier and stock tenant-boundary checks.
- [x] Added smoke/API coverage for validation failures, tenant isolation, team management, notification preferences and Stripe portal config handling.

### Verified Locally

- [x] `npm.cmd run test:smoke` passes 14/14 tests.
- [x] `npx.cmd tsc --noEmit` passes.
- [x] `npm.cmd run build` passes on Next `15.5.18`.
- [x] `npm.cmd audit --json` reports 0 vulnerabilities.
- [x] Compiled app route checks previously confirmed public/protected route behavior.
- [ ] `npm.cmd run test:smoke` is blocked in this shell because Docker is unavailable and PostgreSQL is not reachable at `127.0.0.1:5432`.

### Current Local Setup

- Local app: `http://localhost:3000`
- Demo database: Docker container `wasteverity-postgres`
- Local database URL: `postgresql://postgres:postgres@127.0.0.1:5432/wasteverity?schema=public`
- Demo owner: `owner@wasteverity.demo` / `Password123!`
- Demo staff: `staff@wasteverity.demo` / `Password123!`
- Demo admin: `admin@wasteverity.demo` / `Password123!`

### Remaining Local App Work

- [ ] Replace Terms and Privacy placeholders with final legal company details and get legal sign-off.
- [ ] Create the first real owner account in production through `/register`; do not run demo seed in production.
- [ ] Run `npm run admin:create` against production when the real admin email/password are available.
- [ ] Complete one end-to-end production billing test in Stripe live mode or a launch-equivalent staging environment.
- [ ] Re-run `npm.cmd run test:smoke` once local PostgreSQL is running and seeded.
- [ ] Add deeper report-specific tenant-isolation tests once the local test database is available.

## Git / Deployment Work

### Completed

- [x] Initialized local Git repository.
- [x] Added `.gitignore` for env files, dependencies, builds and test artifacts.
- [x] Created initial MVP readiness commit.
- [x] Committed production Stripe env validation work.
- [x] Committed public Terms and Privacy draft work.
- [x] Committed production owner registration hardening.
- [x] Confirmed initial Prisma migration files are present.
- [x] Added production Prisma scripts: `prisma:deploy` and `prisma:status`.
- [x] Added production environment checklist for PostgreSQL, NextAuth, Stripe and deployment checks.
- [x] Added production env template and validation command for required live Stripe values.
- [x] Ignored local Vercel project metadata with `.vercel` in `.gitignore`.

### Verified For Deployment

- [x] `npm.cmd run prisma:status` reports 1 migration and schema up to date.
- [x] `npm.cmd run prisma:deploy` reports no pending migrations.
- [x] Working tree was clean after the latest committed readiness pass.

### Current Git State

- Local branch: `master`
- Current working tree: uncommitted dependency, security, checklist and repo-side feature-completion changes are present.
- Latest known commits:
  - `94aaacd` Refresh MVP status after registration hardening
  - `4258e35` Harden production owner registration
  - `7be7584` Draft public terms and privacy pages
  - `04078f1` Add production Stripe env validation
  - `e0a9075` Complete WasteVerity MVP readiness pass

### Remaining Git / Deployment Work

- [ ] Create a remote GitHub/GitLab/Bitbucket repository.
- [ ] Add the remote origin to this local repo.
- [ ] Commit the dependency/security/build and repo-side feature-completion updates.
- [ ] Push `master` to the remote repository.
- [ ] Enter real live Stripe values in the deployment platform secrets: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` and `STRIPE_WEBHOOK_SECRET`.
- [ ] Create and test the production Stripe webhook endpoint at `/api/stripe/webhook`.
- [ ] Confirm production `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `APP_URL` and `DATABASE_URL`.
- [ ] Run `npm run env:check` in the production or staging environment.
- [ ] Run `npm run prisma:deploy` against the production database during release.
- [ ] Deploy from the remote Git repository or the chosen hosting platform.
- [ ] Confirm deployment route checks for `/`, `/login`, `/register`, `/dashboard`, `/billing`, `/terms`, `/privacy` and `/api/auth/providers`.

## Later

- [ ] Barcode scanning.
- [ ] Multi-location stock transfer.
- [ ] Supplier order automation.
- [ ] EPOS integration.
- [ ] Recipe/ingredient costing.
- [ ] Mobile app.
- [ ] AI demand forecasting.
