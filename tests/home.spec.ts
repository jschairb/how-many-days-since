import { test, expect } from '@playwright/test';

test.describe('Count', () => {
  test('renders the handoff counter and shared navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/How many days since Michigan has beaten Ohio State/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('HOW MANY DAYS SINCE');
    await expect(page.getByRole('navigation', { name: 'Site' }).getByRole('link')).toHaveCount(3);
  });

  test('displays a numeric days count and historical totals', async ({ page }) => {
    await page.goto('/');
    const count = page.locator('.counter strong');
    await expect(count).toBeVisible();
    expect(Number((await count.textContent())?.replaceAll(',', ''))).toBeGreaterThanOrEqual(0);
    await expect(page.getByText('ALL-TIME SERIES (M-OSU-T), 1897-2025')).toBeVisible();
  });
});
