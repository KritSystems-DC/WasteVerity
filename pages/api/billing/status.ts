import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(400).json({ error: 'Business context required.' })

  const subscription = await prisma.subscription.findUnique({
    where: { businessId: user.businessId },
    include: { business: { select: { name: true } } },
  })

  return res.status(200).json({ subscription })
}
