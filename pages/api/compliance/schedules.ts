import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'
import { complianceTemplates } from '@/lib/complianceTemplates'
import { isComplianceFrequency } from '@/lib/complianceSchedule'

function parseDate(value: unknown) {
  if (typeof value !== 'string' || !value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(400).json({ error: 'Business context required' })

  if (req.method === 'GET') {
    const schedules = await prisma.complianceSchedule.findMany({
      where: { businessId: user.businessId },
      orderBy: [{ isActive: 'desc' }, { nextDueAt: 'asc' }],
      include: { records: { select: { id: true }, take: 1 } },
    })
    return res.status(200).json(schedules)
  }

  if (req.method === 'POST') {
    const { templateId, frequency, nextDueAt, owner } = req.body
    const template = complianceTemplates.find((item) => item.id === templateId)
    const dueDate = parseDate(nextDueAt)
    if (!template) return res.status(400).json({ error: 'Unknown compliance template' })
    if (!isComplianceFrequency(frequency)) return res.status(400).json({ error: 'Invalid frequency' })
    if (!dueDate) return res.status(400).json({ error: 'Valid next due date is required' })

    const schedule = await prisma.complianceSchedule.create({
      data: {
        businessId: user.businessId,
        templateId: template.id,
        title: template.title,
        category: template.category,
        frequency,
        owner: typeof owner === 'string' && owner.trim() ? owner.trim() : template.owner,
        nextDueAt: dueDate,
      },
      include: { records: { select: { id: true }, take: 1 } },
    })

    return res.status(201).json(schedule)
  }

  if (req.method === 'PATCH') {
    const id = typeof req.body.id === 'string' ? req.body.id : ''
    const isActive = Boolean(req.body.isActive)
    if (!id) return res.status(400).json({ error: 'Schedule id is required' })

    const schedule = await prisma.complianceSchedule.updateMany({
      where: { id, businessId: user.businessId },
      data: { isActive },
    })
    if (schedule.count === 0) return res.status(404).json({ error: 'Schedule not found' })
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}
