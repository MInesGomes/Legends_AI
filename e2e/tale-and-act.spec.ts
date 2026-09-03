import { test, expect } from '@playwright/test';
import { loginAsAdultUser } from './helpers';

test.describe('Tale Reading & Act Playback Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdultUser(page);
  });

  test('should open a tale and display the video act player', async ({ page }) => {
    // Navigate into WORK realm
    await page.locator('#realm-card-work').click();
    await expect(page.locator('text=WORK TALES')).toBeVisible();

    // Click on the first tale card
    const firstTale = page.locator('h3.font-cinzel').first();
    await firstTale.click();

    // Act Page should be active
    await expect(page.locator('#act-close-button')).toBeVisible();

    // Controls should exist
    await expect(page.locator('#act-autoplay-toggle')).toBeVisible();
    await expect(page.locator('#act-sound-toggle')).toBeVisible();
    await expect(page.locator('#act-top-mp3-selector')).toBeVisible();
  });

  test('should toggle autoplay and mute controls', async ({ page }) => {
    await page.locator('#realm-card-work').click();
    await page.locator('h3.font-cinzel').first().click();

    // Sound toggle
    const soundBtn = page.locator('#act-sound-toggle');
    await expect(soundBtn).toBeVisible();
    await soundBtn.click(); // toggle mute

    // Autoplay toggle
    const autoplayBtn = page.locator('#act-autoplay-toggle');
    await expect(autoplayBtn).toBeVisible();
    await autoplayBtn.click(); // toggle autoplay
  });

  test('should navigate to next act and close back to tales page', async ({ page }) => {
    await page.locator('#realm-card-work').click();
    await page.locator('h3.font-cinzel').first().click();

    await expect(page.locator('#act-close-button')).toBeVisible();

    // Next act button
    const nextBtn = page.locator('#act-next-button');
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
    }

    // Close Act Page
    await page.locator('#act-close-button').click();

    // Should return to WORK TALES
    await expect(page.locator('text=WORK TALES')).toBeVisible();
  });
});
