import { test, expect } from '@playwright/test';

test.describe('rivalry page', () => {
  test('has correct title and heading', async ({ page }) => {
    await page.goto('/rivalry/');
    await expect(page).toHaveTitle(/The Rivalry/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('The Rivalry');
  });

  test('displays the days count', async ({ page }) => {
    await page.goto('/rivalry/');
    await expect(page.locator('#days-count')).toBeVisible();
  });

  test('displays key statistics cards', async ({ page }) => {
    await page.goto('/rivalry/');
    await expect(page.locator('.stats-grid')).toBeVisible();
    await expect(page.locator('.stat-card').first()).toBeVisible();
  });

  test('has a searchable game history table', async ({ page }) => {
    await page.goto('/rivalry/');
    await expect(page.locator('.rivalry-table')).toBeVisible();
    await expect(page.locator('#gameSearch')).toBeVisible();
  });

  test('has a back to home link', async ({ page }) => {
    await page.goto('/rivalry/');
    await expect(page.locator('#bottom-nav').getByRole('link', { name: /back to home/i })).toBeVisible();
  });
});
