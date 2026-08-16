import { describe, expect, it } from 'vitest';

import { GET } from '../matchup';

describe('Rivalry Lab matchup API', () => {
  it('returns the normalized cross-era matchup for 1995 Ohio State and 2023 Michigan', async () => {
    const response = await GET({ url: new URL('http://localhost/api/matchup?osuYear=1995&michYear=2023') } as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.matchup.michigan.winProbability).toBeGreaterThanOrEqual(0.5);
    expect(payload.matchup.michigan.winProbability).toBeLessThanOrEqual(0.6);
    expect(Math.abs(payload.matchup.expectedMargin)).toBeLessThan(7);
    expect(payload.simulationCoverage).toBe('score-and-schedule');
    expect(payload.usedInputs).toEqual({});
    expect(payload.versions.adjustmentModelVersion).toBe('opp-adjust-v1');
  });

  it('reports rich coverage and the derived inputs for a season pair that has them', async () => {
    const response = await GET({ url: new URL('http://localhost/api/matchup?osuYear=2014&michYear=2023') } as never);
    const payload = await response.json();

    expect(payload.simulationCoverage).toBe('rich-game-data');
    expect(payload.usedInputs.ohioState.possessionsPerGame).toBeGreaterThan(0);
    expect(payload.usedInputs.michigan.touchdownShare).toBeGreaterThan(0);
  });
});
