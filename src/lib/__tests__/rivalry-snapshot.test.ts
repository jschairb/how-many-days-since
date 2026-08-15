import { describe, expect, it } from 'vitest';
import { validatePublicSnapshot } from '../rivalry-snapshot';

describe('validatePublicSnapshot', () => {
  it('accepts the reduced public snapshot contract', () => {
    expect(validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v1', ratings: { teamSeasons: [{ teamId: 'ohio-state' }, { teamId: 'michigan' }] } })).toBe(true);
  });

  it('rejects a snapshot with an unsupported team', () => {
    expect(() => validatePublicSnapshot({ schemaVersion: 'rivalry-lab-public-snapshot-v1', ratings: { teamSeasons: [{ teamId: 'notre-dame' }] } })).toThrow('public snapshot');
  });
});
