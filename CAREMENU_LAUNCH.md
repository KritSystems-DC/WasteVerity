# CareMenu Domain & Deployment Guide

## Domain Registration (Do This Now)

### Best Options:
1. **caremenu.co** (Preferred) — Available, modern, clear
2. **caremenu.uk** — Great for UK-focused positioning
3. **healthserve.co** — Alternative
4. **caremenu.health** — Premium but shows niche

### Registration Steps:
1. Go to **Namecheap.com** or **GoDaddy.com**
2. Search for `caremenu.co` (or your choice)
3. Register for 1-3 years (£10-20/year)
4. Enable auto-renewal to avoid losing it
5. **Get WHOIS privacy protection** (hide your personal info)

### DNS Setup:
Once registered, point DNS to your hosting:
- If using Vercel (recommended): Add CNAME record `www` → `cname.vercel-dns.com`
- If using custom hosting: Point A record to your server IP

---

## Deployment Strategy (Choose One)

### Option A: Vercel (Recommended for Speed)
- Deploy instantly from GitHub
- Free tier available, £12/month for production
- Steps:
  1. Push code to GitHub
  2. Go to `vercel.com`, connect GitHub repo
  3. Deploy
  4. Add domain in Vercel dashboard

### Option B: AWS / DigitalOcean
- More control, £10-30/month
- Requires Docker/deployment knowledge
- Good if you want complete control

### Option C: Netlify
- Similar to Vercel, very fast
- Good free tier

**I recommend Vercel** — it's the fastest to launch and handles Next.js perfectly.

---

## Pre-Launch Checklist

- [ ] Domain registered (caremenu.co)
- [ ] Domain DNS pointing to hosting
- [ ] Landing page deployed and live
- [ ] Email setup (hello@caremenu.co)
- [ ] Google Analytics added
- [ ] Mixpanel/segment tracking (optional)
- [ ] Calendly for demo bookings (embed on landing)
- [ ] Social media profiles created (LinkedIn, Twitter)

---

## Email Setup (Quick & Free)

Use **Mailbox.org** or **ProtonMail**:
1. Register `hello@caremenu.co`
2. Cost: £5-10/month
3. Professional appearance for outreach

---

## Week 1 After Launch

1. **Cold email outreach** (see template)
2. **Set up Calendly** (link on landing page for "Book Demo")
3. **Add Google Analytics** (track traffic)
4. **LinkedIn outreach** (connect with 20 care home directors)
5. **Warm intros** (ask friends/investors for intros to healthcare contacts)

---

## Next Steps to Automate

1. **Landing page form → Google Sheet/Airtable** (capture leads)
2. **Calendly → Email automation** (send demo prep docs when scheduled)
3. **Add Slack/email notifications** when someone books a demo
