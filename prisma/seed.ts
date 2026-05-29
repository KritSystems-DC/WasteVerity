import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data...')

  // Hash password
  const hashedPassword = await bcrypt.hash('Password123!', 10)

  // Create demo users
  const owner = await prisma.user.upsert({
    where: { email: 'owner@stocksense.demo' },
    update: {},
    create: {
      name: 'Demo Owner',
      email: 'owner@stocksense.demo',
      passwordHash: hashedPassword,
      role: 'OWNER',
    }
  })

  const staff = await prisma.user.upsert({
    where: { email: 'staff@stocksense.demo' },
    update: {},
    create: {
      name: 'Demo Staff',
      email: 'staff@stocksense.demo',
      passwordHash: hashedPassword,
      role: 'STAFF'
    }
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stocksense.demo' },
    update: {},
    create: {
      name: 'Platform Admin',
      email: 'admin@stocksense.demo',
      passwordHash: hashedPassword,
      role: 'ADMIN'
    }
  })

  const existingDemoSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: 'cus_demo123' },
    include: { business: true }
  })
  const existingDemoBusiness = existingDemoSubscription?.business || await prisma.business.findFirst({
    where: { ownerId: owner.id, email: 'demo@cafe.example' }
  })

  // Create demo business
  const demoBusiness = existingDemoBusiness ? await prisma.business.update({
    where: { id: existingDemoBusiness.id },
    data: {
      name: 'Demo Cafe',
      type: 'cafe',
      ownerId: owner.id,
      email: 'demo@cafe.example',
      phone: '020 7123 4567',
      country: 'GB',
      currency: 'GBP',
      timezone: 'Europe/London',
      status: 'ACTIVE',
      setupCompleted: true
    }
  }) : await prisma.business.create({
    data: {
      name: 'Demo Café',
      type: 'cafe',
      ownerId: owner.id,
      email: 'demo@cafe.example',
      phone: '020 7123 4567',
      country: 'GB',
      currency: 'GBP',
      timezone: 'Europe/London',
      status: 'ACTIVE',
      setupCompleted: true
    }
  })

  // assign users to business
  await prisma.user.update({ where: { id: owner.id }, data: { businessId: demoBusiness.id } })
  await prisma.user.update({ where: { id: staff.id }, data: { businessId: demoBusiness.id } })

  // Suppliers
  const suppliers = [
    { name: 'Fresh Foods Ltd', contactName: 'John Smith', email: 'john@freshfoods.co.uk', phone: '020 7111 1111' },
    { name: 'Packaging World', contactName: 'Sarah Johnson', email: 'sales@packworld.example', phone: '0121 555 2222' },
    { name: 'Cleaning Supplies Co', contactName: 'Mike Brown', email: 'hello@cleaning.example', phone: '0131 444 3333' }
  ]

  const createdSuppliers = []
  for (const s of suppliers) {
    const sup = await prisma.supplier.upsert({
      where: { businessId_name: { businessId: demoBusiness.id, name: s.name } },
      update: s,
      create: { ...s, businessId: demoBusiness.id }
    })
    createdSuppliers.push(sup)
  }

  // Stock items
  const items = [
    { name: 'Coffee Beans', sku: 'CB-001', category: 'Beverages', supplier: createdSuppliers[0], qty: 8, min: 10, reorder: 20, cost: 12.50, sell: 4.50 },
    { name: 'Milk', sku: 'MK-001', category: 'Dairy', supplier: createdSuppliers[0], qty: 12, min: 10, reorder: 30, cost: 0.95, sell: 0.50, expiryDays: 7 },
    { name: 'Takeaway Cups 12oz', sku: 'CUPS-012', category: 'Packaging', supplier: createdSuppliers[1], qty: 250, min: 500, reorder: 1000, cost: 0.15 },
    { name: 'Sugar Sachets', sku: 'SUGAR-S', category: 'Condiments', supplier: createdSuppliers[0], qty: 500, min: 200, reorder: 1000, cost: 0.02 },
    { name: 'Burger Buns', sku: 'BUN-BURGER', category: 'Bakery', supplier: createdSuppliers[0], qty: 0, min: 20, reorder: 50, cost: 2.30, sell: 1.50, expiryDays: 2 },
    { name: 'Cheese Slices', sku: 'CHEESE-SLICES', category: 'Dairy', supplier: createdSuppliers[0], qty: 8, min: 20, reorder: 40, cost: 3.20, sell: 0.80 },
    { name: 'Black Latex Gloves', sku: 'GLOVES-BLK', category: 'Safety', supplier: createdSuppliers[1], qty: 2, min: 5, reorder: 10, cost: 8.50 },
    { name: 'Cleaning Spray', sku: 'CLEAN-SPRAY', category: 'Cleaning', supplier: createdSuppliers[2], qty: 15, min: 10, reorder: 20, cost: 2.80 },
    { name: 'Napkins', sku: 'NAPKINS', category: 'Packaging', supplier: createdSuppliers[1], qty: 1000, min: 500, reorder: 2000, cost: 0.01 }
  ]

  for (const it of items) {
    const expiry = it.expiryDays ? new Date(Date.now() + it.expiryDays * 24 * 3600 * 1000) : null
    const stockData = {
      businessId: demoBusiness.id,
      supplierId: it.supplier ? it.supplier.id : undefined,
      name: it.name,
      sku: it.sku,
      category: it.category,
      currentQuantity: it.qty,
      minimumQuantity: it.min,
      reorderAmount: it.reorder,
      unit: 'item',
      costPerUnit: new Decimal(it.cost),
      sellingPrice: it.sell ? new Decimal(it.sell) : undefined,
      expiryDate: expiry ? expiry : undefined
    }
    const created = await prisma.stockItem.upsert({
      where: { businessId_name: { businessId: demoBusiness.id, name: it.name } },
      update: stockData,
      create: stockData
    })

    // Price history sample
    if (it.supplier) {
      await prisma.priceHistory.create({
        data: {
          businessId: demoBusiness.id,
          stockItemId: created.id,
          supplierId: it.supplier.id,
          oldPrice: new Decimal(it.cost * 0.9),
          newPrice: new Decimal(it.cost),
          changedByUserId: owner.id,
          reason: 'Price increase from supplier'
        }
      })
    }

    // Low stock movements for some
    if (created.currentQuantity <= created.minimumQuantity) {
      await prisma.lowStockAlert.upsert({
        where: { businessId_stockItemId_status: { businessId: demoBusiness.id, stockItemId: created.id, status: 'ACTIVE' } },
        update: {
          message: `Low stock: ${created.name} is down to ${created.currentQuantity}. Suggested reorder: ${created.reorderAmount}.`
        },
        create: {
          businessId: demoBusiness.id,
          stockItemId: created.id,
          message: `Low stock: ${created.name} is down to ${created.currentQuantity}. Suggested reorder: ${created.reorderAmount}.`,
          status: 'ACTIVE'
        }
      })
    }
  }

  // Create subscription
  await prisma.subscription.upsert({
    where: { stripeCustomerId: 'cus_demo123' },
    update: {
      businessId: demoBusiness.id,
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    create: {
      businessId: demoBusiness.id,
      stripeCustomerId: 'cus_demo123',
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  // Create automation log
  await prisma.automationLog.create({
    data: {
      businessId: demoBusiness.id,
      type: 'SEED_COMPLETED',
      title: 'Database seeded',
      message: 'Seed script completed successfully',
      status: 'SUCCESS'
    }
  })

  console.log('✅ Seeding complete.')
  console.log('\n📱 Demo Credentials:')
  console.log('Owner: owner@stocksense.demo / Password123!')
  console.log('Staff: staff@stocksense.demo / Password123!')
  console.log('Admin: admin@stocksense.demo / Password123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
