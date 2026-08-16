import type { APIRoute } from 'astro';
import { calculateMatchup, generateSeed, simulateGame, validateMatchupInput } from '../../lib/rivalry-lab';
import { createSeriesAggregator } from '../../lib/rivalry-series';
import { simulationRunCount } from '../../lib/simulation-config';
import { modelConfig, ratedSeason, rivalrySnapshot, simulationContext } from '../../lib/rivalry-snapshot';

// One request runs the displayed game plus the configured repeated set. The browser gets
// the displayed game (series index 0, with its drives) and the aggregate summary only;
// the repeated-game collection and its drive logs never leave the server. Any client-sent
// run count is ignored: the harness-selected count in the snapshot is the configuration.
export const POST: APIRoute = async ({ request }) => {
  try {
    const { osuYear, michYear, seed = generateSeed() } = await request.json();
    validateMatchupInput({ osuYear, michYear });
    const config = modelConfig();
    const matchup = calculateMatchup(ratedSeason('ohio-state', osuYear), ratedSeason('michigan', michYear), config);
    const context = simulationContext('ohio-state', osuYear, 'michigan', michYear);
    const runCount = simulationRunCount();
    const aggregator = createSeriesAggregator(matchup, String(seed), runCount);
    let displayedGame = null;
    for (let index = 0; index < runCount; index += 1) {
      const game = simulateGame(matchup, `${seed}:${index}`, config, context);
      if (index === 0) displayedGame = game;
      aggregator.add(game);
    }
    const series = aggregator.summary();
    return Response.json({
      matchup,
      result: displayedGame,
      series,
      simulationCoverage: context.simulationCoverage,
      usedInputs: context.usedInputs,
      evidence: [
        { type: 'DERIVED', value: matchup },
        { type: 'SIMULATED', value: displayedGame },
        { type: 'SIMULATED', value: series },
      ],
      versions: {
        ratingModelVersion: rivalrySnapshot.ratingModelVersion,
        eraModelVersion: rivalrySnapshot.eraModelVersion,
        simulationEngineVersion: rivalrySnapshot.simulationEngineVersion,
        adjustmentModelVersion: rivalrySnapshot.adjustmentModelVersion,
        dataSnapshotVersion: rivalrySnapshot.dataSnapshotVersion,
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Simulation failed' }, { status: 400 });
  }
};
