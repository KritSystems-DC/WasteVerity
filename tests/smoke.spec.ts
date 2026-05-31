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

async function expectHeading(page: Page, name: string) {
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
}

test.describe('authentication and role access', () => {
  test('registers a new owner account and business', async ({ page }) => {
    const timestamp = Date.now()
    const email = `owner-${timestamp}@wasteverity.test`
    const businessName = `QA Business ${timestamp}`

    await page.goto('/register')
    await expectHeading(page, 'Register')
    await page.locator('input').nth(0).fill('QA Owner')
    await page.locator('input').nth(1).fill(email)
    await page.locator('input').nth(2).fill(businessName)
    await page.locator('input').nth(3).fill('Cafe')
    await page.locator('input').nth(4).fill('Password123!')
    await page.getByRole('button', { name: 'Create account' }).click()
    await page.waitForURL('**/login')

    await login(page, { email, password: 'Password123!' })
    await expectHeading(page, 'Dashboard')
  })

  test('redirects anonymous users and lets owner access business pages', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard$/)

    await login(page, owner)
    await expect(page).toHaveURL(/\/dashboard$/)
    await expectHeading(page, 'Dashboard')
  })

  test('staff cannot access admin and admin cannot access business-context pages', async ({ page }) => {
    await login(page, staff)
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin$/)

    await login(page, admin, '/admin')
    await page.goto('/admin')
    await expectHeading(page, 'Admin Dashboard')

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard$/)
  })
})

