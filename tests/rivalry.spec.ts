import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const games = JSON.parse(readFileSync(new URL('../src/data/rivalry-games.json', import.meta.url), 'utf8')) as Array<{ year: number }>;
const snapshot = JSON.parse(readFileSync(new URL('../src/data/rivalry-lab-snapshot.json', import.meta.url), 'utf8')) as { ratings: { teamSeasons: Array<{ teamId: string; season: number }> } };

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
    await expect(page.locator('.drought-comparison')).toBeVisible();
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
    await page.locator('[data-osu]').selectOption('1995');
    await page.locator('[data-mich]').selectOption('2023');
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
    await expect(page.locator('[data-seed]')).toHaveCount(0);
    const latestSeason = (teamId: string) => String(Math.max(
      ...snapshot.ratings.teamSeasons.filter((season) => season.teamId === teamId).map((season) => season.season)
    ));
    await expect(page.locator('[data-osu]')).toHaveValue(latestSeason('ohio-state'));
    await expect(page.locator('[data-mich]')).toHaveValue(latestSeason('michigan'));
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await expect(page.getByRole('heading', { name: 'TALE OF THE TAPE' })).toBeVisible();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE', exact: true }).click();
    await expect(page.locator('[data-game-score]')).toContainText('TYPICAL SCORE');
  });

  test('explains and plays one selected matchup without series controls or turning points', async ({ page }) => {
    await page.goto('/rivalry-lab');
    await page.locator('[data-osu]').selectOption('1995');
    await page.locator('[data-mich]').selectOption('2023');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();

    const playOne = page.getByRole('button', { name: 'SIMULATE', exact: true });
    await expect(playOne).toBeVisible();
    await expect(page.locator('[data-view="pregame"]')).toContainText(/SIMULATE plays this matchup [\d,]+ times/);
    expect(await playOne.evaluate((button) => button.getBoundingClientRect().top)).toBeGreaterThan(
      await page.locator('[data-win-probability]').evaluate((section) => section.getBoundingClientRect().top)
    );
    await expect(page.getByText(/BEST OF 10|SIM 100|1,000|10,000/i)).toHaveCount(0);

    await playOne.click();
    await expect(page.locator('[data-game-score]')).toContainText('TYPICAL SCORE');
    await expect(page.locator('[data-game-coverage]')).toHaveCount(0);
    await expect(page.getByText(/KEY TURNING POINT/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /POSTGAME|RUN AGAIN/i })).toHaveCount(0);
    await expect(page.locator('[data-view="postgame"]')).toHaveCount(0);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-single-game.png', fullPage: true });
  });

  test('keeps Tape focused on selected-season profiles and moves derived matchup outputs to Pregame', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/rivalry-lab');
    await page.locator('[data-osu]').selectOption('1995');
    await page.locator('[data-mich]').selectOption('2023');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();

    await expect(page.getByRole('heading', { name: 'TALE OF THE TAPE' })).toBeVisible();
    await expect(page.locator('[data-view="tape"] [data-context]')).toContainText('1995 OHIO STATE × 2023 MICHIGAN');
    await expect(page.getByTestId('season-profile-ohio-state')).toContainText('OBSERVED SCORING');
    await expect(page.getByTestId('season-profile-michigan')).toContainText('DERIVED SRS RANKINGS');
    await expect(page.locator('[data-tape]')).toHaveCount(0);

    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();
    for (const step of ['GRADE BOTH SEASONS', 'TURN THE GAPS INTO POINTS', 'SET THE EXPECTED SCORE', 'TURN THE MARGIN INTO A CHANCE']) {
      await expect(page.getByRole('heading', { name: step })).toBeVisible();
    }
    await expect(page.locator('.step em').first()).toHaveText('DERIVED');
    await expect(page.locator('[data-input-list]')).toContainText('OFFENSE RATING');
    await expect(page.locator('[data-osu-driver]')).toContainText(/expects Ohio State to score [\d.]+ points (more|fewer) than an average team/);
    await expect(page.locator('[data-expected-score]')).toContainText('27 MICH');
    await expect(page.locator('[data-expected-score]')).toContainText('24 OSU');
    await expect(page.locator('[data-win-probability]')).toBeVisible();
    const stepOrder = await page.evaluate(() => {
      const tops = ['[data-input-list]', '[data-osu-driver]', '[data-expected-score]', '[data-win-probability]', '[data-pregame-play]']
        .map((selector) => document.querySelector(selector)!.getBoundingClientRect().top);
      return tops.every((top, index) => index === 0 || top > tops[index - 1]);
    });
    expect(stepOrder).toBe(true);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-pregame-desktop.png', fullPage: true });
  });

  test('keeps the 1995 Ohio State and 2023 Michigan pregame readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/rivalry-lab');
    await page.locator('[data-osu]').selectOption('1995');
    await page.locator('[data-mich]').selectOption('2023');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();

    await expect(page.locator('[data-expected-score]')).toBeVisible();
    await expect(page.locator('[data-input-list]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-pregame-mobile.png', fullPage: true });
    await page.getByRole('button', { name: 'SIMULATE', exact: true }).click();
    await expect(page.locator('[data-game-score]')).toContainText('TYPICAL SCORE');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-game-mobile.png', fullPage: true });
  });

  test('shows rich-data context for the 2014 Ohio State and 2023 Michigan pregame and game on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/rivalry-lab');
    await page.locator('[data-osu]').selectOption('2014');
    await page.locator('[data-mich]').selectOption('2023');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();

    await expect(page.locator('[data-simulation-coverage]')).toContainText('RICH DATA');
    await expect(page.locator('[data-simulation-coverage]')).toContainText('Imported game data is active for both selected seasons.');
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-enriched-pregame-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'SIMULATE', exact: true }).click();
    await expect(page.locator('[data-model-call]')).toBeVisible();
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-enriched-game-desktop.png', fullPage: true });
  });

  test('shows rich-data context for the 2014 Ohio State and 2023 Michigan on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/rivalry-lab');
    await page.locator('[data-osu]').selectOption('2014');
    await page.locator('[data-mich]').selectOption('2023');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();

    await expect(page.locator('[data-simulation-coverage]')).toContainText('RICH DATA');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-enriched-pregame-mobile.png', fullPage: true });
    await page.getByRole('button', { name: 'SIMULATE', exact: true }).click();
    await expect(page.locator('[data-model-call]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-enriched-game-mobile.png', fullPage: true });
  });

  test('shows the model call with the full breakdown after one Simulate action', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/rivalry-lab');
    await page.locator('[data-osu]').selectOption('2014');
    await page.locator('[data-mich]').selectOption('2023');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE', exact: true }).click();

    const call = page.locator('[data-model-call]');
    await expect(call).toBeVisible();
    await expect(call.getByRole('heading', { name: "THE MODEL'S RESULTS" })).toBeVisible();
    await expect(call.locator('[data-call-favorite]')).toContainText(/WAS FAVORED$|^UPSET:/);
    await expect(call.locator('[data-call-share]')).toContainText(/won \d+% of them\./);
    await expect(call.locator('[data-call-one-score]')).toContainText(/% OF GAMES ENDED WITHIN ONE SCORE/);
    await expect(call.locator('[data-call-upset]')).toContainText(/^UNDERDOG CHECK · \w+.* HAD A \d+% CHANCE PREGAME AND WON \d+% OF THE GAMES \([+-]?\d+ PTS\)/);
    await expect(page.locator('[data-game-score]')).toContainText('TYPICAL SCORE');
    const typicalScores = await page.locator('[data-game-score] strong').allTextContents();
    const labelText = await page.locator('[data-run-game-label]').textContent();
    expect(labelText).toMatch(/MICHIGAN \d+, OHIO STATE \d+/);
    if (!labelText?.includes('CLOSEST GAME')) {
      expect(labelText).toContain(`MICHIGAN ${typicalScores[0]}, OHIO STATE ${typicalScores[1]}`);
    }
    expect(await page.locator('[data-timeline] .q-mark').count()).toBeGreaterThanOrEqual(4);
    await expect(call.locator('[data-call-extremes]')).toContainText('BIGGEST OHIO STATE WIN');
    await expect(call.locator('[data-call-extremes]')).toContainText('BIGGEST MICHIGAN WIN');

    await call.getByText('SEE THE FULL BREAKDOWN').click();
    await expect(call.locator('.margin-row')).toHaveCount(6);
    await expect(call.locator('[data-breakdown-facts]')).toContainText('OVERTIME RATE');
    await expect(call.locator('[data-breakdown-facts]')).toContainText('BLOWOUTS');
    await expect(call.locator('[data-breakdown-facts]')).toContainText('RICH DATA');
    await expect(call.locator('[data-breakdown-versions]')).toContainText('drive-v2');
    await expect(call.locator('[data-breakdown-versions]')).toContainText('opp-adjust-v1');
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-model-call.png', fullPage: true });

    await expect(page.getByText(/BEST OF 10|SIM 100|1,000 GAMES|RUN COUNT/i)).toHaveCount(0);
    expect(await page.evaluate(() => document.querySelectorAll('input[type="number"], button[data-run]:not([data-run="1"])').length)).toBe(0);
  });

  test('keeps the model call readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/rivalry-lab');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE', exact: true }).click();

    await expect(page.locator('[data-model-call]')).toBeVisible();
    await page.locator('[data-model-call]').getByText('SEE THE FULL BREAKDOWN').click();
    await expect(page.locator('.margin-row')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'tmp/screenshots/rivalry-lab-model-call-mobile.png', fullPage: true });
  });
});
