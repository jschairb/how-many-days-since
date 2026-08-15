import { test, expect } from '@playwright/test';

test.describe('Record', () => {
  test('shows the observed drought statistics section and longest Ohio State drought', async ({ page }) => {
    await page.goto('/record');

    await expect(page.getByRole('heading', { name: 'RIVALRY DROUGHTS' })).toBeVisible();
    await expect(page.getByTestId('ohio-state-longest')).toContainText('1944');
    await expect(page.getByTestId('ohio-state-longest')).toContainText('1952');
  });

  test('keeps the Record page readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/record');

    await expect(page.getByRole('heading', { name: 'RIVALRY DROUGHTS' })).toBeVisible();
    await expect(page.locator('[data-drought-table="longest"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('renders all 121 meetings and filters them', async ({ page }) => {
    await page.goto('/record');
    await expect(page).toHaveTitle(/The Record/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('THE RECORD');
    await expect(page.locator('[data-game]')).toHaveCount(121);
    await page.getByLabel('Filter games').fill('2025');
    await expect(page.locator('[data-game^="2025"]')).toBeVisible();
    await expect(page.locator('[data-game^="2024"]')).toBeHidden();
  });

  test('includes drought history in each Every Meeting row', async ({ page }) => {
    await page.goto('/record');

    await expect(page.getByText('DROUGHT HISTORY', { exact: true })).toHaveCount(0);
    await expect(page.locator('[data-game^="2025"] [data-drought-context]')).toContainText('Michigan');
  });
});

test.describe('Rivalry Lab', () => {
  test('shows observed and derived season profiles with snapshot provenance', async ({ page }) => {
    await page.goto('/rivalry-lab');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();

    await expect(page.getByTestId('season-profile-ohio-state')).toContainText('John Cooper');
    await expect(page.getByTestId('season-profile-ohio-state')).toContainText('NO. 2 OF 144');
    await expect(page.getByTestId('season-profile-michigan')).toContainText('Jim Harbaugh');
    await expect(page.getByTestId('season-profile-michigan')).toContainText('NO. 2 OF 704');
    await expect(page.getByTestId('snapshot-provenance')).toContainText('srs-elo-v1');
  });

  test('loads server-derived matchup values and runs a simulation', async ({ page }) => {
    await page.goto('/rivalry-lab');
    await expect(page.getByRole('heading', { level: 1, name: 'RIVALRY LAB' })).toBeVisible();
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await expect(page.getByRole('heading', { name: 'TALE OF THE TAPE' })).toBeVisible();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();
    await page.getByRole('button', { name: 'PLAY ONE' }).click();
    await expect(page.locator('[data-game-score]')).toContainText('FINAL');
  });

  test('shows the normalized cross-era baseline in Tape and Pregame', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/rivalry-lab');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();

    await expect(page.locator('[data-tape]')).toContainText('24.2');
    await expect(page.locator('[data-tape]')).toContainText('26.9');
    await expect(page.getByTestId('snapshot-provenance')).toContainText('normalized ratings');
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-tape.png', fullPage: true });

    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();
    await expect(page.locator('[data-mich-prob]')).toContainText('55%');
    await expect(page.locator('[data-score]')).toContainText('27 MICH');
    await expect(page.locator('[data-score]')).toContainText('24 OSU');
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-pregame.png', fullPage: true });
  });
});
