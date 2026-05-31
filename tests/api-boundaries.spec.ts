import { expect, test, type Page } from '@playwright/test'

const owner = { email: 'owner@wasteverity.demo', password: 'Password123!' }
const staff = { email: 'staff@wasteverity.demo', password: 'Password123!' }
const admin = { email: 'admin@wasteverity.demo', password: 'Password123!' }

async function login(page: Page, account: { email: string; password: string }, callbackUrl = '/dashboard') {
  await page.context().clearCookies()
  const csrf = await page.request.get('/api/auth/csrf')
  expect(csrf.status()).toBe(200)
  const { csrfToken } = await csrf.json()
  const auth = await page.request.post('/api/auth/callback/credentials?json=true', {
    form: {
      csrfToken,
      email: account.email,
      password: account.password,
      callbackUrl,
      json: 'true',
    },
  })
  expect(auth.status()).toBe(200)
  await page.goto(callbackUrl)
}

async function registerOwner(page: Page) {
  const timestamp = Date.now()
  const account = { email: `tenant-${timestamp}@wasteverity.test`, password: 'Password123!' }
  const register = await page.request.post('/api/auth/register', {
    data: {
      name: 'Tenant Owner',
      email: account.email,
      password: account.password,
      businessName: `Tenant Business ${timestamp}`,
      businessType: 'Cafe',
    },
  })
  expect(register.status()).toBe(201)
  return account
}

