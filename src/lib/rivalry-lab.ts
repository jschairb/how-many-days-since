export type Rating = { teamId: string; season: number; overall: number; offense: number; defense: number; scheduleStrength: number };
export type Matchup = { modelVersion: 'srs-era-neutral-v1'; neutralPointsPerTeam: number; expectedMargin: number; ohioState: Side; michigan: Side };
export type Side = { teamId: string; expectedScore: number; winProbability: number; scoreAdvantage: number };
export type Drive = { quarter: number; teamId: string; outcome: 'TD' | 'FG' | 'PUNT' | 'TURNOVER' | 'DOWNS'; points: number };
export type Game = { engineVersion: 'drive-v2'; seed: string; ohioState: Stats; michigan: Stats; drives: Drive[]; winner: 'ohio-state' | 'michigan'; overtime: boolean; turningPoints: Drive[] };
export type Stats = { possessions: number; touchdowns: number; fieldGoals: number; turnovers: number; punts: number; points: number };
export type ModelConfig = { neutralPointsPerTeam: number; simulationRunCount: number; matchupAdvantageDivisor: number; pointsPerStandardDeviation: number; winProbabilityMarginScale: number; scoreFloor: number; scoreCeiling: number; drivePossessions: number; touchdownShare: number; turnoverBaseRate: number; turnoverScoreAdjustment: number; turnoverFloor: number; turnoverOnDownsRate: number };
export type SimulationInputs = { possessionsPerGame: number; turnoverRatePerDrive: number; scoringRateMultiplier: number; touchdownShare: number };
export type SimulationSide = { scheduleStrength: number; inputs: SimulationInputs | null };
export type SimulationCoverage = 'rich-game-data' | 'score-and-schedule';
export type SimulationContext = { simulationCoverage: SimulationCoverage; usedInputs: { ohioState?: SimulationInputs; michigan?: SimulationInputs }; ohioState: SimulationSide; michigan: SimulationSide };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function generateSeed(): string {
  return String(Math.floor(10_000_000 + Math.random() * 90_000_000));
}

export function calculateMatchup(ohioState: Rating, michigan: Rating, config: ModelConfig): Matchup {
  const ohioStateAdvantage = (ohioState.offense - michigan.defense + ohioState.overall - michigan.overall) * config.pointsPerStandardDeviation / config.matchupAdvantageDivisor;
  const michiganAdvantage = (michigan.offense - ohioState.defense + michigan.overall - ohioState.overall) * config.pointsPerStandardDeviation / config.matchupAdvantageDivisor;
  const ohioStateScore = clamp(config.neutralPointsPerTeam + ohioStateAdvantage, config.scoreFloor, config.scoreCeiling);
  const michiganScore = clamp(config.neutralPointsPerTeam + michiganAdvantage, config.scoreFloor, config.scoreCeiling);
  const expectedMargin = ohioStateScore - michiganScore;
  const ohioStateProbability = 1 / (1 + Math.exp(-expectedMargin / config.winProbabilityMarginScale));
  return { modelVersion: 'srs-era-neutral-v1', neutralPointsPerTeam: config.neutralPointsPerTeam, expectedMargin, ohioState: { teamId: 'ohio-state', expectedScore: ohioStateScore, winProbability: ohioStateProbability, scoreAdvantage: ohioStateAdvantage }, michigan: { teamId: 'michigan', expectedScore: michiganScore, winProbability: 1 - ohioStateProbability, scoreAdvantage: michiganAdvantage } };
}

function random(seed: string) {
  let state = [...seed].reduce((value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619), 2166136261) >>> 0 || 1;
  return () => { state += 0x6d2b79f5; let value = state; value = Math.imul(value ^ (value >>> 15), value | 1); value ^= value + Math.imul(value ^ (value >>> 7), value | 61); return ((value ^ (value >>> 14)) >>> 0) / 4294967296; };
}

function emptyStats(): Stats { return { possessions: 0, touchdowns: 0, fieldGoals: 0, turnovers: 0, punts: 0, points: 0 }; }

