import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

const INTEGRATION_TYPE = 'notification_preferences'

function asBoolean(value: unknown) {
  return value === true
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(403).json({ error: 'Business context required' })

  if (req.method === 'GET') {
    const business = await prisma.business.findUnique({ where: { id: user.businessId } })
    const integration = await prisma.integration.findUnique({
      where: { businessId_type: { businessId: user.businessId, type: INTEGRATION_TYPE } },
    })
    const config = (integration?.config || {}) as Record<string, unknown>
    return res.status(200).json({
      lowStockAlertEnabled: business?.lowStockAlertEnabled ?? true,
      emailEnabled: config.emailEnabled === undefined ? true : Boolean(config.emailEnabled),
      smsEnabled: Boolean(config.smsEnabled),
      whatsappEnabled: Boolean(config.whatsappEnabled),
      emailFrom: typeof config.emailFrom === 'string' ? config.emailFrom : '',
      smsProvider: typeof config.smsProvider === 'string' ? config.smsProvider : '',
      whatsappProvider: typeof config.whatsappProvider === 'string' ? config.whatsappProvider : '',
    })
  }

  if (req.method === 'PUT') {
    if (user.role === 'STAFF') return res.status(403).json({ error: 'Forbidden' })
    const emailFrom = typeof req.body.emailFrom === 'string' ? req.body.emailFrom.trim() : ''
    const smsProvider = typeof req.body.smsProvider === 'string' ? req.body.smsProvider.trim() : ''
    const whatsappProvider = typeof req.body.whatsappProvider === 'string' ? req.body.whatsappProvider.trim() : ''
    const config = {
      emailEnabled: asBoolean(req.body.emailEnabled),
      smsEnabled: asBoolean(req.body.smsEnabled),
      whatsappEnabled: asBoolean(req.body.whatsappEnabled),
      emailFrom,
      smsProvider,
      whatsappProvider,
    }

    await prisma.$transaction([
      prisma.business.update({
        where: { id: user.businessId },
        data: { lowStockAlertEnabled: asBoolean(req.body.lowStockAlertEnabled) },
      }),
      prisma.integration.upsert({
        where: { businessId_type: { businessId: user.businessId, type: INTEGRATION_TYPE } },
        update: { status: 'active', config },
        create: { businessId: user.businessId, type: INTEGRATION_TYPE, status: 'active', config },
      }),
      prisma.automationLog.create({
        data: {
          businessId: user.businessId,
          type: 'notification_preferences_updated',
          title: 'Notification preferences updated',
          message: `${user.email} updated notification preferences`,
          status: 'INFO',
        },
      }),
    ])

    return res.status(200).json({ lowStockAlertEnabled: asBoolean(req.body.lowStockAlertEnabled), ...config })
  }

  return res.status(405).end()
}
