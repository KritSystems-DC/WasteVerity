# HealthServe MVP Status

Last refreshed: 2026-05-29

## Current Status

The MVP is locally runnable, seeded with demo data, covered by browser/API smoke tests and has a production deployment checklist. Real owner accounts can be created through `/register`; demo seed accounts should remain local-only.

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

### Verified Locally

- [x] `npm.cmd run test:smoke` passes 14/14 tests.
- [x] `npx.cmd tsc --noEmit` passes.
- [x] `npm.cmd run build` passes.
- [x] Compiled app route checks previously confirmed public/protected route behavior.

### Current Local Setup

- Local app: `http://localhost:3000`
- Demo database: Docker container `healthserve-postgres`
- Local database URL: `postgresql://postgres:postgres@127.0.0.1:5432/healthserve?schema=public`
- Demo owner: `owner@healthserve.demo` / `Password123!`
- Demo staff: `staff@healthserve.demo` / `Password123!`
- Demo admin: `admin@healthserve.demo` / `Password123!`

### Remaining Local App Work

- [ ] Replace Terms and Privacy placeholders with final legal company details and get legal sign-off.
- [ ] Create the first real owner account in production through `/register`; do not run demo seed in production.
- [ ] Run `npm run admin:create` against production when the real admin email/password are available.
- [ ] Complete one end-to-end production billing test in Stripe live mode or a launch-equivalent staging environment.
- [ ] Add team invite/user management for business owners.
- [ ] Add deeper tenant-isolation tests for stock, suppliers, waste, reorder lists and reports.
- [ ] Add API validation tests for stock, suppliers, waste and staff requests.
- [ ] Add audit log filters and business-specific admin views.
- [ ] Add Stripe customer portal flow.
- [ ] Improve notification preferences and provider configuration for email/SMS/WhatsApp.

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

### Verified For Deployment

- [x] `npm.cmd run prisma:status` reports 1 migration and schema up to date.
- [x] `npm.cmd run prisma:deploy` reports no pending migrations.
- [x] Working tree was clean after the latest commit.

### Current Git State

- Local branch: `master`
- Latest known commits:
  - `94aaacd` Refresh MVP status after registration hardening
  - `4258e35` Harden production owner registration
  - `7be7584` Draft public terms and privacy pages
  - `04078f1` Add production Stripe env validation
  - `e0a9075` Complete HealthServe MVP readiness pass

### Remaining Git / Deployment Work

- [ ] Create a remote GitHub/GitLab/Bitbucket repository.
- [ ] Add the remote origin to this local repo.
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
