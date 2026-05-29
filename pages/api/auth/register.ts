import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, email, password } = req.body
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' })
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ error: 'User exists' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, email, passwordHash, role: 'OWNER' } })
    const business = await prisma.business.create({ data: { name: `${name}'s business`, type: 'Other', ownerId: user.id, email, status: 'SETUP_REQUIRED' } })
    await prisma.user.update({ where: { id: user.id }, data: { businessId: business.id } })
    return res.status(201).json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
