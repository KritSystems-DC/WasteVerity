import { getServerSession } from 'next-auth'
import { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from './auth'
import { prisma } from './prisma'

export async function getSessionUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req as any, res as any, authOptions)
  if (!session || !session.user || !session.user.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  return user
}

export async function requireUser(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return user
}

export async function requireRole(req: NextApiRequest, res: NextApiResponse, roles: string[]) {
  const user = await requireUser(req, res)
  if (!user) return null
  if (!roles.includes(user.role)) {
    res.status(403).json({ error: 'Forbidden' })
    return null
  }
  return user
}
