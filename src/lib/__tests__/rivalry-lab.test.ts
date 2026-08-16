import { describe, expect, it } from 'vitest';

import { calculateMatchup, simulateGame, validateMatchupInput, type Matchup, type SimulationContext } from '../rivalry-lab';
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

  it('uses score and schedule inputs when only one selected season has rich coverage', () => {
    const context = simulationContext('ohio-state', 1995, 'michigan', 2023);

    expect(context.simulationCoverage).toBe('score-and-schedule');
    expect(context.usedInputs).toEqual({});
  });

  it('uses derived simulation inputs only when both selected seasons have rich coverage', () => {
    const context = simulationContext('ohio-state', 2014, 'michigan', 2023);

    expect(context.simulationCoverage).toBe('rich-game-data');
    expect(context.usedInputs.ohioState?.possessionsPerGame).toBeGreaterThan(0);
    expect(context.usedInputs.michigan?.turnoverRatePerDrive).toBeGreaterThan(0);
    expect(context.usedInputs.ohioState?.scoringRateMultiplier).toBeGreaterThan(0);
    expect(context.usedInputs.michigan?.touchdownShare).toBeGreaterThan(0);
  });

  it('replays a rich seeded game exactly', () => {
    const matchup = calculateMatchup(ohioState, michigan, model);

    const context = simulationContext('ohio-state', 2014, 'michigan', 2023);
    expect(simulateGame(matchup, '20142023', model, context)).toEqual(simulateGame(matchup, '20142023', model, context));
  });

  it('lets derived pace change the number of simulated possessions', () => {
    const matchup = calculateMatchup(ohioState, michigan, model);
    const slow = simulationContext('ohio-state', 2014, 'michigan', 2023);
    const paceInputs = { possessionsPerGame: 16, turnoverRatePerDrive: 0.08, scoringRateMultiplier: 1, touchdownShare: 0.66 };
    const fast: SimulationContext = { ...slow, ohioState: { ...slow.ohioState, inputs: paceInputs }, michigan: { ...slow.michigan, inputs: paceInputs } };

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

  it('matches the cross-repo golden vector from the rivalry_lab engine', () => {
    // Identical matchup, seed, and inputs as src/product/simulation.test.ts in rivalry_lab;
    // the expected outcomes are shared verbatim so the two engines cannot drift apart.
    const goldenMatchup: Matchup = {
      modelVersion: 'srs-era-neutral-v1', neutralPointsPerTeam: 25, expectedMargin: 6,
      ohioState: { teamId: 'ohio-state', expectedScore: 30, winProbability: 0.65, scoreAdvantage: 5 },
      michigan: { teamId: 'michigan', expectedScore: 24, winProbability: 0.35, scoreAdvantage: -1 },
    };
    const goldenContext: SimulationContext = {
      simulationCoverage: 'rich-game-data',
      usedInputs: {},
      ohioState: { scheduleStrength: 1, inputs: { possessionsPerGame: 11, turnoverRatePerDrive: 0.08, scoringRateMultiplier: 1.1, touchdownShare: 0.7 } },
      michigan: { scheduleStrength: 1, inputs: { possessionsPerGame: 11, turnoverRatePerDrive: 0.12, scoringRateMultiplier: 0.95, touchdownShare: 0.62 } },
    };
    const game = simulateGame(goldenMatchup, 'golden-1', model, goldenContext);
    expect(game.drives.filter((drive) => drive.quarter <= 4)).toHaveLength(22);
    expect(game.drives.slice(0, 10).map((drive) => `${drive.teamId}:${drive.outcome}`)).toEqual([
      'ohio-state:PUNT', 'michigan:TD', 'ohio-state:DOWNS', 'michigan:PUNT', 'ohio-state:PUNT',
      'michigan:PUNT', 'ohio-state:PUNT', 'michigan:TD', 'ohio-state:TD', 'michigan:PUNT',
    ]);
  });

  it('rejects unavailable years', () => {
    expect(() => validateMatchupInput({ osuYear: 1969, michYear: 2023 })).toThrow('Ohio State season must be between 1970 and 2025');
  });
});
