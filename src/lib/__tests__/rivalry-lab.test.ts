import { describe, expect, it } from 'vitest';

import { calculateMatchup, simulateGame, simulateSeries, validateMatchupInput } from '../rivalry-lab';

const ohioState = { teamId: 'ohio-state', season: 1995, overall: 8, offense: 12, defense: 5, scheduleStrength: 2 };
const michigan = { teamId: 'michigan', season: 2023, overall: 12, offense: 7, defense: 10, scheduleStrength: 3 };

describe('Rivalry Lab model', () => {
  it('returns complementary era-neutral win probabilities', () => {
    const matchup = calculateMatchup(ohioState, michigan, 25.32);

    expect(matchup.ohioState.winProbability + matchup.michigan.winProbability).toBeCloseTo(1);
    expect(matchup.michigan.expectedScore).toBeGreaterThan(matchup.ohioState.expectedScore);
  });

  it('replays a seeded game exactly', () => {
    const matchup = calculateMatchup(ohioState, michigan, 25.32);

    expect(simulateGame(matchup, '19952023')).toEqual(simulateGame(matchup, '19952023'));
  });

  it('accounts for every game in a requested series', () => {
    const matchup = calculateMatchup(ohioState, michigan, 25.32);
    const series = simulateSeries(matchup, '19952023', 100);

    expect(series.games).toHaveLength(100);
    expect(series.ohioState.wins + series.michigan.wins + series.ties).toBe(100);
  });

  it('rejects unavailable years and unsupported simulation sizes', () => {
    expect(() => validateMatchupInput({ osuYear: 1969, michYear: 2023, count: 1 })).toThrow('Ohio State season must be between 1970 and 2025');
    expect(() => validateMatchupInput({ osuYear: 1995, michYear: 2023, count: 99 })).toThrow('Simulation count must be one of 1, 10, 100, 1000, or 10000');
  });
});