test.describe('protected API boundaries', () => {
  test('redirects anonymous protected API requests to login', async ({ request }) => {
    const stock = await request.get('/api/stock', { maxRedirects: 0 })
    expect(stock.status()).toBe(307)
    expect(stock.headers().location).toBe('/login?callbackUrl=%2Fapi%2Fstock')

    const adminStats = await request.get('/api/admin/stats', { maxRedirects: 0 })
    expect(adminStats.status()).toBe(307)
    expect(adminStats.headers().location).toBe('/login?callbackUrl=%2Fapi%2Fadmin%2Fstats')
  })

  test('limits admin APIs to admin users', async ({ browser }) => {
    const staffPage = await browser.newPage()
    const ownerPage = await browser.newPage()
    const adminPage = await browser.newPage()

    await login(staffPage, staff)
    const staffStats = await staffPage.request.get('/api/admin/stats')
    expect(staffStats.status()).toBe(403)

    await login(ownerPage, owner)
    const ownerStats = await ownerPage.request.get('/api/admin/stats')
    expect(ownerStats.status()).toBe(403)

    await login(adminPage, admin, '/admin')
    const adminStats = await adminPage.request.get('/api/admin/stats')
    expect(adminStats.status()).toBe(200)
    await expect(adminStats).toBeOK()

    await staffPage.close()
    await ownerPage.close()
    await adminPage.close()
  })

  test('blocks admin users from business-context APIs', async ({ page }) => {
    await login(page, admin, '/admin')

    const stock = await page.request.get('/api/stock')
    expect(stock.status()).toBe(403)
    await expect(await stock.json()).toMatchObject({ error: 'Business context required' })
  })

  test('prevents staff from mutating owner-only supplier records', async ({ browser }) => {
    const ownerPage = await browser.newPage()
    const staffPage = await browser.newPage()

    await login(ownerPage, owner)
    const createSupplier = await ownerPage.request.post('/api/suppliers', {
      data: {
        name: `API Boundary Supplier ${Date.now()}`,
        contactName: 'QA Contact',
        email: 'api-boundary@example.com',
      },
    })
    expect(createSupplier.status()).toBe(201)
    const supplier = await createSupplier.json()

    await login(staffPage, staff)
    const updateAsStaff = await staffPage.request.put(`/api/suppliers/${supplier.id}`, {
      data: {
        name: `${supplier.name} Staff Edit`,
      },
    })

    expect(updateAsStaff.status()).toBe(403)
    await expect(await updateAsStaff.json()).toMatchObject({ error: 'Forbidden' })

    await ownerPage.close()
    await staffPage.close()
  })

  test('validates core API inputs', async ({ page }) => {
    await login(page, owner)

    const stock = await page.request.post('/api/stock', {
      data: { name: '', currentQuantity: -1, minimumQuantity: -1, reorderAmount: 1, costPerUnit: -1 },
    })
    expect(stock.status()).toBe(400)

    const supplier = await page.request.post('/api/suppliers', {
      data: { name: '', email: 'not-an-email' },
    })
    expect(supplier.status()).toBe(400)

    const waste = await page.request.post('/api/waste', {
      data: { stockItemId: '', quantity: 0 },
    })
    expect(waste.status()).toBe(400)

    const request = await page.request.post('/api/staff-requests', {
      data: { itemName: 'Invalid request', requestedQuantity: 0 },
    })
    expect(request.status()).toBe(400)
  })

  test('keeps business data isolated across tenants', async ({ browser }) => {
    const ownerPage = await browser.newPage()
    const tenantPage = await browser.newPage()

    await login(ownerPage, owner)
    const ownerSupplierRes = await ownerPage.request.post('/api/suppliers', {
      data: { name: `Tenant Boundary Supplier ${Date.now()}`, email: 'tenant-boundary@example.com' },
    })
    expect(ownerSupplierRes.status()).toBe(201)
    const ownerSupplier = await ownerSupplierRes.json()

    const ownerStockRes = await ownerPage.request.post('/api/stock', {
      data: {
        name: `Tenant Boundary Stock ${Date.now()}`,
        currentQuantity: 5,
        minimumQuantity: 1,
        reorderAmount: 5,
        unit: 'item',
        costPerUnit: 1,
      },
    })
    expect(ownerStockRes.status()).toBe(201)
    const ownerStock = await ownerStockRes.json()

    const tenant = await registerOwner(tenantPage)
    await login(tenantPage, tenant)
    const tenantStockRes = await tenantPage.request.post('/api/stock', {
      data: {
        name: `Tenant Own Stock ${Date.now()}`,
        currentQuantity: 5,
        minimumQuantity: 1,
        reorderAmount: 5,
        unit: 'item',
        costPerUnit: 1,
      },
    })
    expect(tenantStockRes.status()).toBe(201)
    const tenantStock = await tenantStockRes.json()

    const crossRead = await tenantPage.request.get(`/api/stock/${ownerStock.id}`)
    expect(crossRead.status()).toBe(404)

    const crossWaste = await tenantPage.request.post('/api/waste', {
      data: { stockItemId: ownerStock.id, quantity: 1, reason: 'cross tenant attempt' },
    })
    expect(crossWaste.status()).toBe(404)

    const crossSupplierUpdate = await tenantPage.request.put(`/api/stock/${tenantStock.id}`, {
      data: {
        name: tenantStock.name,
        currentQuantity: tenantStock.currentQuantity,
        minimumQuantity: tenantStock.minimumQuantity,
        reorderAmount: tenantStock.reorderAmount,
        unit: tenantStock.unit,
        costPerUnit: Number(tenantStock.costPerUnit),
        supplierId: ownerSupplier.id,
        status: tenantStock.status,
      },
    })
    expect(crossSupplierUpdate.status()).toBe(400)
    await expect(await crossSupplierUpdate.json()).toMatchObject({ error: 'Invalid supplier' })

    await ownerPage.close()
    await tenantPage.close()
  })

  test('limits team management and notification preferences to owners', async ({ page }) => {
    await login(page, staff)
    const staffCreateTeamUser = await page.request.post('/api/team', {
      data: {
        name: 'Staff Created User',
        email: `staff-created-${Date.now()}@wasteverity.test`,
        password: 'Password123!',
        role: 'STAFF',
      },
    })
    expect(staffCreateTeamUser.status()).toBe(403)

    const staffNotifications = await page.request.put('/api/notifications/preferences', {
      data: { lowStockAlertEnabled: true, emailEnabled: true, smsEnabled: false, whatsappEnabled: false },
    })
    expect(staffNotifications.status()).toBe(403)

    await login(page, owner)
    const createdTeamUser = await page.request.post('/api/team', {
      data: {
        name: 'QA Team User',
        email: `qa-team-${Date.now()}@wasteverity.test`,
        password: 'Password123!',
        role: 'STAFF',
      },
    })
    expect(createdTeamUser.status()).toBe(201)

    const saveNotifications = await page.request.put('/api/notifications/preferences', {
      data: {
        lowStockAlertEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        whatsappEnabled: false,
        emailFrom: 'ops@wasteverity.test',
      },
    })
    expect(saveNotifications.status()).toBe(200)
  })

  test('reports missing Stripe config for customer portal', async ({ page }) => {
    await login(page, owner)
    const portal = await page.request.post('/api/stripe/create-portal-session')
    expect([501, 404]).toContain(portal.status())
  })
})
