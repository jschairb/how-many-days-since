import { test, expect } from '@playwright/test';

test.describe('Record', () => {
  test('links covered team-season records and the score to CollegeFootballData', async ({ page }) => {
    await page.goto('/record');

    const meeting = page.locator('[data-game^="2025"]');
    await expect(meeting.getByRole('link', { name: /Ohio State/ })).toHaveAttribute(
      'href',
      'https://collegefootballdata.com/teams/ohio-state/2025'
    );
    await expect(meeting.getByRole('link', { name: /Michigan/ })).toHaveAttribute(
      'href',
      'https://collegefootballdata.com/teams/michigan/2025'
    );
    await expect(meeting.getByRole('link', { name: '27-9' })).toHaveAttribute(
      'href',
      /collegefootballdata\.com\/boxscore\//
    );
  });

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
  test('keeps the methodology page in Lab-local navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/rivalry-lab/about');

    await expect(page.getByRole('navigation', { name: 'Rivalry Lab' }).getByRole('link', { name: 'OPEN THE LAB' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Rivalry Lab' }).getByRole('link', { name: 'METHOD' })).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

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

  test('explains and plays one selected matchup without series controls or turning points', async ({ page }) => {
    await page.goto('/rivalry-lab');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();

    const playOne = page.getByRole('button', { name: 'PLAY ONE' });
    await expect(playOne).toBeVisible();
    await expect(page.locator('[data-view="pregame"]')).toContainText(
      'Pick this matchup, then play one simulated game.'
    );
    expect(await playOne.evaluate((button) => button.getBoundingClientRect().top)).toBeLessThan(
      await page.locator('.pregame-explanation').evaluate((section) => section.getBoundingClientRect().top)
    );
    await expect(page.getByText(/BEST OF 10|SIM 100|1,000|10,000/i)).toHaveCount(0);

    await playOne.click();
    await expect(page.locator('[data-game-score]')).toContainText('FINAL');
    await expect(page.getByText(/KEY TURNING POINT/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /POSTGAME|RUN AGAIN/i })).toHaveCount(0);
    await expect(page.locator('[data-view="postgame"]')).toHaveCount(0);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-single-game.png', fullPage: true });
  });

  test('keeps Tape focused on selected-season profiles and moves derived matchup outputs to Pregame', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/rivalry-lab');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();

    await expect(page.getByRole('heading', { name: 'TALE OF THE TAPE' })).toBeVisible();
    await expect(page.locator('[data-view="tape"] [data-context]')).toContainText('1995 OHIO STATE × 2023 MICHIGAN');
    await expect(page.getByTestId('season-profile-ohio-state')).toContainText('OBSERVED SCORING');
    await expect(page.getByTestId('season-profile-michigan')).toContainText('DERIVED SRS RANKINGS');
    await expect(page.locator('[data-tape]')).toHaveCount(0);

    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();
    await expect(page.locator('[data-expected-score]')).toContainText('DERIVED');
    await expect(page.locator('[data-expected-score]')).toContainText('27 MICH');
    await expect(page.locator('[data-expected-score]')).toContainText('24 OSU');
    await expect(page.locator('[data-expected-margin]')).toContainText('DERIVED');
    await expect(page.locator('[data-win-probability]')).toContainText('DERIVED');
    await expect(page.locator('[data-pregame-inputs]')).toContainText('EXACT MODEL INPUTS');
    await expect(page.locator('[data-pregame-inputs]')).toContainText('OFFENSE RATING');
    await expect(page.locator('[data-pregame-method]')).toContainText('METHOD NOTE');
    await expect(page.locator('[data-pregame-drivers]')).toContainText('KEY DRIVERS');
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-pregame-desktop.png', fullPage: true });
  });

  test('keeps the 1995 Ohio State and 2023 Michigan pregame readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/rivalry-lab');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();

    await expect(page.locator('[data-expected-score]')).toBeVisible();
    await expect(page.locator('[data-pregame-inputs]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-pregame-mobile.png', fullPage: true });
  });
});
