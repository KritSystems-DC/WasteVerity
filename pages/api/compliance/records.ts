import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'
import { complianceTemplates } from '@/lib/complianceTemplates'

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
    const { templateId, values } = req.body
    const template = complianceTemplates.find((item) => item.id === templateId)
    if (!template) return res.status(400).json({ error: 'Unknown compliance template' })
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      return res.status(400).json({ error: 'Compliance form values are required' })
    }

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

    const record = await prisma.complianceRecord.create({
      data: {
        businessId: user.businessId,
        templateId: template.id,
        title: template.title,
        category: template.category,
        cadence: template.cadence,
        owner: template.owner,
        purpose: template.purpose,
        values: cleanedValues,
        completedByUserId: user.id,
      },
      include: { completedByUser: { select: { name: true, email: true } } },
    })

    await prisma.automationLog.create({
      data: {
        businessId: user.businessId,
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
