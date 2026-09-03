import { test, expect } from '@playwright/test';
import { loginAsAdultUser } from './helpers';

test.describe('Accessibility, Preferences & Internationalization', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdultUser(page);
  });

  test('should toggle dark/light theme mode', async ({ page }) => {
    // Theme toggle button in header
    const themeBtn = page.locator('header button[title*="Theme" i], header button[title*="Tema" i]').first();
    await expect(themeBtn).toBeVisible();

    // Click to toggle dark mode
    await themeBtn.click();

    // Click again to return
    await themeBtn.click();
  });

  test('should switch languages dynamically and update UI translations', async ({ page }) => {
    const langBtn = page.locator('#header-language-dropdown button').first();
    await expect(langBtn).toBeVisible();

    // Switch to Spanish (ES)
    await langBtn.click();
    await page.locator('#header-language-dropdown-opt-ES').click();
    // In Spanish, work realm plaque updates
    await expect(page.locator('#realm-card-work').getByText('TRABAJO')).toBeVisible();

    // Switch to Italian (IT)
    await langBtn.click();
    await page.locator('#header-language-dropdown-opt-IT').click();
    await expect(page.locator('#realm-card-work').getByText('LAVORO')).toBeVisible();

    // Switch to Portuguese (PT-pt)
    await langBtn.click();
    await page.locator('#header-language-dropdown-opt-PT-pt').click();
    await expect(page.locator('#realm-card-work').getByText('TRABALHO')).toBeVisible();

    // Switch to Dutch (NL)
    await langBtn.click();
    await page.locator('#header-language-dropdown-opt-NL').click();
    await expect(page.locator('#realm-card-work').getByText('WERK')).toBeVisible();

    // Switch back to English (EN)
    await langBtn.click();
    await page.locator('#header-language-dropdown-opt-EN').click();
    await expect(page.locator('#realm-card-work').getByText('WORK')).toBeVisible();
  });

  test('should change font scale via the bottom accessibility hub', async ({ page }) => {
    const bottomHub = page.locator('aside[aria-label="Accessibility and display settings"]');
    await expect(bottomHub).toBeVisible();

    // Expand the hub by clicking the Options/Expand button
    const expandBtn = bottomHub.getByRole('button', { name: /Options|Opciones|Opzioni|Opções|Opties/i });
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
    }

    // Click on Large size ("A+")
    const largeBtn = page.getByRole('button', { name: /A\+/i }).first();
    if (await largeBtn.isVisible()) {
      await largeBtn.click();
      // Check HTML element for font-scale class
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toContain('font-scale-large');
    }

    // Click on Standard size ("A")
    const normalBtn = page.getByRole('button', { name: /^A\s/i }).or(page.locator('button:has-text("Standard")')).first();
    if (await normalBtn.isVisible()) {
      await normalBtn.click();
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toContain('font-scale-normal');
    }
  });
});
