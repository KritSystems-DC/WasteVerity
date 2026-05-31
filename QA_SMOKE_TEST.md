# WasteVerity Smoke Test

Use this after running migrations and seeding demo data. The authenticated app is the product surface; run these checks against the app routes on phone, tablet/iPad and desktop widths where possible.

## Automated Smoke Suite

Run the Playwright smoke suite before manual QA:

```bash
npm.cmd run test:smoke
```

The suite starts the dev server through Playwright and expects a reachable PostgreSQL-backed demo database. It currently covers:

- Registration, login, anonymous redirects and role-based access.
- Owner workflows for setup, stock, suppliers, staff requests, reorder, waste, reports, billing, settings, compliance records and recurring compliance schedules.
- Staff request submission and restricted review actions.
- Admin dashboard and admin section loading.
- API boundary checks for anonymous access, admin-only access, business-context blocking, tenant isolation, validation, team management, notification preferences and Stripe portal config handling.
- Responsive app surface checks for phone, tablet/iPad and desktop widths across dashboard, stock, suppliers, compliance, reports and settings.

## Manual Start

Use this only for manual exploratory QA:

```bash
npm.cmd run dev
```

Open `http://localhost:3000` and verify both the public website routes and the authenticated app routes.

## Demo Accounts

- Owner: `owner@wasteverity.demo` / `Password123!`
- Staff: `staff@wasteverity.demo` / `Password123!`
- Admin: `admin@wasteverity.demo` / `Password123!`

## Owner Flow

- [ ] Log in as owner.
- [ ] Open Dashboard and confirm stock stats load.
- [ ] Open Setup, save business details, confirm success message.
- [ ] Open Stock, add a stock item, edit it, then adjust quantity.
- [ ] Open Suppliers, add a supplier, edit it, then return to supplier list.
- [ ] Open Staff requests, submit a request, approve it, and add one linked request to reorder.
- [ ] Open Reorder, generate a list, download reorder CSV.
- [ ] Open Expiry, confirm dated stock appears and refresh alerts works.
- [ ] Open Waste, record waste against an item, confirm stock quantity and estimated loss update.
- [ ] Open Compliance, create a recurring schedule, complete it, save a filled compliance record, and open the saved record detail page.
- [ ] Open Reports, confirm low-stock, expiry and waste summaries render, then download stock CSV and waste CSV.
- [ ] Open Billing, confirm current plan/status appears and checkout reports configuration if Stripe is not set.
- [ ] Open Team and confirm owner-only team management is available.
- [ ] Open Settings and save notification preferences.

## Staff Flow

- [ ] Log in as staff.
- [ ] Confirm admin pages redirect or remain inaccessible.
- [ ] Submit a staff request.
- [ ] Confirm owner-only review actions are not shown.

## Admin Flow

- [ ] Log in as admin.
- [ ] Open Admin dashboard and confirm stats load.
- [ ] Open Businesses, business detail, subscriptions, logs, users and notes.
- [ ] Confirm customer pages requiring a business context do not expose another tenant's data.

## Public Website Flow

- [ ] Open `/`, `/wasteverity`, `/features`, `/pricing`, `/terms` and `/privacy`.
- [ ] Confirm public website copy is sales and engagement focused, not presented as the operational tool.
- [ ] Confirm `App login` routes to `/login`.
- [ ] Confirm demo CTAs route to the sales/demo section rather than directly into app registration.
- [ ] Check the public website at mobile, tablet/iPad and desktop widths for readable layout and non-overlapping text.

## App Device Checks

- [ ] Phone width: app sidebar starts closed, menu opens, links are usable, and tables/forms remain readable or scroll cleanly.
- [ ] Tablet/iPad width: app navigation and dense operational pages remain usable without content overlap.
- [ ] Desktop width: sidebar, header and content align without duplicate margins or hidden controls.

## Expected Gaps

- Stripe checkout needs real `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` and `STRIPE_WEBHOOK_SECRET`.
- Public Terms and Privacy copy are placeholders.
- Report-specific tenant isolation edge cases should continue to be expanded.
- Manual device QA is still useful for final hands-on ergonomics, but baseline phone, tablet/iPad and desktop app layout coverage is now automated.
