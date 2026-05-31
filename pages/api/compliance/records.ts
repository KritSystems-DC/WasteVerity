import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'
import { complianceTemplates } from '@/lib/complianceTemplates'
import { isComplianceFrequency, nextDueDate } from '@/lib/complianceSchedule'

function normaliseValue(value: unknown) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''
  if (typeof value === 'string') return value.trim()
  return ''
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(400).json({ error: 'Business context required' })
  const businessId = user.businessId

  if (req.method === 'GET') {
    const records = await prisma.complianceRecord.findMany({
      where: { businessId: user.businessId },
      include: { completedByUser: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return res.status(200).json(records)
  }

  if (req.method === 'POST') {
    const { templateId, values, scheduleId } = req.body
    const template = complianceTemplates.find((item) => item.id === templateId)
    if (!template) return res.status(400).json({ error: 'Unknown compliance template' })
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      return res.status(400).json({ error: 'Compliance form values are required' })
    }

    const schedule = typeof scheduleId === 'string' && scheduleId
      ? await prisma.complianceSchedule.findFirst({ where: { id: scheduleId, businessId, isActive: true } })
      : null
    if (scheduleId && !schedule) return res.status(404).json({ error: 'Schedule not found' })
    if (schedule && schedule.templateId !== template.id) return res.status(400).json({ error: 'Schedule does not match template' })

    const cleanedValues: Record<string, string | boolean> = {}
    const missingFields: string[] = []

    for (const field of template.fields) {
      const value = normaliseValue((values as Record<string, unknown>)[field.label])
      cleanedValues[field.label] = value
      if (field.required && (value === '' || value === false)) {
        missingFields.push(field.label)
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({ error: 'Missing required fields', fields: missingFields })
    }

    const completedAt = new Date()
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.complianceRecord.create({
        data: {
          businessId,
          templateId: template.id,
          title: template.title,
          category: template.category,
          cadence: template.cadence,
          owner: template.owner,
          purpose: template.purpose,
          values: cleanedValues,
          scheduleId: schedule?.id,
          completedByUserId: user.id,
        },
        include: { completedByUser: { select: { name: true, email: true } } },
      })

      if (schedule && isComplianceFrequency(schedule.frequency)) {
        await tx.complianceSchedule.update({
          where: { id: schedule.id },
          data: {
            lastCompletedAt: completedAt,
            nextDueAt: nextDueDate(completedAt, schedule.frequency),
          },
        })
      }

      return created
    })

    await prisma.automationLog.create({
      data: {
        businessId,
        type: 'COMPLIANCE_RECORD_CREATED',
        title: 'Compliance record completed',
        message: `${user.name} completed ${template.title}.`,
        metadata: { complianceRecordId: record.id, templateId: template.id },
        status: 'SUCCESS',
      },
    })

    return res.status(201).json(record)
  }

  return res.status(405).end()
}
