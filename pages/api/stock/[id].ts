import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' })

  const item = await prisma.stockItem.findUnique({ where: { id }, include: { supplier: true, priceHistories: true } })
  if (!item || item.businessId !== user.businessId) return res.status(404).json({ error: 'Not found' })

  if (req.method === 'GET') {
    return res.status(200).json(item)
  }

  if (req.method === 'PUT') {
    const body = req.body
    if (body.currentQuantity != null && body.currentQuantity < 0) return res.status(400).json({ error: 'currentQuantity cannot be negative' })
    if (body.minimumQuantity != null && body.minimumQuantity < 0) return res.status(400).json({ error: 'minimumQuantity cannot be negative' })
    if (body.reorderAmount != null && body.reorderAmount < 0) return res.status(400).json({ error: 'reorderAmount cannot be negative' })
    if (body.costPerUnit != null && body.costPerUnit < 0) return res.status(400).json({ error: 'costPerUnit cannot be negative' })
    if (body.sellingPrice != null && body.sellingPrice < 0) return res.status(400).json({ error: 'sellingPrice cannot be negative' })
    if (body.supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: body.supplierId } })
      if (!supplier || supplier.businessId !== user.businessId) return res.status(400).json({ error: 'Invalid supplier' })
    }

    const updated = await prisma.stockItem.update({
      where: { id },
      data: {
        supplierId: body.supplierId || null,
        name: body.name,
        sku: body.sku || null,
        category: body.category || null,
        currentQuantity: body.currentQuantity,
        minimumQuantity: body.minimumQuantity,
        reorderAmount: body.reorderAmount,
        unit: body.unit || 'item',
        costPerUnit: body.costPerUnit,
        sellingPrice: body.sellingPrice || null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        location: body.location || null,
        notes: body.notes || null,
        status: body.status,
      },
    })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    if (user.role === 'STAFF') return res.status(403).json({ error: 'Forbidden' })
    const archived = await prisma.stockItem.update({ where: { id }, data: { status: 'ARCHIVED' } })
    return res.status(200).json(archived)
  }

  return res.status(405).end()
}
