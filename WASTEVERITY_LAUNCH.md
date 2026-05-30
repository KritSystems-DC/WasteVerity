# WasteVerity Domain and Deployment Guide

WasteVerity should launch as a focused healthcare food service platform, not a generic inventory app. The launch assets should consistently describe the product as compliance, waste, inventory, and reporting software for regulated kitchens.

## Domain Strategy

Preferred options:

1. `wasteverity.co.uk` - selected final brand domain for the UK launch.
2. `wasteverity.co` - useful as a defensive redirect if available.
3. `wasteverity.uk` - useful as a defensive redirect if available.
4. `getwasteverity.com` - useful if an international fallback is needed.

Registration steps:

1. Search for the preferred domain at Namecheap, GoDaddy, Cloudflare Registrar, or another registrar.
2. Register for at least 1 year, ideally 2-3 years.
3. Enable auto-renewal.
4. Enable WHOIS privacy where available.
5. Store registrar login and renewal details in a secure password manager.

## Hosting Recommendation

Use Vercel for the first production launch because this is a Next.js app and Vercel removes deployment friction.

Vercel setup:

1. Push the repo to GitHub.
2. Create or open a Vercel account.
3. Import the GitHub repository.
4. Add required environment variables.
5. Deploy a preview.
6. Run smoke tests against the preview.
7. Promote to production.
8. Add the production domain.

DNS setup for Vercel:

- Add `www` as a CNAME to `cname.vercel-dns.com`.
- Add the apex domain through Vercel's recommended A/ALIAS records.
- Confirm HTTPS is active before using the domain in outreach.

## Production Launch Checklist

- [ ] Domain registered.
- [ ] Production app deployed.
- [ ] Production database provisioned.
- [ ] Environment variables configured.
- [ ] Prisma migrations deployed.
- [ ] Demo users disabled or clearly isolated.
- [ ] `hello@wasteverity.co.uk` created.
- [ ] SPF, DKIM, and DMARC records configured.
- [ ] Calendly demo link created.
- [ ] Google Analytics or another analytics tool installed.
- [ ] Error monitoring selected.
- [ ] Production smoke test completed.
- [ ] Legal placeholders replaced in privacy and terms pages.

## Email Setup

Recommended mailbox options:

- Google Workspace
- Proton Mail
- Mailbox.org
- Microsoft 365

Create these addresses:

- `hello@wasteverity.co.uk` for outbound and demo requests.
- `support@wasteverity.co.uk` for customer support.
- `billing@wasteverity.co.uk` for payment and invoice messages.

Deliverability setup:

- Configure SPF.
- Configure DKIM.
- Configure DMARC with a monitoring policy first.
- Warm the mailbox before sending large batches.
- Keep early outreach highly targeted.

## Analytics and Lead Capture

Minimum tracking:

- Page views
- CTA clicks
- Demo bookings
- Registration starts
- Registration completions
- Login events

Lead tracker fields:

- Facility name
- Segment
- Contact name
- Job title
- Email
- Phone
- LinkedIn URL
- Source
- Status
- Last touch
- Next touch
- Objection or buying trigger
- Demo date
- Pilot status

## Week 1 Launch Focus

1. Deploy the production site.
2. Create the demo booking flow.
3. Build the first 100-prospect list.
4. Send the first 50 targeted emails.
5. Connect with 25 relevant LinkedIn prospects.
6. Book the first 3-5 discovery calls.
7. Improve copy based on real objections.

## Automation Roadmap

- Landing page form to Airtable or Google Sheets.
- Calendly booking to email follow-up.
- Demo booked notification to Slack or email.
- Trial signup to onboarding checklist.
- Weekly metrics dashboard for prospects, replies, demos, pilots, and wins.
