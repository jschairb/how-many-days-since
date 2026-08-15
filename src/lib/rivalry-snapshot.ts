import snapshot from '../data/rivalry-lab-snapshot.json';
import type { Enrichment, Rating, SimulationContext } from './rivalry-lab';
import type { ModelConfig } from './rivalry-lab';

export type TeamId = 'ohio-state' | 'michigan';

export type SeasonProfile = {
  observed: {
    conference: string | null;
    division: string | null;
    coach: string | null;
    finalApRank: number | null;
    cfbdPostseasonRank: number | null;
    pointsPerGame: number | null;
    pointsAllowedPerGame: number | null;
  };
  derived: {
    overallRank: number | null;
    offenseRank: number | null;
    defenseRank: number | null;
    scheduleStrengthRank: number | null;
    ratedTeams: number | null;
  };
  confidence: {
    score: number | null;
    reasons: string[];
  };
};

export type TeamSeasonSnapshot = {
  teamId: TeamId;
  season: number;
  games: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  scoringMargin: number;
  srs: Rating;
  crossEra: Rating;
  profile: SeasonProfile | null;
  evidenceType: 'DERIVED';
};

export type RivalrySnapshot = {
  schemaVersion: 'rivalry-lab-public-snapshot-v1';
  productVersion: string;
  ratingModelVersion: string;
  eraModelVersion: string;
  simulationEngineVersion: string;
  dataSnapshotVersion: string;
  generatedAt: string;
  neutralPointsPerTeam: number;
  model: Omit<ModelConfig, 'neutralPointsPerTeam'>;
  simulationEnrichment: Record<string, Enrichment>;
  rivalryGames: Array<{ season: number; cfbdGameId: number; date: string | null; cfbdBoxscoreUrl: string }>;
  ratings: {
    environments: Array<{ season: number; averagePointsPerTeam: number; games: number }>;
    teamSeasons: TeamSeasonSnapshot[];
  };
};

export const rivalrySnapshot = snapshot as RivalrySnapshot;
export function modelConfig(): ModelConfig {
  const model = rivalrySnapshot.model as Omit<ModelConfig, 'neutralPointsPerTeam'>;
  return { ...model, neutralPointsPerTeam: rivalrySnapshot.neutralPointsPerTeam };
}

export function validatePublicSnapshot(value: unknown): value is RivalrySnapshot {
  if (!value || typeof value !== 'object') throw new Error('Invalid public snapshot');
  const candidate = value as { schemaVersion?: string; model?: { pointsPerStandardDeviation?: unknown }; ratings?: { teamSeasons?: Array<{ teamId?: string; crossEra?: Rating }> } };
  if (candidate.schemaVersion !== 'rivalry-lab-public-snapshot-v1') throw new Error('Invalid public snapshot schema');
  if (!candidate.ratings?.teamSeasons?.every((season) => season.teamId === 'ohio-state' || season.teamId === 'michigan')) throw new Error('Invalid public snapshot teams');
  if (typeof candidate.model?.pointsPerStandardDeviation !== 'number') throw new Error('Invalid public snapshot model');
  if (!candidate.ratings.teamSeasons.every((season) => season.crossEra && Number.isFinite(season.crossEra.overall) && Number.isFinite(season.crossEra.offense) && Number.isFinite(season.crossEra.defense))) throw new Error('Invalid public snapshot cross-era ratings');
  return true;
}
export function ratedSeason(teamId: TeamId, season: number): Rating {
  const entry = rivalrySnapshot.ratings.teamSeasons.find((rating) => rating.teamId === teamId && rating.season === season);
  if (!entry?.crossEra) throw new Error(`No cross-era rating for ${teamId} season ${season}`);
  return { ...entry.crossEra, teamId, season };
}

export function simulationContext(ohioStateTeamId: TeamId, ohioStateSeason: number, michiganTeamId: TeamId, michiganSeason: number): SimulationContext {
  const ohioState = ratedSeason(ohioStateTeamId, ohioStateSeason);
  const michigan = ratedSeason(michiganTeamId, michiganSeason);
  const ohioStateEnrichment = rivalrySnapshot.simulationEnrichment[`${ohioStateTeamId}:${ohioStateSeason}`] ?? null;
  const michiganEnrichment = rivalrySnapshot.simulationEnrichment[`${michiganTeamId}:${michiganSeason}`] ?? null;
  const simulationCoverage = ohioStateEnrichment && michiganEnrichment ? 'box-score-enhanced' : 'score-and-schedule';
  return {
    simulationCoverage,
    usedInputs: simulationCoverage === 'box-score-enhanced' ? { possessionsPerGame: { ohioState: ohioStateEnrichment.possessionsPerGame!, michigan: michiganEnrichment.possessionsPerGame! }, turnoversPerGame: { ohioState: ohioStateEnrichment.turnoversPerGame, michigan: michiganEnrichment.turnoversPerGame } } : {},
    ohioState: { scheduleStrength: ohioState.scheduleStrength, enrichment: ohioStateEnrichment },
    michigan: { scheduleStrength: michigan.scheduleStrength, enrichment: michiganEnrichment },
  };
}

export function profileForSeason(teamId: TeamId, season: number, teamSeasons: readonly Pick<TeamSeasonSnapshot, 'teamId' | 'season' | 'profile'>[] = rivalrySnapshot.ratings.teamSeasons): SeasonProfile | null {
  return teamSeasons.find((entry) => entry.teamId === teamId && entry.season === season)?.profile ?? null;
}

export function formatSeasonRank(rank: number | null, ratedTeams: number | null): string {
  return rank === null ? 'UNRANKED' : `NO. ${rank}${ratedTeams === null ? '' : ` OF ${ratedTeams}`}`;
}
