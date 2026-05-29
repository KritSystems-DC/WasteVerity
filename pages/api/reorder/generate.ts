import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(403).json({ error: 'Business context required' })

  const businessId = user.businessId
  const allItems = await prisma.stockItem.findMany({ where: { businessId, status: 'ACTIVE' }, orderBy: { name: 'asc' } })
  const lowStock = allItems.filter((item) => item.currentQuantity <= item.minimumQuantity)
  const approvedRequests = await prisma.staffRequest.findMany({ where: { businessId, status: 'APPROVED' } })

  const itemsMap: Record<string, { stockItemId: string; name: string; quantity: number; unit: string; supplierId?: string; estimatedCost: number }> = {}

  for (const item of lowStock) {
    const qty = item.reorderAmount || Math.max(1, item.minimumQuantity || 1)
    itemsMap[item.id] = {
      stockItemId: item.id,
      name: item.name,
      quantity: qty,
      unit: item.unit || 'item',
      supplierId: item.supplierId || undefined,
      estimatedCost: Number(item.costPerUnit || 0) * qty
    }
  }

  for (const request of approvedRequests) {
    if (!request.stockItemId) continue
    if (!Number.isInteger(request.requestedQuantity) || request.requestedQuantity <= 0) continue
    if (itemsMap[request.stockItemId]) {
      itemsMap[request.stockItemId].quantity += request.requestedQuantity
    } else {
      itemsMap[request.stockItemId] = {
        stockItemId: request.stockItemId,
        name: request.itemName,
        quantity: request.requestedQuantity,
        unit: 'item',
        supplierId: undefined,
        estimatedCost: 0
      }
    }
  }

  const items = Object.values(itemsMap)
  if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
    return res.status(400).json({ error: 'Generated reorder quantities must be positive integers' })
  }
  const estimatedTotal = items.reduce((sum, item) => sum + item.estimatedCost, 0)

  const created = await prisma.reorderList.create({ data: {
    businessId,
    status: 'DRAFT',
    title: `Auto reorder ${new Date().toLocaleDateString('en-GB')}`,
    estimatedTotalCost: estimatedTotal,
    createdByUserId: user.id
  }})

  await Promise.all(items.map((item) => prisma.reorderListItem.create({ data: {
    reorderListId: created.id,
    stockItemId: item.stockItemId,
    supplierId: item.supplierId || undefined,
    quantity: item.quantity,
    unit: item.unit,
    estimatedCost: item.estimatedCost,
    status: 'PENDING'
  }})))

  await prisma.automationLog.create({ data: {
    businessId,
    type: 'reorder_generated',
    title: 'Reorder list generated',
    message: `Reorder ${created.id} created with ${items.length} items`,
    status: 'SUCCESS'
  } })

  return res.status(201).json({ reorderId: created.id })
}
