import snapshot from '../data/rivalry-lab-snapshot.json';
import type { Rating, SimulationContext, SimulationInputs } from './rivalry-lab';
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
    yardsPerPlay: number | null;
    rushShare: number | null;
    thirdDownRate: number | null;
    turnoversPerGame: number | null;
    possessionsPerGame: number | null;
    possessionSecondsPerGame: number | null;
    firstDownsPerGame: number | null;
    redZoneTripsPerGame: number | null;
    redZoneScoreRate: number | null;
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
  coverage: 'rich-game-data' | 'score-and-schedule';
  profile: SeasonProfile | null;
  evidenceType: 'DERIVED';
};

export type RivalrySnapshot = {
  schemaVersion: 'rivalry-lab-public-snapshot-v2';
  productVersion: string;
  ratingModelVersion: string;
  eraModelVersion: string;
  simulationEngineVersion: string;
  adjustmentModelVersion: string;
  dataSnapshotVersion: string;
  generatedAt: string;
  neutralPointsPerTeam: number;
  model: Omit<ModelConfig, 'neutralPointsPerTeam'>;
  simulationInputs: Record<string, SimulationInputs>;
  coverage: Array<{ teamId: TeamId; season: number; coverage: 'rich-game-data' | 'score-and-schedule'; missingFields: string[] }>;
  validation: { modelVersion: string; games: unknown[]; metrics: Record<string, unknown> };
  rivalryGames: Array<{ season: number; cfbdGameId: number; date: string | null; cfbdBoxscoreUrl: string }>;
  ratings: {
    environments: Array<{ season: number; averagePointsPerTeam: number; games: number }>;
    teamSeasons: TeamSeasonSnapshot[];
  };
};

export const rivalrySnapshot = snapshot as unknown as RivalrySnapshot;
export function modelConfig(): ModelConfig {
  const model = rivalrySnapshot.model as Omit<ModelConfig, 'neutralPointsPerTeam'>;
  return { ...model, neutralPointsPerTeam: rivalrySnapshot.neutralPointsPerTeam };
}

export function validatePublicSnapshot(value: unknown): value is RivalrySnapshot {
  if (!value || typeof value !== 'object') throw new Error('Invalid public snapshot');
  const candidate = value as { schemaVersion?: string; model?: { pointsPerStandardDeviation?: unknown; simulationRunCount?: unknown }; simulationInputs?: Record<string, Partial<SimulationInputs>>; ratings?: { teamSeasons?: Array<{ teamId?: string; crossEra?: Rating }> } };
  if (candidate.schemaVersion !== 'rivalry-lab-public-snapshot-v2') throw new Error('Invalid public snapshot schema');
  if (!candidate.ratings?.teamSeasons?.every((season) => season.teamId === 'ohio-state' || season.teamId === 'michigan')) throw new Error('Invalid public snapshot teams');
  if (typeof candidate.model?.pointsPerStandardDeviation !== 'number') throw new Error('Invalid public snapshot model');
  if (!Number.isInteger(candidate.model?.simulationRunCount) || (candidate.model!.simulationRunCount as number) < 1) throw new Error('Invalid public snapshot run count');
  if (!candidate.ratings.teamSeasons.every((season) => season.crossEra && Number.isFinite(season.crossEra.overall) && Number.isFinite(season.crossEra.offense) && Number.isFinite(season.crossEra.defense))) throw new Error('Invalid public snapshot cross-era ratings');
  if (!candidate.simulationInputs || typeof candidate.simulationInputs !== 'object') throw new Error('Invalid public snapshot: missing simulation inputs');
  const inputs = Object.values(candidate.simulationInputs);
  if (!inputs.every((entry) => Number.isFinite(entry.possessionsPerGame) && Number.isFinite(entry.turnoverRatePerDrive) && Number.isFinite(entry.scoringRateMultiplier) && Number.isFinite(entry.touchdownShare))) throw new Error('Invalid public snapshot simulation inputs');
  if (!Array.isArray((candidate as { coverage?: unknown }).coverage)) throw new Error('Invalid public snapshot: missing coverage');
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
  const ohioStateInputs = rivalrySnapshot.simulationInputs[`${ohioStateTeamId}:${ohioStateSeason}`] ?? null;
  const michiganInputs = rivalrySnapshot.simulationInputs[`${michiganTeamId}:${michiganSeason}`] ?? null;
  const simulationCoverage = ohioStateInputs && michiganInputs ? 'rich-game-data' : 'score-and-schedule';
  return {
    simulationCoverage,
    usedInputs: simulationCoverage === 'rich-game-data' ? { ohioState: ohioStateInputs!, michigan: michiganInputs! } : {},
    ohioState: { scheduleStrength: ohioState.scheduleStrength, inputs: ohioStateInputs },
    michigan: { scheduleStrength: michigan.scheduleStrength, inputs: michiganInputs },
  };
}

export function coverageForSeason(teamId: TeamId, season: number): { coverage: 'rich-game-data' | 'score-and-schedule'; missingFields: string[] } | null {
  return rivalrySnapshot.coverage.find((entry) => entry.teamId === teamId && entry.season === season) ?? null;
}

export function profileForSeason(teamId: TeamId, season: number, teamSeasons: readonly Pick<TeamSeasonSnapshot, 'teamId' | 'season' | 'profile'>[] = rivalrySnapshot.ratings.teamSeasons): SeasonProfile | null {
  return teamSeasons.find((entry) => entry.teamId === teamId && entry.season === season)?.profile ?? null;
}

export function formatSeasonRank(rank: number | null, ratedTeams: number | null): string {
  return rank === null ? 'UNRANKED' : `NO. ${rank}${ratedTeams === null ? '' : ` OF ${ratedTeams}`}`;
}
