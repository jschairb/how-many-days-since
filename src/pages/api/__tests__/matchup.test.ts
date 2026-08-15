import { describe, expect, it } from 'vitest';

import { GET } from '../matchup';
import { POST } from '../simulate';

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
  });

  it('returns exact fallback coverage for a mixed-era matchup', async () => {
    const response = await POST({ request: new Request('http://localhost/api/simulate', { method: 'POST', body: JSON.stringify({ osuYear: 1995, michYear: 2023, seed: '19952023' }) }) } as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.simulationCoverage).toBe('score-and-schedule');
    expect(payload.usedInputs).toEqual({});
  });

  it('returns exact enriched coverage and replays a seeded game', async () => {
    const request = () => new Request('http://localhost/api/simulate', { method: 'POST', body: JSON.stringify({ osuYear: 2014, michYear: 2023, seed: '20142023' }) });
    const first = await POST({ request: request() } as never);
    const second = await POST({ request: request() } as never);

    const firstPayload = await first.json();
    expect(firstPayload.simulationCoverage).toBe('box-score-enhanced');
    expect(firstPayload.usedInputs.possessionsPerGame).toBeDefined();
    expect(firstPayload.usedInputs.turnoversPerGame).toBeDefined();
    expect(firstPayload).toEqual(await second.json());
  });
});
