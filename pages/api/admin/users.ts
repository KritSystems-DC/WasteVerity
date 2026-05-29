import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/serverAuth'
import { createAuditLog } from '@/lib/audit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireRole(req, res, ['ADMIN'])
  if (!user) return

  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, businessId: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json({ users })
  }

  if (req.method === 'PUT') {
    const { id, role, businessId } = req.body
    if (!id) return res.status(400).json({ error: 'Missing user id' })
    const update: any = {}
    if (role) update.role = role
    if (businessId !== undefined) update.businessId = businessId
    const updated = await prisma.user.update({ where: { id }, data: update })
    await createAuditLog({ actorId: user.id, action: 'update_user', entity: 'User', entityId: id, metadata: { role, businessId } })
    return res.status(200).json({ user: updated })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
