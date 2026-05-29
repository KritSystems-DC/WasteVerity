import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(400).json({ error: 'Business context is required.' })

  if (req.method === 'GET') {
    const records = await prisma.wasteRecord.findMany({
      where: { businessId: user.businessId },
      include: {
        stockItem: { select: { id: true, name: true, unit: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return res.status(200).json(records)
  }

  if (req.method === 'POST') {
    const { stockItemId, quantity, reason } = req.body
    const parsedQuantity = Number(quantity)
    if (!stockItemId || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ error: 'Choose an item and enter a quantity above zero.' })
    }

    const item = await prisma.stockItem.findUnique({ where: { id: stockItemId } })
    if (!item || item.businessId !== user.businessId) return res.status(404).json({ error: 'Stock item not found.' })
    if (parsedQuantity > item.currentQuantity) return res.status(400).json({ error: 'Waste quantity cannot exceed current stock.' })

    const nextQuantity = item.currentQuantity - parsedQuantity
    const estimatedCostLost = Number(item.costPerUnit) * parsedQuantity

    const [record] = await prisma.$transaction([
      prisma.wasteRecord.create({
        data: {
          businessId: user.businessId,
          stockItemId,
          userId: user.id,
          quantity: parsedQuantity,
          estimatedCostLost,
          reason: reason || null,
        },
      }),
      prisma.stockMovement.create({
        data: {
          businessId: user.businessId,
          stockItemId,
          userId: user.id,
          type: 'WASTED',
          quantityChange: -parsedQuantity,
          previousQuantity: item.currentQuantity,
          newQuantity: nextQuantity,
          reason: reason || undefined,
        },
      }),
      prisma.stockItem.update({
        where: { id: stockItemId },
        data: { currentQuantity: nextQuantity },
      }),
    ])

    await prisma.automationLog.create({
      data: {
        businessId: user.businessId,
        type: 'waste_recorded',
        title: 'Waste recorded',
        message: `${parsedQuantity} ${item.unit} of ${item.name} recorded as waste.`,
        status: 'INFO',
      },
    })

    return res.status(201).json(record)
  }

  return res.status(405).end()
}
