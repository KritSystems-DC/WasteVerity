import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireRole(req, res, ['ADMIN'])
  if (!user) return

  if (req.method === 'GET') {
    const { businessId, userId } = req.query
    const where: any = {}
    if (businessId) where.businessId = String(businessId)
    if (userId) where.userId = String(userId)
    const notes = await prisma.adminNote.findMany({ where, orderBy: { createdAt: 'desc' } })
    return res.status(200).json({ notes })
  }

  if (req.method === 'POST') {
    const { businessId, userId, note } = req.body
    if (!note) return res.status(400).json({ error: 'Note is required' })
    const created = await prisma.adminNote.create({ data: { businessId: businessId || null, userId: userId || null, adminUserId: user.id, note } })
    await createAuditLog({ actorId: user.id, businessId: businessId || null, action: 'create_admin_note', entity: 'AdminNote', entityId: created.id, metadata: { userId } })
    return res.status(201).json({ note: created })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'Missing id' })
    await prisma.adminNote.delete({ where: { id } })
    await createAuditLog({ actorId: user.id, action: 'delete_admin_note', entity: 'AdminNote', entityId: id })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
