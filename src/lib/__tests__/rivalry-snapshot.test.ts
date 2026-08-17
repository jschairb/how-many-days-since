import { describe, expect, it } from 'vitest';
import { coverageForSeason, formatSeasonRank, modelConfig, profileForSeason, ratedSeason, rivalrySnapshot, validatePublicSnapshot } from '../rivalry-snapshot';

const validTeamSeasons = [
  { teamId: 'ohio-state', crossEra: { overall: 1, offense: 1, defense: 1 } },
  { teamId: 'michigan', crossEra: { overall: 1, offense: 1, defense: 1 } },
];
const validModel = { pointsPerStandardDeviation: 5, simulationRunCount: 5000 };

describe('validatePublicSnapshot', () => {
  it('accepts the reduced public snapshot contract', () => {
    expect(validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v2', model: validModel, simulationInputs: { 'ohio-state:2014': { possessionsPerGame: 13.1, turnoverRatePerDrive: 0.13, scoringRateMultiplier: 1.16, touchdownShare: 0.72 } }, coverage: [], ratings: { teamSeasons: validTeamSeasons } })).toBe(true);
  });

  it('rejects a snapshot without the simulationInputs block', () => {
    expect(() => validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v2', model: validModel, coverage: [], ratings: { teamSeasons: validTeamSeasons } })).toThrow('missing simulation inputs');
  });

  it('rejects a snapshot without the coverage block', () => {
    expect(() => validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v2', model: validModel, simulationInputs: {}, ratings: { teamSeasons: validTeamSeasons } })).toThrow('missing coverage');
  });

  it('rejects the retired v1 schema', () => {
    expect(() => validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v1', model: validModel, ratings: { teamSeasons: validTeamSeasons } })).toThrow('public snapshot schema');
  });

  it('rejects a snapshot with an unsupported team', () => {
    expect(() => validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v2', ratings: { teamSeasons: [{ teamId: 'notre-dame' }] } })).toThrow('public snapshot');
  });

  it('rejects a snapshot without the harness-selected run count', () => {
    expect(() => validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v2', model: { pointsPerStandardDeviation: 5 }, ratings: { teamSeasons: validTeamSeasons } })).toThrow('run count');
  });

  it('rejects a snapshot with broken simulation inputs', () => {
    expect(() => validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v2', model: validModel, simulationInputs: { 'ohio-state:2014': { possessionsPerGame: Number.NaN } }, ratings: { teamSeasons: validTeamSeasons } })).toThrow('simulation inputs');
  });

  it('rejects a snapshot without normalized cross-era ratings', () => {
    expect(() => validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v2', model: validModel, ratings: { teamSeasons: [{ teamId: 'ohio-state' }] } })).toThrow('cross-era');
  });

  it('accepts the committed snapshot', () => {
    expect(validatePublicSnapshot(rivalrySnapshot)).toBe(true);
  });
});

describe('snapshot accessors', () => {
  it('returns null when a selected season has no profile', () => {
    expect(profileForSeason('ohio-state', 1995, [{ teamId: 'ohio-state', season: 1995, profile: null }])).toBeNull();
  });

  it('formats a same-season derived rank with its rated-team count', () => {
    expect(formatSeasonRank(2, 144)).toBe('NO. 2 OF 144');
  });

  it('exposes the canonical cross-era ratings and exported model parameters', () => {
    const ohioState = ratedSeason('ohio-state', 1995);
    const config = modelConfig();
    const snapshotSeason = rivalrySnapshot.ratings.teamSeasons.find((season) => season.teamId === 'ohio-state' && season.season === 1995)!;

    expect(ohioState).toEqual(snapshotSeason.crossEra);
    expect(config.pointsPerStandardDeviation).toBe(rivalrySnapshot.model.pointsPerStandardDeviation);
    expect(config.simulationRunCount).toBe(rivalrySnapshot.model.simulationRunCount);
  });

  it('labels coverage per team-season from the exported report', () => {
    expect(coverageForSeason('ohio-state', 1970)).toMatchObject({ coverage: 'score-and-schedule' });
    expect(coverageForSeason('ohio-state', 2014)).toMatchObject({ coverage: 'rich-game-data' });
  });

  it('publishes approved observed aggregates inside rich season profiles', () => {
    const profile = profileForSeason('ohio-state', 2014);
    expect(profile?.observed.yardsPerPlay).toBeGreaterThan(0);
    expect(profile?.observed.possessionsPerGame).toBeGreaterThan(0);
  });
});
