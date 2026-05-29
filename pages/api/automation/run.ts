import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { createLowStockAlerts, createExpiryAlerts } from '@/lib/db'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const user = await requireUser(req, res)
  if (!user) return

  let businessId = user.businessId
  if (user.role === 'ADMIN') {
    const requestedBusinessId = req.query.businessId
    if (!requestedBusinessId || typeof requestedBusinessId !== 'string') {
      return res.status(400).json({ error: 'Admin must provide a businessId to run automation.' })
    }
    businessId = requestedBusinessId
  }

  if (!businessId) return res.status(400).json({ error: 'Business context is required' })

  await createLowStockAlerts(businessId)
  await createExpiryAlerts(businessId)

  const [lowCount, expiryCount] = await Promise.all([
    prisma.lowStockAlert.count({ where: { businessId, status: 'ACTIVE' } }),
    prisma.expiryAlert.count({ where: { businessId, status: 'ACTIVE' } }),
  ])

  await prisma.automationLog.create({
    data: {
      businessId,
      type: 'automation_run',
      title: 'Alert automation executed',
      message: `Created or refreshed ${lowCount} low-stock and ${expiryCount} expiry alerts.`,
      status: 'SUCCESS',
    },
  })

  return res.status(200).json({ message: 'Alert automation completed', lowCount, expiryCount })
}
