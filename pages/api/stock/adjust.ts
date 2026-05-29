import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const user = await requireUser(req, res)
  if (!user) return
  const { stockItemId, type, quantityChange, reason } = req.body
  if (!user.businessId) return res.status(403).json({ error: 'Business context required' })
  if (!stockItemId || typeof quantityChange !== 'number') return res.status(400).json({ error: 'Missing fields' })
  if (!Number.isInteger(quantityChange) || quantityChange === 0) return res.status(400).json({ error: 'quantityChange must be a non-zero integer' })

  const item = await prisma.stockItem.findUnique({ where: { id: stockItemId } })
  if (!item || item.businessId !== user.businessId) return res.status(404).json({ error: 'Stock item not found' })

  const previous = item.currentQuantity
  const next = previous + quantityChange
  if (next < 0) return res.status(400).json({ error: 'Resulting quantity cannot be negative' })

  const [movement, updated] = await prisma.$transaction([
    prisma.stockMovement.create({ data: {
      businessId: item.businessId,
      stockItemId,
      userId: user.id,
      type: type || 'MANUAL_ADJUSTMENT',
      quantityChange,
      previousQuantity: previous,
      newQuantity: next,
      reason: reason || undefined
    }}),
    prisma.stockItem.update({ where: { id: stockItemId }, data: { currentQuantity: next } })
  ])

  if (updated.currentQuantity <= updated.minimumQuantity) {
    await prisma.lowStockAlert.upsert({
      where: { businessId_stockItemId_status: { businessId: item.businessId, stockItemId, status: 'ACTIVE' } },
      update: { message: `Low stock: ${updated.name} is down to ${updated.currentQuantity}. Suggested reorder: ${updated.reorderAmount}.` },
      create: {
        businessId: item.businessId,
        stockItemId,
        message: `Low stock: ${updated.name} is down to ${updated.currentQuantity}. Suggested reorder: ${updated.reorderAmount}.`,
        status: 'ACTIVE'
      }
    })
    await prisma.automationLog.create({ data: { businessId: item.businessId, type: 'low_stock', title: 'Low stock detected', message: `Low stock for ${updated.name}`, status: 'SUCCESS' } })
  }

  return res.status(200).json({ movement, updated })
}
