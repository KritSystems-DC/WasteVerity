import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(400).json({ error: 'Business context required to open billing portal.' })

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return res.status(501).json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' })

  const subscription = await prisma.subscription.findUnique({ where: { businessId: user.businessId } })
  if (!subscription?.stripeCustomerId) return res.status(404).json({ error: 'No Stripe customer is recorded for this business.' })

  const origin = req.headers.origin || `http://${req.headers.host}`
  const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' })
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${origin}/billing`,
  })

  await prisma.automationLog.create({
    data: {
      businessId: user.businessId,
      type: 'stripe_portal_created',
      title: 'Stripe portal session created',
      message: `Billing portal session created for ${user.email}`,
      status: 'INFO',
    },
  })

  return res.status(200).json({ url: portalSession.url })
}
