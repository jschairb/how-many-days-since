import { describe, expect, it } from 'vitest';
import { formatSeasonRank, modelConfig, profileForSeason, ratedSeason, rivalrySnapshot, validatePublicSnapshot } from '../rivalry-snapshot';

describe('validatePublicSnapshot', () => {
  it('accepts the reduced public snapshot contract', () => {
    expect(validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v1', model: { pointsPerStandardDeviation: 5 }, ratings: { teamSeasons: [{ teamId: 'ohio-state', crossEra: { overall: 1, offense: 1, defense: 1 } }, { teamId: 'michigan', crossEra: { overall: 1, offense: 1, defense: 1 } }] } })).toBe(true);
  });

  it('rejects a snapshot with an unsupported team', () => {
    expect(() => validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v1', ratings: { teamSeasons: [{ teamId: 'notre-dame' }] } })).toThrow('public snapshot');
  });

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
  });

  it('rejects a snapshot without normalized cross-era ratings', () => {
    expect(() => validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v1', model: { pointsPerStandardDeviation: 5 }, ratings: { teamSeasons: [{ teamId: 'ohio-state' }] } })).toThrow('cross-era');
  });
});
