import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const user = await requireUser(req, res)
  if (!user) return

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID
  if (!stripeKey || !priceId) {
    return res.status(501).json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID.' })
  }

  if (!user.businessId) {
    return res.status(400).json({ error: 'Business context required to create checkout session.' })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' })
  const origin = req.headers.origin || `http://${req.headers.host}`
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: user.email || undefined,
    metadata: {
      businessId: user.businessId,
      userId: user.id,
    },
    success_url: `${origin}/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/billing`,
  })

  await prisma.automationLog.create({
    data: {
      businessId: user.businessId,
      type: 'stripe_checkout_created',
      title: 'Stripe checkout session created',
      message: `Checkout session ${session.id} created for ${user.email}`,
      status: 'INFO',
    },
  })

  return res.status(200).json({ url: session.url })
}
