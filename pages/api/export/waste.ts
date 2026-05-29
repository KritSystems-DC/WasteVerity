import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

function csvValue(value: unknown) {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user || !user.businessId) return res.status(403).json({ error: 'Unauthorized' })

  const records = await prisma.wasteRecord.findMany({
    where: { businessId: user.businessId },
    include: {
      stockItem: { select: { name: true, unit: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const cols = ['item', 'quantity', 'unit', 'estimatedCostLost', 'reason', 'recordedBy', 'createdAt']
  const rows = records.map((record) => ({
    item: record.stockItem.name,
    quantity: record.quantity,
    unit: record.stockItem.unit,
    estimatedCostLost: record.estimatedCostLost.toString(),
    reason: record.reason,
    recordedBy: record.user.name || record.user.email,
    createdAt: record.createdAt.toISOString(),
  }))
  const csv = [cols.join(','), ...rows.map((row) => cols.map((col) => csvValue(row[col as keyof typeof row])).join(','))].join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="waste.csv"')
  res.status(200).send(csv)
}
