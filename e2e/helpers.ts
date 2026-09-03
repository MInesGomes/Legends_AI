import { Page, expect } from '@playwright/test';

/**
 * Common test helpers for Legends E2E testing
 */

export async function loginAsAdultUser(page: Page) {
  await page.goto('/');
  // If already on dashboard, return
  const isDashboard = await page.locator('text=Instant Demo Logins').count() === 0;
  if (!isDashboard) {
    // Click on the Adult demo login (Aria Vale)
    const adultBtn = page.getByRole('button', { name: /Aria Vale/i });
    await adultBtn.waitFor({ state: 'visible' });
    await adultBtn.click();
  }
  // Wait for Dashboard to be visible
  await expect(page.locator('text=Learn with legends').first()).toBeVisible();
}

export async function loginAsYouthUser(page: Page) {
  await page.goto('/');
  const isDashboard = await page.locator('text=Instant Demo Logins').count() === 0;
  if (!isDashboard) {
    // Click on the Youth demo login (Leo Star)
    const youthBtn = page.getByRole('button', { name: /Leo Star/i });
    await youthBtn.waitFor({ state: 'visible' });
    await youthBtn.click();
  }
  await expect(page.locator('text=Learn with legends').first()).toBeVisible();
}

export async function clearAppState(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}
