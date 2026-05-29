import { prisma } from './prisma'

export async function createAuditLog(params: {
  actorId?: string
  businessId?: string | null
  action: string
  entity?: string
  entityId?: string
  metadata?: any
}) {
  const { actorId, businessId, action, entity, entityId, metadata } = params
  try {
    await prisma.automationLog.create({
      data: {
        businessId: businessId || null,
        type: 'audit',
        title: action,
        message: `${actorId || 'system'} performed ${action}${entity ? ` on ${entity}` : ''}${entityId ? ` (${entityId})` : ''}`,
        metadata: { actorId, entity, entityId, details: metadata },
      },
    })
  } catch (err) {
    // best-effort logging; avoid throwing
    console.error('createAuditLog error', err)
  }
}
