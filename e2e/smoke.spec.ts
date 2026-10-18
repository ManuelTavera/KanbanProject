import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function axeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  return results.violations
}

test('home page loads and has a title', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBe(true)
  await expect(page).toHaveTitle(/\S/)
})

test('home page has zero axe violations', async ({ page }) => {
  await page.goto('/')
  expect(await axeViolations(page)).toEqual([])
})

test('style guide has zero axe violations in light theme', async ({ page }) => {
  await page.goto('/style-guide')
  expect(await axeViolations(page)).toEqual([])
})

test('style guide has zero axe violations in dark theme', async ({ page }) => {
  await page.goto('/style-guide')
  // Toggle with the keyboard, not a click: a click leaves the pointer over the
  // button, and its hover colour (#a8a4ff, white text, 2.22:1) fails contrast.
  // That is a known Button issue tracked in task 3.1, not a theme issue.
  await page.getByRole('button', { name: 'Switch to dark' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  expect(await axeViolations(page)).toEqual([])
})
