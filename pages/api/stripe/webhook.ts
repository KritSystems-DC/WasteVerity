import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

async function getRawBody(req: NextApiRequest) {
  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', (err) => reject(err))
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return res.status(501).json({ error: 'Stripe webhook not configured.' })
  }

  const payload = await getRawBody(req)
  const sig = req.headers['stripe-signature']
  const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' })

  let event: Stripe.Event
  try {
    if (!sig) return res.status(400).json({ error: 'Missing Stripe signature.' })
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
  } catch (error: any) {
    return res.status(400).json({ error: `Webhook error: ${error.message}` })
  }

  const data = event.data.object as Stripe.Checkout.Session
  const businessId = data.metadata?.businessId as string | undefined

  if (event.type === 'checkout.session.completed' && businessId) {
    const customerId = typeof data.customer === 'string' ? data.customer : undefined
    const subscriptionId = typeof data.subscription === 'string' ? data.subscription : undefined
    await prisma.subscription.upsert({
      where: { businessId },
      update: {
        stripeCustomerId: customerId ?? undefined,
        stripeSubscriptionId: subscriptionId ?? undefined,
        status: 'ACTIVE',
        currentPeriodStart: data.created ? new Date(data.created * 1000) : undefined,
      },
      create: {
        businessId,
        stripeCustomerId: customerId ?? `cus_${Date.now()}`,
        stripeSubscriptionId: subscriptionId ?? undefined,
        status: 'ACTIVE',
        currentPeriodStart: data.created ? new Date(data.created * 1000) : undefined,
      },
    })
    await prisma.automationLog.create({
      data: {
        businessId,
        type: 'stripe_checkout_completed',
        title: 'Stripe checkout completed',
        message: `Subscription checkout completed for business ${businessId}`,
        status: 'SUCCESS',
      },
    })
  }

  if ((event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted')) {
    const subscription = event.data.object as Stripe.Subscription
    const statusMap: Record<string, 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'UNPAID' | 'INCOMPLETE'> = {
      trialing: 'TRIALING',
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELLED',
      unpaid: 'UNPAID',
      incomplete: 'INCOMPLETE',
    }
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: statusMap[subscription.status] || 'INCOMPLETE',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    })
  }

  res.status(200).json({ received: true })
}
