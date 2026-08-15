import { describe, expect, it } from 'vitest';

import { calculateMatchup, simulateGame, simulateSeries, validateMatchupInput } from '../rivalry-lab';
import { modelConfig, ratedSeason } from '../rivalry-snapshot';

const ohioState = ratedSeason('ohio-state', 1995);
const michigan = ratedSeason('michigan', 2023);
const model = modelConfig();

describe('Rivalry Lab model', () => {
  it('returns complementary era-neutral win probabilities', () => {
    const matchup = calculateMatchup(ohioState, michigan, model);

    expect(matchup.ohioState.winProbability + matchup.michigan.winProbability).toBeCloseTo(1);
    expect(matchup.michigan.expectedScore).toBeGreaterThan(matchup.ohioState.expectedScore);
  });

  it('keeps 1995 Ohio State and 2023 Michigan close using cross-era ratings', () => {
    const matchup = calculateMatchup(ratedSeason('ohio-state', 1995), ratedSeason('michigan', 2023), modelConfig());

    expect(matchup.michigan.winProbability).toBeGreaterThanOrEqual(0.5);
    expect(matchup.michigan.winProbability).toBeLessThanOrEqual(0.6);
    expect(Math.abs(matchup.expectedMargin)).toBeLessThan(7);
  });

  it('replays a seeded game exactly', () => {
    const matchup = calculateMatchup(ohioState, michigan, model);

    expect(simulateGame(matchup, '19952023', model)).toEqual(simulateGame(matchup, '19952023', model));
  });

  it('accounts for every game in a requested series', () => {
    const matchup = calculateMatchup(ohioState, michigan, model);
    const series = simulateSeries(matchup, '19952023', 100, model);

    expect(series.games).toHaveLength(100);
    expect(series.ohioState.wins + series.michigan.wins + series.ties).toBe(100);
  });

  it('rejects unavailable years and unsupported simulation sizes', () => {
    expect(() => validateMatchupInput({ osuYear: 1969, michYear: 2023, count: 1 })).toThrow('Ohio State season must be between 1970 and 2025');
    expect(() => validateMatchupInput({ osuYear: 1995, michYear: 2023, count: 99 })).toThrow('Simulation count must be one of 1, 10, 100, 1000, or 10000');
  });
});
