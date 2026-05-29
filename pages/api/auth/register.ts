import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { validateBusinessName, validateEmail, validatePassword } from '@/lib/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, email, password, businessName, businessType } = req.body
  const trimmedName = typeof name === 'string' ? name.trim() : ''
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const trimmedBusinessName = typeof businessName === 'string' ? businessName.trim() : ''
  const trimmedBusinessType = typeof businessType === 'string' && businessType.trim() ? businessType.trim() : 'Other'
  const errors: string[] = []

  if (!trimmedName) errors.push('Name is required.')
  if (!validateEmail(trimmedEmail)) errors.push('A valid email address is required.')

  const passwordValidation = validatePassword(typeof password === 'string' ? password : '')
  errors.push(...passwordValidation.errors.map((error) => error.message))

  const businessValidation = validateBusinessName(trimmedBusinessName)
  errors.push(...businessValidation.errors.map((error) => error.message))

  if (errors.length > 0) return res.status(400).json({ errors })

  try {
    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } })
    if (existing) return res.status(409).json({ error: 'An account already exists for this email address.' })
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: trimmedName,
          email: trimmedEmail,
          passwordHash,
          role: 'OWNER',
        },
      })
      const business = await tx.business.create({
        data: {
          name: trimmedBusinessName,
          type: trimmedBusinessType,
          ownerId: user.id,
          email: trimmedEmail,
          status: 'SETUP_REQUIRED',
        },
      })
      await tx.user.update({ where: { id: user.id }, data: { businessId: business.id } })
    })
    return res.status(201).json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