test.describe('owner workflow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, owner)
  })

  test('loads key owner pages and saves setup', async ({ page }) => {
    await page.goto('/setup')
    await expectHeading(page, 'Business setup')
    await page.locator('input').nth(0).fill('Demo Cafe QA')
    await page.getByRole('button', { name: 'Save setup' }).click()
    await expect(page.getByText('Business setup saved successfully.')).toBeVisible()

    for (const path of ['/stock', '/suppliers', '/expiry', '/reports', '/automation-logs', '/billing', '/settings', '/compliance']) {
      await page.goto(path)
      await expect(page.locator('main h1')).toBeVisible()
    }
  })

  test('fills and saves a compliance document', async ({ page }) => {
    await page.goto('/compliance')
    await expectHeading(page, 'Compliance documents')
    await page.getByRole('button', { name: /Fridge \/ Freezer Temperature Log/ }).click()

    const form = page.locator('form')
    await form.locator('input[type="date"]').fill('2026-05-31')
    await form.locator('input[type="time"]').fill('09:30')
    await form.locator('input[type="text"]').nth(0).fill('Walk-in fridge 1')
    await form.locator('select').selectOption('Fridge')
    await form.locator('input[type="number"]').fill('3')
    await form.locator('input[type="checkbox"]').check()
    await form.locator('input[type="text"]').nth(1).fill('QA Checker')
    await page.getByRole('button', { name: 'Save completed form' }).click()

    await expect(page.getByText('Compliance record saved.')).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Fridge / Freezer Temperature Log' }).first()).toBeVisible()
  })

  test('creates, edits and adjusts a stock item', async ({ page }) => {
    const itemName = `QA Stock ${Date.now()}`
    const editedName = `${itemName} Edited`

    await page.goto('/stock/new')
    await expectHeading(page, 'Add Stock Item')
    await page.locator('input').nth(0).fill(itemName)
    await page.locator('input').nth(1).fill('12')
    await page.locator('input').nth(2).fill('5')
    await page.locator('input').nth(3).fill('20')
    await page.locator('input').nth(4).fill('item')
    await page.locator('input').nth(5).fill('1.25')
    await page.getByRole('button', { name: 'Save item' }).click()
    await expect(page.getByText('Stock item created successfully.')).toBeVisible()

    await page.goto('/stock')
    await page.getByRole('link', { name: itemName }).click()
    await expect(page.getByText('Current quantity: 12 item')).toBeVisible()

    await page.getByRole('link', { name: 'Edit item' }).click()
    await expectHeading(page, 'Edit stock item')
    await expect(page.locator('input').nth(0)).toHaveValue(itemName)
    await page.locator('input').nth(0).fill(editedName)
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByRole('heading', { name: editedName }).first()).toBeVisible()

    await page.getByRole('link', { name: 'Adjust stock' }).click()
    await expectHeading(page, 'Adjust stock')
    await page.locator('input').nth(0).fill('3')
    await page.locator('input').nth(1).fill('QA restock')
    await page.getByRole('button', { name: 'Save adjustment' }).click()
    await expect(page.getByText('Stock adjustment saved.')).toBeVisible()
  })

  test('creates and edits a supplier', async ({ page }) => {
    const supplierName = `QA Supplier ${Date.now()}`
    const editedName = `${supplierName} Edited`

    await page.goto('/suppliers/new')
    await expectHeading(page, 'Add supplier')
    await page.locator('input').nth(0).fill(supplierName)
    await page.locator('input').nth(1).fill('QA Contact')
    await page.locator('input').nth(2).fill('qa-supplier@example.com')
    await page.locator('input').nth(3).fill('020 7000 0000')
    await page.getByRole('button', { name: 'Save supplier' }).click()
    await expect(page).toHaveURL(/\/suppliers$/)
    await page.getByRole('link', { name: supplierName }).click()

    await expectHeading(page, 'Supplier details')
    await page.locator('input').nth(0).fill(editedName)
    await page.getByRole('button', { name: 'Save supplier' }).click()
    await expect(page.getByText('Supplier saved.')).toBeVisible()
    await expect(page.getByRole('heading', { name: editedName })).toBeVisible()
  })

  test('submits and reviews staff requests, then generates reorder list', async ({ page }) => {
    const requestName = `QA Request ${Date.now()}`

    await page.goto('/staff-requests')
    await expectHeading(page, 'Staff requests')
    await page.locator('input').first().fill(requestName)
    await page.locator('input[type="number"]').fill('2')
    await page.locator('textarea').fill('QA request reason')
    await page.getByRole('button', { name: 'Submit request' }).click()
    await expect(page.getByText(requestName)).toBeVisible()
    await page.getByRole('button', { name: 'Approve' }).first().click()
    await expect(page.getByText('APPROVED').first()).toBeVisible()

    await page.goto('/reorder')
    await expectHeading(page, 'Reorder')
    await page.getByRole('button', { name: 'Generate reorder list' }).click()
    await expect(page.getByText('Auto reorder').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'CSV' }).first()).toBeVisible()
  })

  test('records waste, exports reports and handles unconfigured checkout', async ({ page }) => {
    const wasteStockItemId = await page.evaluate(async () => {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `QA Waste Stock ${Date.now()}`,
          currentQuantity: 5,
          minimumQuantity: 1,
          reorderAmount: 5,
          unit: 'item',
          costPerUnit: 2,
        }),
      })
      if (!res.ok) throw new Error('Unable to create stock item for waste smoke test')
      const item = await res.json()
      return item.id as string
    })

    await page.goto('/waste')
    await expectHeading(page, 'Waste')
    await page.locator('select').selectOption(wasteStockItemId)
    await page.locator('input[type="number"]').fill('1')
    await page.locator('input').last().fill('QA waste')
    await page.getByRole('button', { name: 'Record waste' }).click()
    await expect(page.getByText('Waste recorded.')).toBeVisible()

    await page.goto('/reports')
    await expect(page.getByRole('heading', { name: 'Low Stock Summary' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Expiry Summary' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Waste Summary' })).toBeVisible()
    await expect(page.getByText('Loss in 30 days')).toBeVisible()

    const stockDownload = page.waitForEvent('download')
    await page.getByRole('link', { name: 'Download stock CSV' }).click()
    await expect((await stockDownload).suggestedFilename()).toBe('stock.csv')

    const wasteDownload = page.waitForEvent('download')
    await page.getByRole('link', { name: 'Download waste CSV' }).click()
    await expect((await wasteDownload).suggestedFilename()).toBe('waste.csv')

    await page.goto('/billing')
    await expectHeading(page, 'Billing')
    await expect(page.getByText('Plan: PRO')).toBeVisible()
    await page.getByRole('button', { name: 'Checkout with Stripe' }).click()
    await expect(page.getByText('Stripe is not configured.')).toBeVisible()
  })
})

test.describe('staff workflow', () => {
  test('staff submits a request and cannot see review actions', async ({ page }) => {
    const requestName = `QA Staff Request ${Date.now()}`

    await login(page, staff)
    await page.goto('/staff-requests')
    await expectHeading(page, 'Staff requests')
    await page.locator('input').first().fill(requestName)
    await page.locator('input[type="number"]').fill('1')
    await page.getByRole('button', { name: 'Submit request' }).click()
    await expect(page.getByText(requestName)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Approve' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Add to reorder' })).toHaveCount(0)
  })
})

test.describe('admin workflow', () => {
  test('admin pages load', async ({ page }) => {
    await login(page, admin, '/admin')
    await page.goto('/admin')
    await expectHeading(page, 'Admin Dashboard')

    for (const path of ['/admin/businesses', '/admin/users', '/admin/subscriptions', '/admin/logs', '/admin/notes']) {
      await page.goto(path)
      await expect(page.locator('main h1')).toBeVisible()
    }
  })
})
