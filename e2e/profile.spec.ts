import { test, expect } from '@playwright/test';
import { loginAsAdultUser } from './helpers';

test.describe('Traveler Profile & Skills Progress', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdultUser(page);
  });

  test('should open profile drawer and inspect traveler details', async ({ page }) => {
    // Open Profile Drawer via header avatar
    const profileBtn = page.locator('header button[title*="Profile" i], header button[title*="progress" i], header button[title*="Perfil" i]').first();
    await profileBtn.click();

    // Verify Profile Drawer is visible
    await expect(page.locator('text=Traveler Profile')).toBeVisible();
    await expect(page.locator('text=Aria Vale').first()).toBeVisible();

    // Verify Skills Progress
    await expect(page.locator('text=Skills Progress')).toBeVisible();
    await expect(page.locator('text=Leader')).toBeVisible();
    await expect(page.locator('text=Plan')).toBeVisible();
    await expect(page.locator('text=Win4All')).toBeVisible();
    await expect(page.locator('text=Listen')).toBeVisible();
    await expect(page.locator('text=Recharge')).toBeVisible();

    // Verify Languages section
    await expect(page.locator('text=Languages').first()).toBeVisible();
  });

  test('should toggle avatar choices picker in profile drawer', async ({ page }) => {
    const profileBtn = page.locator('header button[title*="Profile" i], header button[title*="progress" i]').first();
    await profileBtn.click();

    // Click "Change Avatar (8 Choices)"
    const avatarToggleBtn = page.locator('button:has-text("Change Avatar"), button:has-text("Avatar")').first();
    await avatarToggleBtn.click();

    // Verify Female and Male gender tabs using regex to avoid substring collision
    await expect(page.getByRole('button', { name: /^Female|^Femenino/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Male|^Masculino/i })).toBeVisible();
  });
});
