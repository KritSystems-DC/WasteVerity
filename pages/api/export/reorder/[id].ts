import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { requireUser } from '../../../../lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(403).json({ error: 'Business context required' })
  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' })
  const reorder = await prisma.reorderList.findUnique({ where: { id }, include: { items: { include: { stockItem: true, supplier: true } } } })
  if (!reorder || reorder.businessId !== user.businessId) return res.status(404).json({ error: 'Not found' })

  const rows = reorder.items.map(i => ({ name: i.stockItem?.name ?? '', quantity: i.quantity, unit: i.unit, supplier: i.supplier?.name ?? '', estimatedCost: i.estimatedCost }))
  const cols = ['name','quantity','unit','supplier','estimatedCost'] as const
  type Row = typeof rows[number]
  const csv = [cols.join(',')].concat(rows.map(r => cols.map((c) => JSON.stringify(r[c] ?? '')).join(','))).join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="reorder-${id}.csv"`)
  res.status(200).send(csv)
}
