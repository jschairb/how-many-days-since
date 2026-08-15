import snapshot from '../data/rivalry-lab-snapshot.json';
import type { Rating } from './rivalry-lab';

type Snapshot = typeof snapshot;
export const rivalrySnapshot = snapshot as Snapshot;
export function ratedSeason(teamId: 'ohio-state' | 'michigan', season: number): Rating {
  const entry = rivalrySnapshot.ratings.teamSeasons.find((rating) => rating.teamId === teamId && rating.season === season);
  if (!entry?.srs) throw new Error(`No rated ${teamId} season for ${season}`);
  return { ...entry.srs, teamId, season };
}
