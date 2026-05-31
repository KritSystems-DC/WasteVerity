const { PrismaClient } = require('@prisma/client')

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Smoke tests require DATABASE_URL to point at a reachable PostgreSQL database.')
    console.error('Example: DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/wasteverity?schema=public')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out connecting to DATABASE_URL')), 5000)),
    ])
  } catch (error) {
    console.error('Smoke tests require a reachable PostgreSQL database at DATABASE_URL.')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
