import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const user = await requireRole(req, res, ['ADMIN'])
  if (!user) return

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' })

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      subscriptions: true,
      users: { select: { id: true, name: true, email: true, role: true } },
      automationLogs: {
        orderBy: { createdAt: 'desc' },
        take: 25,
      },
    },
  })
  if (!business) return res.status(404).json({ error: 'Not found' })

  return res.status(200).json(business)
}
