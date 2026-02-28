import { test, expect } from '@playwright/test';

test.describe('homepage', () => {
  test('has correct title and heading', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/How many days since Michigan has beaten Ohio State/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('How many days since Michigan');
  });

  test('displays a numeric days count', async ({ page }) => {
    await page.goto('/');
    const count = page.locator('#days_count');
    await expect(count).toBeVisible();
    const text = await count.textContent();
    expect(Number(text)).toBeGreaterThanOrEqual(0);
  });

  test('displays the Columbus time phrase', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#phrase')).toContainText('Michigan still sucks');
  });

  test('shows the celebratory logo image', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#logo-image')).toBeVisible();
  });

  test('has navigation links to rivalry and mo-carmen pages', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('#bottom-nav');
    await expect(nav.getByRole('link', { name: /rivalry/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /mo carmen/i })).toBeVisible();
  });
});
