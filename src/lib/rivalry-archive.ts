import { rivalrySnapshot, type TeamId, type TeamSeasonSnapshot } from './rivalry-snapshot';

export type RivalryTeam = 'Ohio State' | 'Michigan';

export const teamIdFor = (team: RivalryTeam): TeamId => team === 'Ohio State' ? 'ohio-state' : 'michigan';
export const teamNameFor = (teamId: TeamId): RivalryTeam => teamId === 'ohio-state' ? 'Ohio State' : 'Michigan';
export const teamSeasonFor = (teamId: TeamId, season: number): TeamSeasonSnapshot | undefined => rivalrySnapshot.ratings.teamSeasons.find((entry) => entry.teamId === teamId && entry.season === season);
export const formatRecord = ({ wins, losses, ties }: Pick<TeamSeasonSnapshot, 'wins' | 'losses' | 'ties'>) => `${wins}-${losses}${ties ? `-${ties}` : ''}`;
