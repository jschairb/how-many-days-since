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

  it('rejects unavailable years', () => {
    expect(() => validateMatchupInput({ osuYear: 1969, michYear: 2023 })).toThrow('Ohio State season must be between 1970 and 2025');
  });
});
