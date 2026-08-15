import { test, expect } from '@playwright/test';

test.describe('Record', () => {
  test('renders all 121 meetings and filters them', async ({ page }) => {
    await page.goto('/record');
    await expect(page).toHaveTitle(/The Record/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('THE RECORD');
    await expect(page.locator('[data-game]')).toHaveCount(121);
    await page.getByLabel('Filter games').fill('2025');
    await expect(page.locator('[data-game^="2025"]')).toBeVisible();
    await expect(page.locator('[data-game^="2024"]')).toBeHidden();
  });
});

test.describe('Rivalry Lab', () => {
  test('loads server-derived matchup values and runs a simulation', async ({ page }) => {
    await page.goto('/rivalry-lab');
    await expect(page.getByRole('heading', { level: 1, name: 'RIVALRY LAB' })).toBeVisible();
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await expect(page.getByRole('heading', { name: 'TALE OF THE TAPE' })).toBeVisible();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();
    await page.getByRole('button', { name: 'PLAY ONE' }).click();
    await expect(page.getByText('FINAL').first()).toBeVisible();
  });
});
