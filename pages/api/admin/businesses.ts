import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const user = await requireRole(req, res, ['ADMIN'])
  if (!user) return
  const { status, q } = req.query
  const where = {
    ...(typeof status === 'string' && status ? { status: status as any } : {}),
    ...(typeof q === 'string' && q.trim()
      ? {
          OR: [
            { name: { contains: q.trim(), mode: 'insensitive' as const } },
            { email: { contains: q.trim(), mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const businesses = await prisma.business.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      subscriptions: {
        select: {
          plan: true,
          status: true,
          currentPeriodEnd: true,
        },
      },
    },
  })

  return res.status(200).json(businesses)
}
