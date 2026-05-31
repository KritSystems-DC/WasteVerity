import { expect, test, type Page } from '@playwright/test'

const owner = { email: 'owner@wasteverity.demo', password: 'Password123!' }

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

async function expectNoPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement
    return root.scrollWidth - root.clientWidth
  })
  expect(overflow).toBeLessThanOrEqual(1)
}

test.describe('authenticated app responsive surface', () => {
  test('keeps navigation and dense pages usable on phone, tablet and desktop widths', async ({ page }) => {
    const routes = ['/dashboard', '/stock', '/suppliers', '/compliance', '/reports', '/settings']
    const viewports = [
      { name: 'phone', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 },
    ]

    await login(page, owner)

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })

      for (const route of routes) {
        await page.goto(route)
        await expect(page.locator('main h1')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible()
        await expectNoPageOverflow(page)
      }

      if (viewport.name === 'phone') {
        await expect(page.getByRole('button', { name: 'Open app navigation' })).toBeVisible()
        await page.getByRole('button', { name: 'Open app navigation' }).click()
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
        await page.getByRole('button', { name: 'Close app navigation' }).click()
      } else {
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
      }
    }
  })
})
