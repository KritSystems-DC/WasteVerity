const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = value
  }
}

function requireValue(key) {
  const value = process.env[key]?.trim()
  if (!value) throw new Error(`${key} is required.`)
  return value
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password) {
  const errors = []
  if (password.length < 12) errors.push('ADMIN_PASSWORD must be at least 12 characters for admin accounts.')
  if (!/[A-Z]/.test(password)) errors.push('ADMIN_PASSWORD must contain an uppercase letter.')
  if (!/[a-z]/.test(password)) errors.push('ADMIN_PASSWORD must contain a lowercase letter.')
  if (!/[0-9]/.test(password)) errors.push('ADMIN_PASSWORD must contain a number.')
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('ADMIN_PASSWORD must contain a symbol.')
  return errors
}

async function main() {
  loadEnvFile(path.join(process.cwd(), '.env'))
  loadEnvFile(path.join(process.cwd(), '.env.local'))
  loadEnvFile(path.join(process.cwd(), '.env.production.local'))

  if (process.env.CONFIRM_CREATE_ADMIN !== 'CREATE_ADMIN') {
    throw new Error('Set CONFIRM_CREATE_ADMIN=CREATE_ADMIN to confirm this controlled admin creation operation.')
  }

  const email = requireValue('ADMIN_EMAIL').toLowerCase()
  const name = requireValue('ADMIN_NAME')
  const password = requireValue('ADMIN_PASSWORD')

  if (!validateEmail(email)) throw new Error('ADMIN_EMAIL must be a valid email address.')
  if (email.endsWith('@stocksense.demo') && process.env.ADMIN_ALLOW_DEMO !== 'true') {
    throw new Error('Refusing to create a demo-domain admin. Use a real production email address.')
  }

  const passwordErrors = validatePassword(password)
  if (passwordErrors.length > 0) throw new Error(passwordErrors.join('\n'))

  const prisma = new PrismaClient()
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      if (existing.role !== 'ADMIN') {
        throw new Error(`A non-admin user already exists for ${email}. Refusing to promote it automatically.`)
      }
      throw new Error(`Admin user already exists for ${email}. No changes made.`)
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'ADMIN',
      },
    })

    console.log(`Admin account created for ${email}.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
