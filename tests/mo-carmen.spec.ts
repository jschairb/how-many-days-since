import { test, expect } from '@playwright/test';

test.describe('mo-carmen page', () => {
  test('has correct title and heading', async ({ page }) => {
    await page.goto('/mo-carmen/');
    await expect(page).toHaveTitle(/Mo Carmen/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Mo Carmen');
  });

  test('displays the Mo Carmen image', async ({ page }) => {
    await page.goto('/mo-carmen/');
    await expect(page.locator('img[alt="Mo Carmen"]')).toBeVisible();
  });

  test('displays the Black Sheep Collection merch section', async ({ page }) => {
    await page.goto('/mo-carmen/');
    await expect(page.getByRole('heading', { name: /Black Sheep Collection/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Shop the Collection/i })).toBeVisible();
  });

  test('has a back to home link', async ({ page }) => {
    await page.goto('/mo-carmen/');
    await expect(page.locator('#bottom-nav').getByRole('link', { name: /back to the count/i })).toBeVisible();
  });
});
