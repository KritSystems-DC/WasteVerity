import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'
import { validateEmail, validatePassword } from '@/lib/validation'

function canManageTeam(role: string) {
  return role === 'OWNER'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(403).json({ error: 'Business context required' })

  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      where: { businessId: user.businessId },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    })
    return res.status(200).json(users)
  }

  if (req.method === 'POST') {
    if (!canManageTeam(user.role)) return res.status(403).json({ error: 'Forbidden' })

    const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''
    const role = req.body.role === 'OWNER' ? 'OWNER' : 'STAFF'
    const errors: string[] = []

    if (!name) errors.push('Name is required.')
    if (!validateEmail(email)) errors.push('A valid email address is required.')
    const passwordValidation = validatePassword(password)
    errors.push(...passwordValidation.errors.map((error) => error.message))
    if (errors.length > 0) return res.status(400).json({ errors })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'An account already exists for this email address.' })

    const passwordHash = await bcrypt.hash(password, 10)
    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        businessId: user.businessId,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    })

    await prisma.automationLog.create({
      data: {
        businessId: user.businessId,
        type: 'team_user_created',
        title: 'Team user created',
        message: `${user.email} created ${created.email} as ${created.role}`,
        status: 'SUCCESS',
      },
    })

    return res.status(201).json(created)
  }

  return res.status(405).end()
}
