# StockSense Production Checklist

Use this before deploying a live StockSense instance.

## Environment

- [ ] Set `NODE_ENV=production` in the hosting platform.
- [ ] Set `APP_URL` to the public HTTPS app URL, for example `https://app.example.com`.
- [ ] Set `NEXTAUTH_URL` to the same public HTTPS app URL.
- [ ] Set `NEXTAUTH_SECRET` to a long random secret generated for production only.
- [ ] Do not reuse `.env`, `.env.local`, demo credentials, or local Docker database values in production.

Recommended secret generation:

```bash
openssl rand -base64 32
```

## PostgreSQL and Prisma

- [ ] Provision a managed PostgreSQL database with backups, point-in-time restore and TLS enabled.
- [ ] Set `DATABASE_URL` to the production database connection string.
- [ ] Confirm the database user has the permissions needed for migrations and runtime reads/writes.
- [ ] Run Prisma generation during build or release:

```bash
npm run prisma:generate
```

- [ ] Apply committed migrations during deployment:

```bash
npm run prisma:deploy
```

- [ ] Confirm migration status before and after deploy when possible:

```bash
npm run prisma:status
```

- [ ] Confirm `prisma/migrations/20260529101105_init/migration.sql` and `prisma/migrations/migration_lock.toml` are included in the deployed artifact or source checkout.
- [ ] Do not run `npm run prisma:migrate` or `prisma migrate dev` against production.
- [ ] Do not run `npm run seed` against production unless you intentionally want demo data and demo users.
- [ ] Replace or disable seeded demo accounts before launch:
  - `owner@stocksense.demo`
  - `staff@stocksense.demo`
  - `admin@stocksense.demo`

## Authentication

- [ ] Confirm `NEXTAUTH_SECRET` is set before starting the app.
- [ ] Confirm `NEXTAUTH_URL` exactly matches the deployed origin, including `https://`.
- [ ] Test login, logout and protected route redirects after deployment.
- [ ] Create real owner/admin users for the production business.
- [ ] Remove demo passwords from any public launch instructions.
- [ ] Review password policy and account recovery before onboarding real customers.

## Stripe

- [ ] Create Stripe products and recurring prices for the live plans.
- [ ] Set `STRIPE_SECRET_KEY` to a live secret key.
- [ ] Set `STRIPE_PRICE_ID` to the live recurring price used by checkout.
- [ ] Set `STRIPE_WEBHOOK_SECRET` to the live webhook signing secret.
- [ ] Confirm production env vars are present:

```bash
npm run env:check
```

- [ ] Configure a Stripe webhook endpoint:

```text
https://your-production-domain.com/api/stripe/webhook
```

- [ ] Subscribe the webhook to these events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] If the frontend starts using Stripe.js, set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to the live publishable key.
- [ ] Complete a live-mode test subscription before opening billing to customers.
- [ ] Verify failed, cancelled and past-due subscription states update in `/admin/subscriptions`.

## Email and Notifications

- [ ] Set `EMAIL_FROM` to a verified sender domain.
- [ ] Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and `SMTP_PASS` if email notifications are enabled.
- [ ] Replace placeholder SMS/WhatsApp variables with real provider configuration before enabling those workflows.
- [ ] Confirm notification failures are logged and do not block stock actions.

## Security and Tenant Boundaries

- [ ] Run the browser/API test suite before release:

```bash
npm run test:smoke
```

- [ ] Confirm staff, owner and admin role boundaries on protected pages and APIs.
- [ ] Confirm admin users cannot read or mutate customer business-context APIs.
- [ ] Confirm business users cannot access another business's stock, suppliers, waste, reorder lists or reports.
- [ ] Review public Terms and Privacy copy before handling real business data.
- [ ] Confirm production logs do not include passwords, session tokens, Stripe secrets or full payment details.

## Build and Release

- [ ] Install dependencies from the lockfile:

```bash
npm ci
```

- [ ] Run type checks:

```bash
npx tsc --noEmit
```

- [ ] Build the app:

```bash
npm run build
```

- [ ] Start with the production server command required by the host, typically:

```bash
npm run start
```

- [ ] Verify these routes after deployment:
  - `/`
  - `/login`
  - `/dashboard`
  - `/stock`
  - `/suppliers`
  - `/billing`
  - `/admin`
  - `/api/auth/providers`
  - `/api/billing/status`

## Operational Checks

- [ ] Enable database backups and document restore steps.
- [ ] Enable host-level error monitoring and uptime checks.
- [ ] Configure alerts for failed deployments, high 5xx rates and database connectivity failures.
- [ ] Confirm CSV exports work for stock, reorder and waste reports.
- [ ] Confirm Stripe webhook delivery is healthy in the Stripe dashboard.
- [ ] Keep a rollback path for app deploys and database migrations.
