import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireUser } from '../../../lib/serverAuth'
import { sendEmail } from '../../../lib/notifications'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' })
  const user = await requireUser(req, res)
  if (!user) return

  if (req.method === 'GET') {
    const r = await prisma.staffRequest.findUnique({ where: { id }, include: { submittedByUser: true, reviewedByUser: true } })
    if (!r || (user.role !== 'ADMIN' && r.businessId !== user.businessId)) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(r)
  }

  // Only owner or admin can review
  if (req.method === 'PUT') {
    if (!['OWNER','ADMIN'].includes(user.role)) return res.status(403).json({ error: 'Forbidden' })
    const { action } = req.body
    const reqItem = await prisma.staffRequest.findUnique({ where: { id } })
    if (!reqItem) return res.status(404).json({ error: 'Not found' })
    if (user.role !== 'ADMIN' && reqItem.businessId !== user.businessId) return res.status(404).json({ error: 'Not found' })

    if (action === 'approve') {
      const updated = await prisma.staffRequest.update({ where: { id }, data: { status: 'APPROVED', reviewedByUserId: user.id, reviewedAt: new Date() } })
      await prisma.automationLog.create({ data: { businessId: user.businessId, type: 'staff_request_approved', title: 'Staff request approved', message: `Request ${id} approved`, status: 'SUCCESS' } })
      // notify staff
      const staff = await prisma.user.findUnique({ where: { id: updated.submittedByUserId } })
      if (staff?.email) await sendEmail(staff.email, 'Your request was approved', `Your request for ${updated.itemName} was approved.`, user.businessId ?? undefined)
      return res.status(200).json(updated)
    }

    if (action === 'reject') {
      const updated = await prisma.staffRequest.update({ where: { id }, data: { status: 'REJECTED', reviewedByUserId: user.id, reviewedAt: new Date() } })
      await prisma.automationLog.create({ data: { businessId: user.businessId, type: 'staff_request_rejected', title: 'Staff request rejected', message: `Request ${id} rejected`, status: 'SUCCESS' } })
      const staff = await prisma.user.findUnique({ where: { id: updated.submittedByUserId } })
      if (staff?.email) await sendEmail(staff.email, 'Your request was rejected', `Your request for ${updated.itemName} was rejected.`, user.businessId ?? undefined)
      return res.status(200).json(updated)
    }

    if (action === 'add_to_reorder') {
      if (!reqItem.stockItemId) {
        return res.status(400).json({ error: 'Request must be linked to a stock item to add to reorder' })
      }
      const stockItem = await prisma.stockItem.findUnique({ where: { id: reqItem.stockItemId } })
      if (!stockItem || stockItem.businessId !== reqItem.businessId) {
        return res.status(404).json({ error: 'Stock item not found' })
      }
      const rr = await prisma.reorderList.create({ data: { businessId: user.businessId!, status: 'DRAFT', title: `Reorder from request ${id}`, estimatedTotalCost: 0, createdByUserId: user.id } })
      const est = Number(stockItem.costPerUnit ?? 0) * reqItem.requestedQuantity
      await prisma.reorderListItem.create({ data: { reorderListId: rr.id, stockItemId: stockItem.id, supplierId: stockItem.supplierId || undefined, quantity: reqItem.requestedQuantity, unit: stockItem.unit, estimatedCost: est, status: 'PENDING' } })
      const updated = await prisma.staffRequest.update({ where: { id }, data: { status: 'ADDED_TO_REORDER', reviewedByUserId: user.id, reviewedAt: new Date() } })
      await prisma.automationLog.create({ data: { businessId: user.businessId, type: 'staff_request_added_to_reorder', title: 'Staff request added to reorder', message: `Request ${id} added to reorder ${rr.id}`, status: 'SUCCESS' } })
      return res.status(200).json({ request: updated, reorderId: rr.id })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  return res.status(405).end()
}
