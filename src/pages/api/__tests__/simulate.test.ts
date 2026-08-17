import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '../simulate';
import { rivalrySnapshot } from '../../../lib/rivalry-snapshot';

afterEach(() => { delete process.env.SIMULATION_RUN_COUNT; });

const simulate = (body: Record<string, unknown>) =>
  POST({ request: new Request('http://localhost/api/simulate', { method: 'POST', body: JSON.stringify(body) }) } as never);

describe('Rivalry Lab simulate API', () => {
  it('returns one displayed game plus an aggregate series at the configured run count', async () => {
    const response = await simulate({ osuYear: 2014, michYear: 2023, seed: '20142023' });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.result.drives.length).toBeGreaterThan(0);
    expect(payload.result.seed).toMatch(/^20142023:\d+$/);
    expect(payload.result.seed).toBe(`20142023:${payload.representative.index}`);
    if (payload.representative.matchesTypicalScore) {
      expect(payload.result.ohioState.points).toBe(payload.series.ohioState.typicalScore);
      expect(payload.result.michigan.points).toBe(payload.series.michigan.typicalScore);
    }
    expect(payload.series.runCount).toBe(rivalrySnapshot.model.simulationRunCount);
    expect(payload.series.ohioState.wins + payload.series.michigan.wins).toBe(payload.series.runCount);
    expect(payload.series.marginBuckets.reduce((sum: number, bucket: { games: number }) => sum + bucket.games, 0)).toBe(payload.series.runCount);
    expect(payload.simulationCoverage).toBe('rich-game-data');
  });

  it('keeps the repeated-game collection and its drive logs out of the response', async () => {
    const response = await simulate({ osuYear: 2014, michYear: 2023, seed: '20142023' });
    const payload = await response.json();

    expect(payload.series.games).toBeUndefined();
    expect(payload.games).toBeUndefined();
    // The only drive log in the whole payload belongs to the displayed game (present in
    // `result` and mirrored once in its SIMULATED evidence entry).
    const serialized = JSON.stringify(payload);
    expect(serialized.split('"drives"').length - 1).toBe(2);
    expect(JSON.stringify(payload.series)).not.toContain('"drives"');
  });

  it('replays the identical payload for the same seed, teams, and versions', async () => {
    process.env.SIMULATION_RUN_COUNT = '200';
    const first = await simulate({ osuYear: 2014, michYear: 2023, seed: '20142023' });
    const second = await simulate({ osuYear: 2014, michYear: 2023, seed: '20142023' });
    expect(await first.json()).toEqual(await second.json());
  });

  it('ignores a client-sent run count', async () => {
    process.env.SIMULATION_RUN_COUNT = '150';
    const response = await simulate({ osuYear: 2014, michYear: 2023, seed: '1', count: 3 });
    const payload = await response.json();
    expect(payload.series.runCount).toBe(150);
  });

  it('falls back to score-and-schedule coverage for a mixed-era matchup', async () => {
    process.env.SIMULATION_RUN_COUNT = '100';
    const response = await simulate({ osuYear: 1995, michYear: 2023, seed: '19952023' });
    const payload = await response.json();
    expect(payload.simulationCoverage).toBe('score-and-schedule');
    expect(payload.usedInputs).toEqual({});
    expect(payload.series.runCount).toBe(100);
  });

  it('labels the matchup DERIVED and the game and series SIMULATED', async () => {
    process.env.SIMULATION_RUN_COUNT = '50';
    const response = await simulate({ osuYear: 2014, michYear: 2023, seed: '2' });
    const payload = await response.json();
    expect(payload.evidence.map((entry: { type: string }) => entry.type)).toEqual(['DERIVED', 'SIMULATED', 'SIMULATED']);
    expect(payload.versions.adjustmentModelVersion).toBe('opp-adjust-v1');
    expect(payload.versions.simulationEngineVersion).toBe('drive-v2');
  });

  it('rejects unavailable years with a useful error', async () => {
    const response = await simulate({ osuYear: 1969, michYear: 2023 });
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain('between 1970 and 2025');
  });
});
