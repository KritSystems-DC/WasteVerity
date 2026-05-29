import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const user = await requireUser(req, res)
  if (!user) return

  const limit = Math.min(100, Number(req.query.limit ?? 50))
  const where = user.role === 'ADMIN' ? {} : { businessId: user.businessId }

  const logs = await prisma.automationLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return res.status(200).json(logs)
}
