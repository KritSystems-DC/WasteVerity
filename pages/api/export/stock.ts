import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireUser } from '../../../lib/serverAuth'

function csvValue(value: unknown) {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function toCsv(rows: any[], cols: string[]) {
  const lines = [cols.join(',')]
  for (const r of rows) {
    lines.push(cols.map(c => csvValue(r[c])).join(','))
  }
  return lines.join('\n')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user || !user.businessId) {
    return res.status(403).json({ error: 'Unauthorized' })
  }
  const items = await prisma.stockItem.findMany({ where: { businessId: user.businessId } })
  const rows = items.map(i => ({ id: i.id, name: i.name, sku: i.sku, currentQuantity: i.currentQuantity, minimumQuantity: i.minimumQuantity, reorderAmount: i.reorderAmount, unit: i.unit, costPerUnit: i.costPerUnit?.toString(), sellingPrice: i.sellingPrice?.toString(), expiryDate: i.expiryDate }))
  const csv = toCsv(rows, ['id', 'name', 'sku', 'currentQuantity', 'minimumQuantity', 'reorderAmount', 'unit', 'costPerUnit', 'sellingPrice', 'expiryDate'])
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="stock.csv"')
  res.status(200).send(csv)
}
