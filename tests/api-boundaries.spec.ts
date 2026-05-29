import { expect, test, type Page } from '@playwright/test'

const owner = { email: 'owner@healthserve.demo', password: 'Password123!' }
const staff = { email: 'staff@healthserve.demo', password: 'Password123!' }
const admin = { email: 'admin@healthserve.demo', password: 'Password123!' }

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

test.describe('protected API boundaries', () => {
  test('redirects anonymous protected API requests to login', async ({ request }) => {
    const stock = await request.get('/api/stock', { maxRedirects: 0 })
    expect(stock.status()).toBe(307)
    expect(stock.headers().location).toBe('/login?callbackUrl=%2Fapi%2Fstock')

    const adminStats = await request.get('/api/admin/stats', { maxRedirects: 0 })
    expect(adminStats.status()).toBe(307)
    expect(adminStats.headers().location).toBe('/login?callbackUrl=%2Fapi%2Fadmin%2Fstats')
  })

  test('limits admin APIs to admin users', async ({ page }) => {
    await login(page, staff)
    const staffStats = await page.request.get('/api/admin/stats')
    expect(staffStats.status()).toBe(403)

    await login(page, owner)
    const ownerStats = await page.request.get('/api/admin/stats')
    expect(ownerStats.status()).toBe(403)

    await login(page, admin, '/admin')
    const adminStats = await page.request.get('/api/admin/stats')
    expect(adminStats.status()).toBe(200)
    await expect(adminStats).toBeOK()
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
})
