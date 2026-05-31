export const complianceFrequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'] as const

export type ComplianceFrequency = (typeof complianceFrequencies)[number]

export function isComplianceFrequency(value: unknown): value is ComplianceFrequency {
  return typeof value === 'string' && complianceFrequencies.includes(value as ComplianceFrequency)
}

export function nextDueDate(from: Date, frequency: ComplianceFrequency) {
  const next = new Date(from)
  if (frequency === 'Daily') next.setDate(next.getDate() + 1)
  if (frequency === 'Weekly') next.setDate(next.getDate() + 7)
  if (frequency === 'Monthly') next.setMonth(next.getMonth() + 1)
  if (frequency === 'Quarterly') next.setMonth(next.getMonth() + 3)
  if (frequency === 'Annual') next.setFullYear(next.getFullYear() + 1)
  return next
}
