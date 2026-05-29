import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireUser } from '../../../lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const user = await requireUser(req, res)
  if (!user) return
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' })

  if (req.method === 'GET') {
    const sup = await prisma.supplier.findUnique({ where: { id } })
    if (!sup || sup.businessId !== user.businessId) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(sup)
  }

  if (req.method === 'PUT') {
    const existing = await prisma.supplier.findUnique({ where: { id } })
    if (!existing || existing.businessId !== user.businessId) return res.status(404).json({ error: 'Not found' })
    if (user.role === 'STAFF') return res.status(403).json({ error: 'Forbidden' })
    const { name, contactName, email, phone, website, address, notes } = req.body
    if (!name) return res.status(400).json({ error: 'Missing supplier name' })
    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        contactName: contactName || null,
        email: email || null,
        phone: phone || null,
        website: website || null,
        address: address || null,
        notes: notes || null,
      },
    })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    const existing = await prisma.supplier.findUnique({ where: { id } })
    if (!existing || existing.businessId !== user.businessId) return res.status(404).json({ error: 'Not found' })
    if (user.role === 'STAFF') return res.status(403).json({ error: 'Forbidden' })
    await prisma.supplier.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}
