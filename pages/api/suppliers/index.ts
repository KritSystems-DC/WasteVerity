import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireUser } from '../../../lib/serverAuth'
import { validateSupplier } from '../../../lib/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method
  const user = await requireUser(req, res)
  if (!user) return

  if (method === 'GET') {
    if (!user.businessId) return res.status(403).json({ error: 'Unauthorized' })
    const suppliers = await prisma.supplier.findMany({ where: { businessId: user.businessId } })
    return res.status(200).json(suppliers)
  }

  if (method === 'POST') {
    if (!user.businessId) return res.status(403).json({ error: 'Unauthorized' })
    if (user.role === 'STAFF') return res.status(403).json({ error: 'Forbidden' })
    const { name, contactName, email, phone, website, address, notes } = req.body
    const validation = validateSupplier(req.body)
    if (!validation.valid) return res.status(400).json({ errors: validation.errors })
    const created = await prisma.supplier.create({ data: { businessId: user.businessId, name, contactName, email, phone, website, address, notes } })
    return res.status(201).json(created)
  }

  return res.status(405).end()
}
