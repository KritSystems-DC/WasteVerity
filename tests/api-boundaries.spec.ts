import { expect, test, type Page } from '@playwright/test'

const owner = { email: 'owner@stocksense.demo', password: 'Password123!' }
const staff = { email: 'staff@stocksense.demo', password: 'Password123!' }
const admin = { email: 'admin@stocksense.demo', password: 'Password123!' }

async function login(page: Page, account: { email: string; password: string }, callbackUrl = '/dashboard') {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  await page.locator('input').nth(0).fill(account.email)
  await page.locator('input').nth(1).fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL(`**${callbackUrl}`)
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

  test('prevents staff from mutating owner-only supplier records', async ({ page }) => {
    await login(page, owner)
    const createSupplier = await page.request.post('/api/suppliers', {
      data: {
        name: `API Boundary Supplier ${Date.now()}`,
        contactName: 'QA Contact',
        email: 'api-boundary@example.com',
      },
    })
    expect(createSupplier.status()).toBe(201)
    const supplier = await createSupplier.json()

    await login(page, staff)
    const updateAsStaff = await page.request.put(`/api/suppliers/${supplier.id}`, {
      data: {
        name: `${supplier.name} Staff Edit`,
      },
    })

    expect(updateAsStaff.status()).toBe(403)
    await expect(await updateAsStaff.json()).toMatchObject({ error: 'Forbidden' })
  })
})
