# WasteVerity

WasteVerity is a healthcare food service operations platform for care homes, hospitals, and regulated kitchens. It helps teams manage inventory, HACCP-ready compliance records, waste, suppliers, staff requests, reorder lists, and operational reporting from one place.

## Product Positioning

WasteVerity is built for food service teams that need to prove compliance, reduce avoidable waste, and control purchasing without relying on scattered spreadsheets or paper logs.

Core outcomes:
- Reduce food waste by tracking item, quantity, reason, and cost.
- Keep compliance records ready for CQC, FSA, and internal audits.
- Track stock levels, expiry dates, reorder thresholds, and supplier costs.
- Give staff a structured way to request missing or low-stock items.
- Export reports for management, finance, procurement, and inspection preparation.

Target users:
- Care home catering teams
- Hospital food service teams
- Healthcare operations managers
- Regulated kitchens in prisons, military, and institutional settings
- Multi-site operators that need consistent food service controls

## Tech Stack

- Next.js with TypeScript
- Tailwind CSS
- Prisma and PostgreSQL
- NextAuth credentials authentication for demo and MVP workflows
- Stripe checkout and webhook placeholders for billing
- Playwright smoke tests

## What This Repo Contains

- Public WasteVerity landing pages and pricing/features pages
- Authenticated dashboard, inventory, supplier, reorder, waste, expiry, reporting, staff request, billing, and admin pages
- API routes for inventory, waste, staff requests, reorders, exports, auth, billing, automation, and admin workflows
- Prisma schema and migrations
- Seed script for demo users and sample operational data
- Launch, outreach, production, QA, and 30-day go-to-market documents

## Demo Login

- Owner: `owner@wasteverity.demo` / `Password123!`
- Staff: `staff@wasteverity.demo` / `Password123!`
- Admin: `admin@wasteverity.demo` / `Password123!`

Demo accounts are for local testing only. Do not use `@wasteverity.demo` addresses for production customers or operators.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` and set a local PostgreSQL `DATABASE_URL`.

3. Generate Prisma Client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Seed demo data:

```bash
npm run seed
```

5. Start the development server:

```bash
npm run dev
```

## Prisma Commands

- Open Studio: `npm run prisma:studio`
- Generate client: `npm run prisma:generate`
- Check migration status: `npm run prisma:status`
- Apply committed migrations in production: `npm run prisma:deploy`

Do not run `npm run prisma:migrate` against production. It is a local development command that can create new migration files.

## Production Account Creation

- Use `/register` to create the first real facility owner account.
- Do not run `npm run seed` against production unless demo data is explicitly required.
- Create production admin accounts through the controlled operator script:

```powershell
$env:ADMIN_EMAIL='admin@example.com'
$env:ADMIN_NAME='Platform Admin'
$env:ADMIN_PASSWORD='Use-a-long-unique-password-123!'
$env:CONFIRM_CREATE_ADMIN='CREATE_ADMIN'
npm run admin:create
```

## Deployment Flow

1. Ensure `DATABASE_URL` points at the target PostgreSQL database.
2. Generate Prisma Client: `npm run prisma:generate`.
3. Apply committed migrations: `npm run prisma:deploy`.
4. Configure production environment variables.
5. Build and start the app.

Production checklist:
- See `PRODUCTION_CHECKLIST.md`.
- Copy `.env.production.example` into the hosting platform's production environment settings.
- Run `npm run env:check` in a production-like environment before launch.

## Billing

The repo includes placeholder API routes for creating a Stripe Checkout session and receiving Stripe webhooks. Configure live Stripe keys, products, price IDs, and webhook secrets before taking real payments.

## Key Folders

- `pages/` - Next.js pages and API routes
- `components/` - Shared UI and layout components
- `prisma/` - Prisma schema, migrations, and seed script
- `lib/` - Auth, Prisma, validation, permissions, and utility helpers
- `tests/` - Playwright smoke and boundary tests
- `styles/` - Global Tailwind styles

## Roadmap Ideas

- Temperature log module
- Compliance task schedules and sign-off workflows
- Multi-site dashboards
- Supplier document storage
- Recipe and menu costing
- Barcode scanning
- Mobile-first kitchen workflows
- Demand forecasting
- Supplier order automation
- EPOS and procurement integrations

## Launch Documents

- `WASTEVERITY_LAUNCH.md` - domain, deployment, and launch setup
- `WASTEVERITY_POSITIONING.md` - audience, pain points, offer, and proof points
- `WASTEVERITY_OUTREACH.md` - cold email, call script, and prospecting notes
- `WASTEVERITY_COMBINED_PROMPT.md` - master prompt for generating WasteVerity GTM assets
- `WASTEVERITY_30_DAY_CHECKLIST.md` - daily launch execution checklist