export function simulateGame(matchup: Matchup, seed: string, config: ModelConfig, context?: SimulationContext): Game {
  // Mix the matchup into the stream: a bare seed hands the same roll sequence to the same
  // possession slots in every matchup, letting one lucky seed favor one team globally.
  const next = random(`${seed}|${matchup.ohioState.expectedScore}|${matchup.michigan.expectedScore}`); const ohioState = emptyStats(); const michigan = emptyStats(); const drives: Drive[] = [];
  const sides = context ? { 'ohio-state': context.ohioState, michigan: context.michigan } : null;
  const rich = context?.simulationCoverage === 'rich-game-data';
  const drivePossessions = rich
    ? Math.round(context!.ohioState.inputs!.possessionsPerGame + context!.michigan.inputs!.possessionsPerGame)
    : context ? Math.round(config.drivePossessions + ((context.ohioState.scheduleStrength + context.michigan.scheduleStrength) / 2 - 1) * 2) : config.drivePossessions;
  for (let possession = 0; possession < drivePossessions; possession += 1) {
    const side = possession % 2 === 0 ? matchup.ohioState : matchup.michigan;
    const stats = possession % 2 === 0 ? ohioState : michigan;
    const simulationSide = sides?.[side.teamId as 'ohio-state' | 'michigan'];
    const inputs = rich ? simulationSide?.inputs : null;
    const scoringRate = clamp((side.expectedScore / 12 / 7.8) * (inputs?.scoringRateMultiplier ?? 1), 0.2, 0.72);
    const turnoverRate = inputs
      ? inputs.turnoverRatePerDrive
      : Math.max(config.turnoverFloor, config.turnoverBaseRate - (side.expectedScore - 20) / config.turnoverScoreAdjustment + (simulationSide ? (simulationSide.scheduleStrength - 1) / 100 : 0));
    const touchdownShare = inputs?.touchdownShare ?? config.touchdownShare;
    const roll = next();
    const outcome = roll < scoringRate * touchdownShare ? 'TD' : roll < scoringRate ? 'FG' : roll < scoringRate + turnoverRate ? 'TURNOVER' : roll < scoringRate + turnoverRate + config.turnoverOnDownsRate ? 'DOWNS' : 'PUNT';
    const drive: Drive = { quarter: Math.min(4, Math.floor(possession / Math.ceil(drivePossessions / 4)) + 1), teamId: side.teamId, outcome, points: outcome === 'TD' ? 7 : outcome === 'FG' ? 3 : 0 }; drives.push(drive); stats.possessions += 1; stats.points += drive.points;
    if (outcome === 'TD') stats.touchdowns += 1; if (outcome === 'FG') stats.fieldGoals += 1; if (outcome === 'TURNOVER') stats.turnovers += 1; if (outcome === 'PUNT') stats.punts += 1;
  }
  let overtime = false;
  if (ohioState.points === michigan.points) { overtime = true; const winning = next() < matchup.ohioState.winProbability ? ohioState : michigan; winning.points += 3; winning.fieldGoals += 1; winning.possessions += 1; drives.push({ quarter: 5, teamId: winning === ohioState ? 'ohio-state' : 'michigan', outcome: 'FG', points: 3 }); }
  return { engineVersion: 'drive-v2', seed, ohioState, michigan, drives, winner: ohioState.points > michigan.points ? 'ohio-state' : 'michigan', overtime, turningPoints: drives.filter((drive) => drive.points > 0).slice(-3) };
}

export function validateMatchupInput(input: { osuYear: number; michYear: number }) {
  if (!Number.isInteger(input.osuYear) || input.osuYear < 1970 || input.osuYear > 2025) throw new Error('Ohio State season must be between 1970 and 2025');
  if (!Number.isInteger(input.michYear) || input.michYear < 1970 || input.michYear > 2025) throw new Error('Michigan season must be between 1970 and 2025');
}
