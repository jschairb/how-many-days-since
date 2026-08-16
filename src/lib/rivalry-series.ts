import type { Game, Matchup } from './rivalry-lab';

export type MarginBucket = { label: string; min: number | null; max: number | null; games: number };

export type SeriesSummary = {
  evidenceType: 'SIMULATED';
  engineVersion: 'drive-v2';
  seed: string;
  runCount: number;
  favorite: 'ohio-state' | 'michigan';
  ohioState: { wins: number; winRate: number; typicalScore: number; averageTurnovers: number };
  michigan: { wins: number; winRate: number; typicalScore: number; averageTurnovers: number };
  underdogWinRate: number;
  overtime: { games: number; rate: number };
  oneScore: { games: number; rate: number };
  blowout: { games: number; rate: number };
  marginBuckets: MarginBucket[];
};

// Signed margin is Ohio State minus Michigan. Overtime resolves ties by three points, so a
// zero margin cannot occur and these six buckets partition every simulated game.
const BUCKETS: Array<{ label: string; min: number | null; max: number | null }> = [
  { label: 'MICHIGAN BY 17+', min: null, max: -17 },
  { label: 'MICHIGAN BY 9-16', min: -16, max: -9 },
  { label: 'MICHIGAN BY 1-8', min: -8, max: -1 },
  { label: 'OHIO STATE BY 1-8', min: 1, max: 8 },
  { label: 'OHIO STATE BY 9-16', min: 9, max: 16 },
  { label: 'OHIO STATE BY 17+', min: 17, max: null },
];

// Lower median: the smallest score reaching half the games. Deterministic, and always a
// score some simulated game produced.
function lowerMedian(histogram: Map<number, number>, games: number): number {
  const target = Math.ceil(games / 2);
  let cumulative = 0;
  for (const score of [...histogram.keys()].sort((left, right) => left - right)) {
    cumulative += histogram.get(score)!;
    if (cumulative >= target) return score;
  }
  return 0;
}

export function createSeriesAggregator(matchup: Matchup, seed: string, runCount: number) {
  let added = 0;
  let ohioStateWins = 0;
  let overtimeGames = 0;
  let oneScoreGames = 0;
  let blowoutGames = 0;
  let ohioStateTurnovers = 0;
  let michiganTurnovers = 0;
  const ohioStateScores = new Map<number, number>();
  const michiganScores = new Map<number, number>();
  const bucketCounts = BUCKETS.map(() => 0);

  return {
    add(game: Game): void {
      added += 1;
      if (game.winner === 'ohio-state') ohioStateWins += 1;
      if (game.overtime) overtimeGames += 1;
      const margin = game.ohioState.points - game.michigan.points;
      if (Math.abs(margin) <= 8) oneScoreGames += 1;
      if (Math.abs(margin) >= 17) blowoutGames += 1;
      ohioStateTurnovers += game.ohioState.turnovers;
      michiganTurnovers += game.michigan.turnovers;
      ohioStateScores.set(game.ohioState.points, (ohioStateScores.get(game.ohioState.points) ?? 0) + 1);
      michiganScores.set(game.michigan.points, (michiganScores.get(game.michigan.points) ?? 0) + 1);
      const bucketIndex = BUCKETS.findIndex((bucket) => (bucket.min === null || margin >= bucket.min) && (bucket.max === null || margin <= bucket.max));
      if (bucketIndex === -1) throw new Error(`Simulated game margin ${margin} fits no bucket`);
      bucketCounts[bucketIndex] += 1;
    },
    summary(): SeriesSummary {
      if (added !== runCount) throw new Error(`Aggregated ${added} games for a run count of ${runCount}`);
      const bucketTotal = bucketCounts.reduce((sum, count) => sum + count, 0);
      if (bucketTotal !== runCount) throw new Error(`Margin buckets sum to ${bucketTotal}, not ${runCount}`);
      const michiganWins = runCount - ohioStateWins;
      const favorite = matchup.ohioState.winProbability > 0.5 ? 'ohio-state' as const : 'michigan' as const;
      const underdogWins = favorite === 'ohio-state' ? michiganWins : ohioStateWins;
      return {
        evidenceType: 'SIMULATED',
        engineVersion: 'drive-v2',
        seed,
        runCount,
        favorite,
        ohioState: { wins: ohioStateWins, winRate: ohioStateWins / runCount, typicalScore: lowerMedian(ohioStateScores, runCount), averageTurnovers: ohioStateTurnovers / runCount },
        michigan: { wins: michiganWins, winRate: michiganWins / runCount, typicalScore: lowerMedian(michiganScores, runCount), averageTurnovers: michiganTurnovers / runCount },
        underdogWinRate: underdogWins / runCount,
        overtime: { games: overtimeGames, rate: overtimeGames / runCount },
        oneScore: { games: oneScoreGames, rate: oneScoreGames / runCount },
        blowout: { games: blowoutGames, rate: blowoutGames / runCount },
        marginBuckets: BUCKETS.map((bucket, index) => ({ ...bucket, games: bucketCounts[index] })),
      };
    },
  };
}
