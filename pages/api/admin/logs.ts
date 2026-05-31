import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const user = await requireRole(req, res, ['ADMIN'])
  if (!user) return
  const { businessId, status, type } = req.query
  const where = {
    ...(typeof businessId === 'string' && businessId ? { businessId } : {}),
    ...(typeof status === 'string' && status ? { status: status as any } : {}),
    ...(typeof type === 'string' && type ? { type } : {}),
  }

  const logs = await prisma.automationLog.findMany({
    where,
    include: {
      business: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  })

  return res.status(200).json(logs)
}
