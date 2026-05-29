import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'
import { validateStockItem } from '@/lib/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  const method = req.method

  if (method === 'GET') {
    if (!user.businessId) return res.status(403).json({ error: 'Business context required' })
    const items = await prisma.stockItem.findMany({ where: { businessId: user.businessId }, include: { supplier: true } })
    return res.status(200).json(items)
  }

  if (method === 'POST') {
    if (!user.businessId) return res.status(403).json({ error: 'Business context required' })
    const body = req.body
    if (!('currentQuantity' in body)) body.currentQuantity = 0
    if (!('minimumQuantity' in body)) body.minimumQuantity = 0
    if (!('reorderAmount' in body)) body.reorderAmount = 0
    if (!('costPerUnit' in body)) body.costPerUnit = 0

    const validation = validateStockItem(body)
    if (!validation.valid) return res.status(400).json({ errors: validation.errors })
    if (!Number.isInteger(body.currentQuantity) || body.currentQuantity < 0) return res.status(400).json({ error: 'currentQuantity must be a non-negative integer' })
    if (!Number.isInteger(body.minimumQuantity) || body.minimumQuantity < 0) return res.status(400).json({ error: 'minimumQuantity must be a non-negative integer' })
    if (!Number.isInteger(body.reorderAmount) || body.reorderAmount < 0) return res.status(400).json({ error: 'reorderAmount must be a non-negative integer' })
    if (typeof body.costPerUnit !== 'number' || !Number.isFinite(body.costPerUnit) || body.costPerUnit < 0) return res.status(400).json({ error: 'costPerUnit must be a non-negative number' })
    if (body.sellingPrice !== undefined && (typeof body.sellingPrice !== 'number' || !Number.isFinite(body.sellingPrice) || body.sellingPrice < 0)) return res.status(400).json({ error: 'sellingPrice must be a non-negative number' })
    if (body.supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } })
      if (!supplier || supplier.businessId !== user.businessId) return res.status(400).json({ error: 'Invalid supplier' })
    }

    const data = {
      businessId: user.businessId,
      supplierId: body.supplierId || undefined,
      name: body.name,
      sku: body.sku || undefined,
      category: body.category || undefined,
      currentQuantity: body.currentQuantity,
      minimumQuantity: body.minimumQuantity || 0,
      reorderAmount: body.reorderAmount || 0,
      unit: body.unit || 'item',
      costPerUnit: body.costPerUnit || 0,
      sellingPrice: body.sellingPrice || undefined,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      location: body.location || undefined,
      notes: body.notes || undefined
    }
    const item = await prisma.stockItem.create({ data })
    if (item.currentQuantity <= item.minimumQuantity) {
      await prisma.lowStockAlert.upsert({
        where: { businessId_stockItemId_status: { businessId: item.businessId, stockItemId: item.id, status: 'ACTIVE' } },
        update: { message: `Low stock: ${item.name} is down to ${item.currentQuantity}. Suggested reorder: ${item.reorderAmount}.` },
        create: {
          businessId: item.businessId,
          stockItemId: item.id,
          message: `Low stock: ${item.name} is down to ${item.currentQuantity}. Suggested reorder: ${item.reorderAmount}.`,
          status: 'ACTIVE'
        }
      })
    }
    return res.status(201).json(item)
  }

  return res.status(405).end()
}
