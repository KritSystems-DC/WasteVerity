# StockSense

Simple stock control for small businesses.

Tech stack
- Next.js (TypeScript)
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth for authentication (Credentials provider for demo)
- Stripe placeholders for billing

What this repo contains
- Prisma schema: `prisma/schema.prisma`
- Seed script: `prisma/seed.ts` (creates demo business, users, suppliers, stock items)
- Basic Next.js pages and API route skeletons

Demo login
- Owner: owner@stocksense.demo / Password123!
- Staff: staff@stocksense.demo / Password123!
- Admin: admin@stocksense.demo / Password123!

Production account creation
- Use `/register` to create the first real business owner account.
- Do not run `npm run seed` against production unless you intentionally want demo data.
- Demo users use `@stocksense.demo` addresses and must not be used for real customers.

Local setup
1. Install dependencies

```bash
npm install
```

2. Create a PostgreSQL database and set `DATABASE_URL` in `.env` (copy `.env.example`)

3. Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Seed demo data

```bash
npm run seed
```

5. Run development server

```bash
npm run dev
```

Prisma commands
- Open Studio: `npm run prisma:studio`
- Generate client: `npm run prisma:generate`
- Check migration status: `npm run prisma:status`
- Apply committed migrations in production: `npm run prisma:deploy`

Deployment database flow
1. Ensure `DATABASE_URL` points at the target PostgreSQL database.
2. Generate Prisma Client: `npm run prisma:generate`
3. Apply committed migrations: `npm run prisma:deploy`
4. Build and start the app.

Do not run `npm run prisma:migrate` against production. It is a local development command that can create new migration files.

Production environment check
- Copy `.env.production.example` into your hosting platform's production environment settings.
- Run `npm run env:check` in a production-like environment to confirm required values are present.

Stripe
- This repo includes placeholder API routes for creating a Checkout session and a webhook receiver. Configure Stripe keys in `.env` when ready.

Production
- See `PRODUCTION_CHECKLIST.md` before deploying a live instance.

Folder structure
- `pages/` - Next.js pages and API routes
- `prisma/` - Prisma schema and seed script
- `lib/` - helpers (Prisma client)
- `styles/` - global styles

Future roadmap ideas
- Barcode scanning
- Mobile app
- AI demand forecasting (not in MVP)
- Supplier order automation
- Multi-location stock transfer
- WhatsApp reorder approvals
- EPOS integration
- Recipe/ingredient costing
- Staff permissions and roles

Notes
- For the local demo, users are seeded with the shared password `Password123!`; registration-created passwords are hashed with bcrypt.
- The Stripe integration is a placeholder; do not expect live billing until configured.

