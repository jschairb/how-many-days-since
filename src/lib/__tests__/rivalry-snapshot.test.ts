import { describe, expect, it } from 'vitest';
import { formatSeasonRank, profileForSeason, validatePublicSnapshot } from '../rivalry-snapshot';

describe('validatePublicSnapshot', () => {
  it('accepts the reduced public snapshot contract', () => {
    expect(validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v1', ratings: { teamSeasons: [{ teamId: 'ohio-state' }, { teamId: 'michigan' }] } })).toBe(true);
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
});
