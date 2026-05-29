import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const user = await requireRole(req, res, ['ADMIN'])
  if (!user) return

  const subscriptions = await prisma.subscription.findMany({
    include: {
      business: true,
    },
    orderBy: {
      currentPeriodEnd: 'desc',
    },
  })

  return res.status(200).json(subscriptions)
}
