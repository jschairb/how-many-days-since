import { rivalrySnapshot, type TeamId, type TeamSeasonSnapshot } from './rivalry-snapshot';

export type RivalryTeam = 'Ohio State' | 'Michigan';
/** A side of a meeting. Tied games carry 'Tie' as both the winner and the loser. */
export type RivalrySide = RivalryTeam | 'Tie';
/** Whose colors a side wears. 'ink' is the neutral the pages and cards fall back to. */
export type SideTone = TeamId | 'ink';

export const teamIdFor = (team: RivalryTeam): TeamId => team === 'Ohio State' ? 'ohio-state' : 'michigan';
/**
 * A tie belongs to neither team, so it takes neutral ink. Without this guard
 * `teamIdFor` reads 'Tie' as anything-but-Ohio-State and paints it navy.
 */
export const sideTone = (side: RivalrySide): SideTone => side === 'Tie' ? 'ink' : teamIdFor(side);
/** The `site.css` color class for a side's tone. */
export const sideClass = (side: RivalrySide): 'osu' | 'mich' | 'tie' => {
  const tone = sideTone(side);
  return tone === 'ink' ? 'tie' : tone === 'ohio-state' ? 'osu' : 'mich';
};
/** `scoringMargin` is a per-game average, and carries full float precision. */
export const formatScoringMargin = (scoringMargin: number) => `${scoringMargin >= 0 ? '+' : ''}${scoringMargin.toFixed(1)}`;
export const teamNameFor = (teamId: TeamId): RivalryTeam => teamId === 'ohio-state' ? 'Ohio State' : 'Michigan';
export const teamSeasonFor = (teamId: TeamId, season: number): TeamSeasonSnapshot | undefined => rivalrySnapshot.ratings.teamSeasons.find((entry) => entry.teamId === teamId && entry.season === season);
export const formatRecord = ({ wins, losses, ties }: Pick<TeamSeasonSnapshot, 'wins' | 'losses' | 'ties'>) => `${wins}-${losses}${ties ? `-${ties}` : ''}`;
