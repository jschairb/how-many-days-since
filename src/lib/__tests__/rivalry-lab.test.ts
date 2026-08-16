import { describe, expect, it } from 'vitest';

import { calculateMatchup, simulateGame, validateMatchupInput } from '../rivalry-lab';
import { modelConfig, ratedSeason, simulationContext } from '../rivalry-snapshot';

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

  it('uses score and schedule inputs when only one selected season has enrichment', () => {
    const context = simulationContext('ohio-state', 1995, 'michigan', 2023);

    expect(context.simulationCoverage).toBe('score-and-schedule');
    expect(context.usedInputs).toEqual({});
  });

  it('uses possession and turnover inputs only when both selected seasons have enrichment', () => {
    const context = simulationContext('ohio-state', 2014, 'michigan', 2023);

    expect(context.simulationCoverage).toBe('box-score-enhanced');
    expect(context.usedInputs.possessionsPerGame).toBeDefined();
    expect(context.usedInputs.turnoversPerGame).toBeDefined();
  });

  it('replays an enriched seeded game exactly', () => {
    const matchup = calculateMatchup(ohioState, michigan, model);

    const context = simulationContext('ohio-state', 2014, 'michigan', 2023);
    expect(simulateGame(matchup, '20142023', model, context)).toEqual(simulateGame(matchup, '20142023', model, context));
  });

  it('lets enriched pace change the number of simulated possessions', () => {
    const matchup = calculateMatchup(ohioState, michigan, model);
    const slow = simulationContext('ohio-state', 2014, 'michigan', 2023);
    const fast = { ...slow, ohioState: { ...slow.ohioState, enrichment: { possessionsPerGame: 16, turnoversPerGame: 1 } }, michigan: { ...slow.michigan, enrichment: { possessionsPerGame: 16, turnoversPerGame: 1 } } };

    expect(simulateGame(matchup, 'pace', model, fast).drives).toHaveLength(32);
    expect(simulateGame(matchup, 'pace', model, slow).drives.length).toBeLessThan(32);
  });

  it('draws a different random stream for a different matchup under the same seed', () => {
    const strong = { teamId: 'ohio-state', season: 2000, overall: 1.5, offense: 1.2, defense: 1.2, scheduleStrength: 1 };
    const weak = { teamId: 'michigan', season: 2000, overall: 0, offense: 0, defense: 0, scheduleStrength: 1 };
    const matchupA = calculateMatchup(strong, weak, model);
    const matchupB = calculateMatchup({ ...strong, overall: 1.52 }, weak, model);

    const gameA = simulateGame(matchupA, 'shared-seed', model);
    const gameB = simulateGame(matchupB, 'shared-seed', model);

    expect(gameA.drives.map((drive) => drive.outcome)).not.toEqual(gameB.drives.map((drive) => drive.outcome));
  });

  it('lets the favorite win most deterministic games under one fixed seed across many matchups', () => {
    const weak = { teamId: 'michigan', season: 2000, overall: 0, offense: 0, defense: 0, scheduleStrength: 1 };
    let favoredWins = 0;
    const combinations = 60;
    for (let index = 0; index < combinations; index += 1) {
      const strong = { teamId: 'ohio-state', season: 1900 + index, overall: 1.5 + index * 0.025, offense: 1.2, defense: 1.2, scheduleStrength: 1 };
      const matchup = calculateMatchup(strong, weak, model);
      expect(matchup.ohioState.winProbability).toBeGreaterThan(0.6);
      if (simulateGame(matchup, '19952023', model).winner === 'ohio-state') favoredWins += 1;
    }

    expect(favoredWins).toBeGreaterThan(combinations / 2);
  });

  it('rejects unavailable years', () => {
    expect(() => validateMatchupInput({ osuYear: 1969, michYear: 2023 })).toThrow('Ohio State season must be between 1970 and 2025');
  });
});
