# StockSense MVP Status

Last refreshed: 2026-05-29

## Current Status

The MVP is locally runnable, seeded with demo data, covered by browser/API smoke tests and has a production deployment checklist. The main remaining work is launch readiness: Stripe live configuration, legal copy review, deeper tenant-isolation coverage and owner-facing team management.

## Completed

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
- [x] Started local PostgreSQL container, applied migrations and seeded demo data.
- [x] Confirmed initial Prisma migration files are present.
- [x] Added production Prisma scripts: `prisma:deploy` and `prisma:status`.
- [x] Added production environment checklist for PostgreSQL, NextAuth, Stripe and deployment checks.
- [x] Added production env template and validation command for required live Stripe values.
- [x] Added smoke-test notes for seeded demo accounts.
- [x] Added focused Playwright tests for protected APIs and role boundaries.

## Verified

- [x] `npm.cmd run prisma:status` reports 1 migration and schema up to date.
- [x] `npm.cmd run prisma:deploy` reports no pending migrations.
- [x] `npm.cmd run test:smoke` passes 13/13 tests.
- [x] `npx.cmd tsc --noEmit` passes.
- [x] `npm.cmd run build` passes.
- [x] Compiled app route checks previously confirmed public/protected route behavior.

## Current Local Setup

- Local app: `http://localhost:3000`
- Demo database: Docker container `stocksense-postgres`
- Local database URL: `postgresql://postgres:postgres@127.0.0.1:5432/stocksense?schema=public`
- Demo owner: `owner@stocksense.demo` / `Password123!`
- Demo staff: `staff@stocksense.demo` / `Password123!`
- Demo admin: `admin@stocksense.demo` / `Password123!`

## Remaining Before Launch

- [ ] Enter real live Stripe values in the deployment platform secrets: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` and `STRIPE_WEBHOOK_SECRET`.
- [ ] Create and test the production Stripe webhook endpoint at `/api/stripe/webhook`.
- [ ] Review public Terms and Privacy copy before handling real business data.
- [ ] Replace demo users/passwords with real production account creation.
- [ ] Confirm production `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `APP_URL` and `DATABASE_URL`.
- [ ] Run `npm run prisma:deploy` against the production database during release.
- [ ] Complete one end-to-end production billing test in Stripe live mode or a launch-equivalent staging environment.

## Next Engineering Priorities

- [ ] Add team invite/user management for business owners.
- [ ] Add deeper tenant-isolation tests for stock, suppliers, waste, reorder lists and reports.
- [ ] Add API validation tests for stock, suppliers, waste and staff requests.
- [ ] Add audit log filters and business-specific admin views.
- [ ] Add Stripe customer portal flow.
- [ ] Improve notification preferences and provider configuration for email/SMS/WhatsApp.

## Later

- [ ] Barcode scanning.
- [ ] Multi-location stock transfer.
- [ ] Supplier order automation.
- [ ] EPOS integration.
- [ ] Recipe/ingredient costing.
- [ ] Mobile app.
- [ ] AI demand forecasting.
