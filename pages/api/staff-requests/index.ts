import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireUser } from '../../../lib/serverAuth'
import { sendEmail } from '../../../lib/notifications'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  const method = req.method

  if (method === 'GET') {
    // Staff see their own requests; owners/admin see all for the business
    if (user.role === 'STAFF') {
      const requests = await prisma.staffRequest.findMany({ where: { submittedByUserId: user.id }, include: { submittedByUser: true, reviewedByUser: true } })
      return res.status(200).json(requests)
    }
    if (!user.businessId) return res.status(403).json({ error: 'Unauthorized' })
    const requests = await prisma.staffRequest.findMany({ where: { businessId: user.businessId }, include: { submittedByUser: true, reviewedByUser: true } })
    return res.status(200).json(requests)
  }

  if (method === 'POST') {
    if (!user.businessId) return res.status(403).json({ error: 'Unauthorized' })
    const { stockItemId, itemName, requestedQuantity, reason, urgency } = req.body
    if (!itemName && !stockItemId) return res.status(400).json({ error: 'Provide itemName or stockItemId' })
    if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) return res.status(400).json({ error: 'requestedQuantity must be a positive integer' })
    const stockItem = stockItemId ? await prisma.stockItem.findUnique({ where: { id: stockItemId } }) : null
    if (stockItemId && (!stockItem || stockItem.businessId !== user.businessId)) {
      return res.status(404).json({ error: 'Stock item not found' })
    }

    const created = await prisma.staffRequest.create({ data: {
      businessId: user.businessId,
      stockItemId: stockItemId || undefined,
      itemName: itemName || stockItem?.name || '',
      requestedQuantity: requestedQuantity,
      reason: reason || undefined,
      urgency: urgency || 'NORMAL',
      status: 'PENDING',
      submittedByUserId: user.id
    }})

    await prisma.automationLog.create({ data: { businessId: user.businessId, type: 'staff_request', title: 'Staff request submitted', message: `Request ${created.id} by ${user.email}`, status: 'SUCCESS' } })

    // notify owner by email placeholder
    const owner = await prisma.user.findFirst({ where: { businessId: user.businessId, role: 'OWNER' } })
    if (owner?.email) await sendEmail(owner.email, 'Staff request submitted', `A staff member submitted a request: ${created.itemName}` , user.businessId)

    return res.status(201).json(created)
  }

  return res.status(405).end()
}
