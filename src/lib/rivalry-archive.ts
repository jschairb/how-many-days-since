import { rivalrySnapshot, type TeamId, type TeamSeasonSnapshot } from './rivalry-snapshot';

export type RivalryTeam = 'Ohio State' | 'Michigan';
/** A side of a meeting. Tied games carry 'Tie' as both the winner and the loser. */
export type RivalrySide = RivalryTeam | 'Tie';
/** Whose colors a side wears. 'ink' is the neutral the pages and cards fall back to. */
export type SideTone = TeamId | 'ink';

/** The order the archive names the teams in when neither one won. */
const TIED_MEETING_ORDER: readonly [RivalryTeam, RivalryTeam] = ['Ohio State', 'Michigan'];

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
/** Every snapshot per-game average is a raw quotient, so none of them print as-is. */
export const formatPerGame = (value: number | null | undefined, digits = 1) => value === null || value === undefined ? null : value.toFixed(digits);
/** Snapshot rates are stored as fractions of one. */
export const formatRate = (value: number | null | undefined, digits = 1) => value === null || value === undefined ? null : `${(value * 100).toFixed(digits)}%`;
/** `possessionSecondsPerGame` is a raw second count. */
export const formatClock = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) return null;
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};
export const teamNameFor = (teamId: TeamId): RivalryTeam => teamId === 'ohio-state' ? 'Ohio State' : 'Michigan';
export const teamSeasonFor = (teamId: TeamId, season: number): TeamSeasonSnapshot | undefined => rivalrySnapshot.ratings.teamSeasons.find((entry) => entry.teamId === teamId && entry.season === season);
export const formatRecord = ({ wins, losses, ties }: Pick<TeamSeasonSnapshot, 'wins' | 'losses' | 'ties'>) => `${wins}-${losses}${ties ? `-${ties}` : ''}`;

/** One team's half of a meeting: who they are, what they scored, how they were ranked. */
export interface MeetingSide {
  team: RivalryTeam;
  teamId: TeamId;
  score: number;
  rank: number | null;
}

/** The fields of a `rivalry-games.json` row that describe the two sides. */
export interface MeetingResult {
  winner: string;
  loser: string;
  wScore: number;
  lScore: number;
  wRank: number | null;
  lRank: number | null;
}

/**
 * Both teams of a meeting, named. A decided game lists the winner first. A tie
 * names neither team in the record, so it falls back to `TIED_MEETING_ORDER`.
 *
 * The two scores of a tie are equal, so that order settles only which team
 * each rank column belongs to, and no tied meeting in the record reports a
 * rank. The result itself is not encoded here: read `game.winner` for that,
 * and `sideTone` for the color it earns.
 */
export function meetingSides(game: MeetingResult): [MeetingSide, MeetingSide] {
  const [first, second]: readonly [RivalryTeam, RivalryTeam] = game.winner === 'Tie'
    ? TIED_MEETING_ORDER
    : [game.winner as RivalryTeam, game.loser as RivalryTeam];
  return [
    { team: first, teamId: teamIdFor(first), score: game.wScore, rank: game.wRank },
    { team: second, teamId: teamIdFor(second), score: game.lScore, rank: game.lRank },
  ];
}
