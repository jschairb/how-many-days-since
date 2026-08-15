import snapshot from '../data/rivalry-lab-snapshot.json';
import type { Rating } from './rivalry-lab';
import type { ModelConfig } from './rivalry-lab';

type Snapshot = typeof snapshot;
export const rivalrySnapshot = snapshot as Snapshot;
export function modelConfig(): ModelConfig {
  const model = rivalrySnapshot.model as Omit<ModelConfig, 'neutralPointsPerTeam'>;
  return { ...model, neutralPointsPerTeam: rivalrySnapshot.neutralPointsPerTeam };
}

export function validatePublicSnapshot(value: unknown): value is Snapshot {
  if (!value || typeof value !== 'object') throw new Error('Invalid public snapshot');
  const candidate = value as { schemaVersion?: string; ratings?: { teamSeasons?: Array<{ teamId?: string }> } };
  if (candidate.schemaVersion !== 'rivalry-lab-public-snapshot-v1') throw new Error('Invalid public snapshot schema');
  if (!candidate.ratings?.teamSeasons?.every((season) => season.teamId === 'ohio-state' || season.teamId === 'michigan')) throw new Error('Invalid public snapshot teams');
  return true;
}
export function ratedSeason(teamId: 'ohio-state' | 'michigan', season: number): Rating {
  const entry = rivalrySnapshot.ratings.teamSeasons.find((rating) => rating.teamId === teamId && rating.season === season);
  if (!entry?.srs) throw new Error(`No rated ${teamId} season for ${season}`);
  return { ...entry.srs, teamId, season };
}
