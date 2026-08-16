import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const games = JSON.parse(readFileSync(new URL('../src/data/rivalry-games.json', import.meta.url), 'utf8')) as Array<{ year: number }>;
const snapshot = JSON.parse(readFileSync(new URL('../src/data/rivalry-lab-snapshot.json', import.meta.url), 'utf8')) as { ratings: { teamSeasons: Array<{ teamId: string; season: number }> } };
const capturedEvents = (page: any) => page.evaluate(() => JSON.parse(sessionStorage.getItem('analytics-events') ?? '[]'));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    type AnalyticsWindow = Window & { analyticsEvents: unknown[]; gtag: (...args: unknown[]) => void };
    const analyticsWindow = window as unknown as AnalyticsWindow;
    analyticsWindow.analyticsEvents = JSON.parse(sessionStorage.getItem('analytics-events') ?? '[]');
    analyticsWindow.gtag = (...args: unknown[]) => {
      analyticsWindow.analyticsEvents.push(args);
      sessionStorage.setItem('analytics-events', JSON.stringify(analyticsWindow.analyticsEvents));
    };
  });
});

test.describe('Record', () => {
  test('links Every Meeting to the internal game and covered team-season archives', async ({ page }) => {
    await page.goto('/record');

    const meeting = page.locator('[data-game^="2025"]');
    await expect(meeting.getByRole('link', { name: /Ohio State/ })).toHaveAttribute(
      'href',
      '/teams/ohio-state/2025'
    );
    await expect(meeting.getByRole('link', { name: /Michigan/ })).toHaveAttribute(
      'href',
      '/teams/michigan/2025'
    );
    await expect(meeting.getByRole('link', { name: '27-9' })).toHaveAttribute(
      'href',
      '/record/2025'
    );
  });

  test('tracks internal archive and season opens', async ({ page }) => {
    await page.goto('/record');
    const meeting = page.locator('[data-game^="2025"]');
    await meeting.getByRole('link', { name: '27-9' }).click();
    await expect.poll(() => capturedEvents(page)).toContainEqual(['event', 'record_game_opened', { game_year: 2025 }]);

    await page.goBack();
    await meeting.getByRole('link', { name: /Ohio State/ }).click();
    await expect.poll(() => capturedEvents(page)).toContainEqual(['event', 'team_season_opened', { team: 'ohio-state', season: 2025 }]);
  });

  test('renders a covered game with its archival facts, internal team links, and adjacent meetings', async ({ page }) => {
    await page.goto('/record/2025');

    await expect(page).toHaveTitle(/2025 Ohio State vs Michigan/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://howmanydayssincemichiganhasbeatenohiostate.com/record/2025'
    );
    await expect(page.getByTestId('game-score')).toContainText('OHIO STATE 27');
    await expect(page.getByTestId('game-score')).toContainText('9 MICHIGAN');
    await expect(page.getByTestId('game-facts')).toContainText('Nov 29');
    await expect(page.getByTestId('game-facts')).toContainText('Ann Arbor');
    await expect(page.getByRole('link', { name: 'Ohio State 2025 season' })).toHaveAttribute('href', '/teams/ohio-state/2025');
    await expect(page.getByRole('link', { name: 'Michigan 2025 season' })).toHaveAttribute('href', '/teams/michigan/2025');
    await expect(page.getByRole('link', { name: /CFBD advanced box score/i })).toHaveAttribute('href', /collegefootballdata\.com\/boxscore\//);
    await expect(page.getByRole('link', { name: /previous meeting: 2024/i })).toHaveAttribute('href', '/record/2024');
    await expect(page.getByRole('link', { name: /next meeting/i })).toHaveCount(0);
  });

  test('tracks an external CFBD boxscore when one is available', async ({ page }) => {
    await page.goto('/record/2025');
    await page.getByRole('link', { name: /CFBD advanced box score/i }).click();

    await expect.poll(() => capturedEvents(page)).toContainEqual(['event', 'cfbd_boxscore_opened', { game_year: 2025 }]);
  });

  test('renders every snapshot team-season with its available profile and canonical URL', async ({ page }) => {
    await page.goto('/teams/ohio-state/2025');

    await expect(page).toHaveTitle(/2025 Ohio State Season/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://howmanydayssincemichiganhasbeatenohiostate.com/teams/ohio-state/2025'
    );
    await expect(page.getByTestId('season-record')).toContainText('12-2');
    await expect(page.getByTestId('season-profile')).toContainText('OBSERVED');
    await expect(page.getByRole('link', { name: /2025 rivalry meeting/i })).toHaveAttribute('href', '/record/2025');
  });

  test('serves every generated game and snapshot team-season route', async ({ page }) => {
    const routes = [
      ...games.map((game) => `/record/${game.year}`),
      ...snapshot.ratings.teamSeasons.map((season) => `/teams/${season.teamId}/${season.season}`),
    ];

    const responses = await Promise.all(routes.map((route) => page.request.get(route)));

    expect(responses.filter((response) => !response.ok()).map((response) => response.url())).toEqual([]);
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
  test('links the Lab and the methodology page to each other on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/rivalry-lab');
    await expect(page.getByRole('link', { name: 'METHOD & SOURCES →' })).toHaveAttribute('href', '/rivalry-lab/about');

    await page.goto('/rivalry-lab/about');
    await expect(page.getByRole('link', { name: 'OPEN THE LAB' }).first()).toBeVisible();
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

  test('tracks built and played matchups with coverage but no seed', async ({ page }) => {
    await page.goto('/rivalry-lab');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();
    await page.getByRole('button', { name: 'PLAY ONE' }).click();

    await expect.poll(() => capturedEvents(page)).toContainEqual(['event', 'rivalry_lab_matchup_built', {
      osu_season: 1995,
      michigan_season: 2023,
      era_mode: 'neutral',
      simulation_coverage: 'score-and-schedule',
    }]);
    await expect.poll(() => capturedEvents(page)).toContainEqual(['event', 'rivalry_lab_game_played', {
      osu_season: 1995,
      michigan_season: 2023,
      simulation_coverage: 'score-and-schedule',
    }]);
    expect(JSON.stringify(await capturedEvents(page))).not.toContain('seed');
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
    await expect(page.locator('[data-game-coverage]')).toContainText('SCORE-SCHEDULE');
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
    await expect(page.locator('[data-pregame-inputs]')).toContainText('MATCHUP INPUTS');
    await expect(page.locator('[data-pregame-inputs]')).toContainText('OFFENSE RATING');
    await expect(page.locator('[data-pregame-method]')).toContainText('WHAT THIS MEANS');
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
    await page.getByRole('button', { name: 'PLAY ONE' }).click();
    await expect(page.locator('[data-game-coverage]')).toContainText('SCORE-SCHEDULE');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-game-mobile.png', fullPage: true });
  });

  test('shows enriched historical context for the 2014 Ohio State and 2023 Michigan pregame and game on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/rivalry-lab');
    await page.locator('[data-osu]').selectOption('2014');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();

    await expect(page.locator('[data-simulation-coverage]')).toContainText('ENRICHED');
    await expect(page.locator('[data-simulation-coverage]')).toContainText('possession and turnover context is active');
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-enriched-pregame-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'PLAY ONE' }).click();
    await expect(page.locator('[data-game-coverage]')).toContainText('ENRICHED');
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-enriched-game-desktop.png', fullPage: true });
  });

  test('shows enriched historical context for the 2014 Ohio State and 2023 Michigan on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/rivalry-lab');
    await page.locator('[data-osu]').selectOption('2014');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();

    await expect(page.locator('[data-simulation-coverage]')).toContainText('ENRICHED');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-enriched-pregame-mobile.png', fullPage: true });
    await page.getByRole('button', { name: 'PLAY ONE' }).click();
    await expect(page.locator('[data-game-coverage]')).toContainText('ENRICHED');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-enriched-game-mobile.png', fullPage: true });
  });
});
