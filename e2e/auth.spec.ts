import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear state to ensure starting from unauthenticated state
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('should display AuthScreen with demo logins and branding', async ({ page }) => {
    await expect(page.locator('text=Learn with legends').first()).toBeVisible();
    await expect(page.locator('text=Instant Demo Logins')).toBeVisible();

    // Check demo user options
    await expect(page.getByRole('button', { name: /Aria Vale/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Elion Drake/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Leo Star/i })).toBeVisible();

    // Check Google OAuth button
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

  test('should authenticate instantly as Adult Traveler (Aria Vale)', async ({ page }) => {
    const ariaBtn = page.getByRole('button', { name: /Aria Vale/i });
    await ariaBtn.click();

    // Verify transition to Dashboard
    await expect(page.locator('text=Aria Vale').first()).toBeVisible();
    // Verify Dashboard contains adult realms
    await expect(page.locator('#realm-card-work')).toBeVisible();
    await expect(page.locator('#realm-card-atlantis')).toBeVisible();
  });

  test('should authenticate as Youth Traveler (Leo Star) and enforce youth protection filtering', async ({ page }) => {
    const leoBtn = page.getByRole('button', { name: /Leo Star/i });
    await leoBtn.click();

    // Verify Leo Star is logged in
    await expect(page.locator('text=Leo Star').first()).toBeVisible();
    // Leo Star is youth (age 14), so youth-friendly realms are shown
    await expect(page.locator('#realm-card-atlantis')).toBeVisible();
    await expect(page.locator('#realm-card-el_dorado')).toBeVisible();
    await expect(page.locator('#realm-card-future_land')).toBeVisible();

    // Adult realms must be hidden for youth safety
    await expect(page.locator('#realm-card-work')).not.toBeVisible();
    await expect(page.locator('#realm-card-marriage')).not.toBeVisible();
  });

  test('should sign out from Profile Drawer and return to AuthScreen', async ({ page }) => {
    // Login first
    await page.getByRole('button', { name: /Aria Vale/i }).click();
    await expect(page.locator('text=Aria Vale').first()).toBeVisible();

    // Click on user profile avatar in header
    const profileBtn = page.locator('header button[title*="Profile" i], header button[title*="progress" i], header button[title*="Perfil" i]').first();
    await profileBtn.click();

    // Profile Drawer should be open
    await expect(page.locator('text=Traveler Profile')).toBeVisible();

    // Click Sign Out
    const signOutBtn = page.getByRole('button', { name: /Sign Out/i });
    await signOutBtn.click();

    // Should return to AuthScreen
    await expect(page.locator('text=Instant Demo Logins')).toBeVisible();
  });
});
