import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const user = await requireRole(req, res, ['ADMIN'])
  if (!user) return

  const [
    totalBusinesses,
    totalUsers,
    totalSubscriptions,
    activeSubscriptions,
    pastDueSubscriptions,
    activeLowStockAlerts,
    activeExpiryAlerts,
    automationEvents,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.user.count(),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { status: 'PAST_DUE' } }),
    prisma.lowStockAlert.count({ where: { status: 'ACTIVE' } }),
    prisma.expiryAlert.count({ where: { status: 'ACTIVE' } }),
    prisma.automationLog.count(),
  ])

  return res.status(200).json({
    totalBusinesses,
    totalUsers,
    totalSubscriptions,
    activeSubscriptions,
    pastDueSubscriptions,
    activeAlerts: activeLowStockAlerts + activeExpiryAlerts,
    automationEvents,
  })
}
