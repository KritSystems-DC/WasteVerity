import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

function canManageTeam(role: string) {
  return role === 'OWNER'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(403).json({ error: 'Business context required' })
  if (!canManageTeam(user.role)) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' })
  if (id === user.id && req.method !== 'GET') return res.status(400).json({ error: 'You cannot modify your own team access here.' })

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target || target.businessId !== user.businessId) return res.status(404).json({ error: 'Not found' })

  if (req.method === 'PUT') {
    const role = req.body.role === 'OWNER' ? 'OWNER' : 'STAFF'
    if (target.role === 'OWNER' && role !== 'OWNER') {
      const ownerCount = await prisma.user.count({ where: { businessId: user.businessId, role: 'OWNER' } })
      if (ownerCount <= 1) return res.status(400).json({ error: 'At least one owner must remain on the business.' })
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    })
    await prisma.automationLog.create({
      data: {
        businessId: user.businessId,
        type: 'team_user_role_updated',
        title: 'Team user role updated',
        message: `${user.email} changed ${updated.email} to ${updated.role}`,
        status: 'SUCCESS',
      },
    })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    if (target.role === 'OWNER') {
      const ownerCount = await prisma.user.count({ where: { businessId: user.businessId, role: 'OWNER' } })
      if (ownerCount <= 1) return res.status(400).json({ error: 'At least one owner must remain on the business.' })
    }
    await prisma.user.update({ where: { id }, data: { businessId: null } })
    await prisma.automationLog.create({
      data: {
        businessId: user.businessId,
        type: 'team_user_removed',
        title: 'Team user removed',
        message: `${user.email} removed ${target.email} from the business`,
        status: 'SUCCESS',
      },
    })
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}
