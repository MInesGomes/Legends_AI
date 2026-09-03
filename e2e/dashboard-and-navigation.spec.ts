import { test, expect } from '@playwright/test';
import { loginAsAdultUser } from './helpers';

test.describe('Dashboard & Realm Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdultUser(page);
  });

  test('should display all 6 realms with ornamental plaques and audience badges', async ({ page }) => {
    // 6 realms
    await expect(page.locator('#realm-card-work')).toBeVisible();
    await expect(page.locator('#realm-card-marriage')).toBeVisible();
    await expect(page.locator('#realm-card-dad_mom')).toBeVisible();
    await expect(page.locator('#realm-card-atlantis')).toBeVisible();
    await expect(page.locator('#realm-card-el_dorado')).toBeVisible();
    await expect(page.locator('#realm-card-future_land')).toBeVisible();

    // El Dorado should display the "Child" badge
    await expect(page.locator('#realm-card-el_dorado').getByText(/Child|Infantil|Bambino|Criança|Kind/i)).toBeVisible();
  });

  test('should navigate from Dashboard to WORK tales and back', async ({ page }) => {
    // Click WORK realm card
    await page.locator('#realm-card-work').click();

    // Verify on Tales page for WORK
    await expect(page.locator('text=WORK TALES')).toBeVisible();

    // Click back button
    const backBtn = page.locator('button:has(svg.lucide-arrow-left)').first();
    await backBtn.click();

    // Verify back on Dashboard
    await expect(page.locator('#realm-card-future_land')).toBeVisible();
  });

  test('should navigate to ATLANTIS tales and show tale cards', async ({ page }) => {
    await page.locator('#realm-card-atlantis').click();

    // Verify on Tales page for Atlantis
    await expect(page.locator('text=ATLANTIS TALES')).toBeVisible();

    // Verify tale card exists
    await expect(page.locator('h3.font-cinzel').first()).toBeVisible();
  });
});
