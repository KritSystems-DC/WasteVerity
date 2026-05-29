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

function mask(value) {
  if (!value) return ''
  if (value.length <= 8) return '***'
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

loadEnvFile(path.join(process.cwd(), '.env'))
loadEnvFile(path.join(process.cwd(), '.env.local'))
loadEnvFile(path.join(process.cwd(), '.env.production'))
loadEnvFile(path.join(process.cwd(), '.env.production.local'))

const required = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'APP_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_ID',
  'STRIPE_WEBHOOK_SECRET',
]

const optional = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'EMAIL_FROM',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
]

const missing = required.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error('Missing required production environment variables:')
  for (const key of missing) console.error(`- ${key}`)
  console.error('\nSet these in your deployment platform secrets, or in .env.production.local for a local production check.')
  process.exit(1)
}

console.log('Required production environment variables are present:')
for (const key of required) {
  console.log(`- ${key}=${mask(process.env[key])}`)
}

console.log('\nOptional environment variables:')
for (const key of optional) {
  const value = process.env[key]
  console.log(`- ${key}=${value ? mask(value) : '(not set)'}`)
}
