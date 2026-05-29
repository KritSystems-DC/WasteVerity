import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(400).json({ error: 'Business not found' })

  if (req.method === 'GET') {
    const business = await prisma.business.findUnique({ where: { id: user.businessId } })
    if (!business) return res.status(404).json({ error: 'Business not found' })
    return res.status(200).json({
      name: business.name,
      type: business.type,
      ownerName: user.name,
      email: business.email,
      phone: business.phone,
      country: business.country,
      currency: business.currency,
      timezone: business.timezone,
      defaultUnitPreference: business.defaultUnitPreference,
      lowStockAlertEnabled: business.lowStockAlertEnabled,
    })
  }

  if (req.method === 'POST') {
    const { name, type, ownerName, email, phone, country, currency, timezone, defaultUnitPreference, lowStockAlertEnabled } = req.body
    if (!name || !type || !ownerName || !email) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const business = await prisma.business.update({
      where: { id: user.businessId },
      data: {
        name,
        type,
        email,
        phone: phone || null,
        country: country || null,
        currency: currency || 'GBP',
        timezone: timezone || 'Europe/London',
        defaultUnitPreference: defaultUnitPreference || 'item',
        lowStockAlertEnabled: lowStockAlertEnabled ?? true,
        setupCompleted: true,
      },
    })
    await prisma.user.update({
      where: { id: user.id },
      data: { name: ownerName },
    })

    return res.status(200).json(business)
  }

  return res.status(405).end()
}
