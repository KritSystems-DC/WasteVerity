# HealthServe Smoke Test

Use this after running migrations and seeding demo data.

## Start

```bash
npm.cmd run dev
```

Open `http://localhost:3000`.

## Demo Accounts

- Owner: `owner@healthserve.demo` / `Password123!`
- Staff: `staff@healthserve.demo` / `Password123!`
- Admin: `admin@healthserve.demo` / `Password123!`

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
- [ ] Open Reports, download stock CSV and waste CSV.
- [ ] Open Billing, confirm current plan/status appears and checkout reports configuration if Stripe is not set.

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

## Expected Gaps

- Stripe checkout needs real `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` and `STRIPE_WEBHOOK_SECRET`.
- Public Terms and Privacy copy are placeholders.
- Automated test coverage has not been added yet.
