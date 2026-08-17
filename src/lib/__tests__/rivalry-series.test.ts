import { describe, expect, it } from 'vitest';

import { createSeriesAggregator } from '../rivalry-series';
import { calculateMatchup, simulateGame, type Game, type Matchup } from '../rivalry-lab';
import { modelConfig, ratedSeason, simulationContext } from '../rivalry-snapshot';

const model = modelConfig();
const matchup = calculateMatchup(ratedSeason('ohio-state', 2014), ratedSeason('michigan', 2023), model);
const context = simulationContext('ohio-state', 2014, 'michigan', 2023);

function runSeries(seed: string, runCount: number) {
  const aggregator = createSeriesAggregator(matchup, seed, runCount);
  for (let index = 0; index < runCount; index += 1) aggregator.add(simulateGame(matchup, `${seed}:${index}`, model, context));
  return aggregator.summary();
}

function syntheticGame(osuPoints: number, michPoints: number, overtime = false): Game {
  const stats = (points: number, turnovers: number) => ({ possessions: 11, touchdowns: 0, fieldGoals: 0, turnovers, punts: 0, points });
  return {
    engineVersion: 'drive-v2', seed: 'x', ohioState: stats(osuPoints, 2), michigan: stats(michPoints, 1),
    drives: [], winner: osuPoints > michPoints ? 'ohio-state' : 'michigan', overtime, turningPoints: [],
  };
}

describe('createSeriesAggregator', () => {
  it('replays the same summary for the same matchup and seed', () => {
    expect(runSeries('replay', 200)).toEqual(runSeries('replay', 200));
  });

  it('sums margin buckets, wins, and rates to the run count', () => {
    const summary = runSeries('sums', 500);
    expect(summary.runCount).toBe(500);
    expect(summary.ohioState.wins + summary.michigan.wins).toBe(500);
    expect(summary.marginBuckets.reduce((sum, bucket) => sum + bucket.games, 0)).toBe(500);
    expect(summary.ohioState.winRate + summary.michigan.winRate).toBeCloseTo(1, 10);
    expect(summary.oneScore.rate).toBeCloseTo(summary.oneScore.games / 500, 10);
  });

  it('takes the lower median as the typical score for odd and even counts', () => {
    const odd = createSeriesAggregator(matchup, 'odd', 3);
    odd.add(syntheticGame(17, 20));
    odd.add(syntheticGame(21, 24));
    odd.add(syntheticGame(28, 3));
    expect(odd.summary().ohioState.typicalScore).toBe(21);
    expect(odd.summary().michigan.typicalScore).toBe(20);

    const even = createSeriesAggregator(matchup, 'even', 2);
    even.add(syntheticGame(14, 24));
    even.add(syntheticGame(24, 27));
    expect(even.summary().ohioState.typicalScore).toBe(14);
    expect(even.summary().michigan.typicalScore).toBe(24);
  });

  it('classifies margins at the one-score and blowout boundaries', () => {
    const aggregator = createSeriesAggregator(matchup, 'edges', 4);
    aggregator.add(syntheticGame(28, 20)); // +8: one-score
    aggregator.add(syntheticGame(29, 20)); // +9: neither
    aggregator.add(syntheticGame(36, 20)); // +16: neither
    aggregator.add(syntheticGame(3, 20)); // -17: blowout
    const summary = aggregator.summary();
    expect(summary.oneScore.games).toBe(1);
    expect(summary.blowout.games).toBe(1);
    expect(summary.marginBuckets.map((bucket) => bucket.games)).toEqual([1, 0, 0, 1, 2, 0]);
  });

  it('reports the pregame favorite and the underdog win rate as the upset rate', () => {
    const summary = runSeries('favorite', 300);
    const favorite = matchup.ohioState.winProbability > 0.5 ? 'ohio-state' : 'michigan';
    expect(summary.favorite).toBe(favorite);
    const underdogWins = favorite === 'ohio-state' ? summary.michigan.wins : summary.ohioState.wins;
    expect(summary.underdogWinRate).toBeCloseTo(underdogWins / 300, 10);
  });

  it('averages turnovers per team across the run', () => {
    const aggregator = createSeriesAggregator(matchup, 'turnovers', 2);
    aggregator.add(syntheticGame(21, 14));
    aggregator.add(syntheticGame(10, 24));
    const summary = aggregator.summary();
    expect(summary.ohioState.averageTurnovers).toBe(2);
    expect(summary.michigan.averageTurnovers).toBe(1);
  });

  it('refuses to summarize a partial run instead of reporting wrong totals', () => {
    const aggregator = createSeriesAggregator(matchup, 'partial', 10);
    aggregator.add(syntheticGame(21, 14));
    expect(() => aggregator.summary()).toThrow('run count');
  });

  it('tracks each team biggest win with its score', () => {
    const aggregator = createSeriesAggregator(matchup, 'extremes', 4);
    aggregator.add(syntheticGame(21, 14));
    aggregator.add(syntheticGame(10, 24));
    aggregator.add(syntheticGame(35, 3));
    aggregator.add(syntheticGame(20, 23));
    const summary = aggregator.summary();
    expect(summary.biggestWin.ohioState).toEqual({ margin: 32, ohioState: 35, michigan: 3 });
    expect(summary.biggestWin.michigan).toEqual({ margin: 14, ohioState: 10, michigan: 24 });
  });

  it('reports null for a team with no wins in the run', () => {
    const aggregator = createSeriesAggregator(matchup, 'shutout', 2);
    aggregator.add(syntheticGame(28, 10));
    aggregator.add(syntheticGame(31, 17));
    expect(aggregator.summary().biggestWin.michigan).toBeNull();
  });

  it('finds the first run game at the typical score as the representative game', () => {
    const aggregator = createSeriesAggregator(matchup, 'rep', 3);
    aggregator.add(syntheticGame(21, 14));
    aggregator.add(syntheticGame(24, 20));
    aggregator.add(syntheticGame(24, 20));
    const summary = aggregator.summary();
    expect([summary.ohioState.typicalScore, summary.michigan.typicalScore]).toEqual([24, 20]);
    expect(aggregator.representativeIndex()).toEqual({ index: 1, matchesTypicalScore: true });
  });

  it('falls back to the first closest game when no run game hits the typical score', () => {
    const aggregator = createSeriesAggregator(matchup, 'rep-close', 2);
    aggregator.add(syntheticGame(10, 20));
    aggregator.add(syntheticGame(20, 10));
    expect(aggregator.representativeIndex()).toEqual({ index: 0, matchesTypicalScore: false });
  });

  it('picks the same representative game on replay', () => {
    const first = createSeriesAggregator(matchup, 'rep-replay', 100);
    const second = createSeriesAggregator(matchup, 'rep-replay', 100);
    for (let index = 0; index < 100; index += 1) {
      const game = simulateGame(matchup, `rep-replay:${index}`, model, context);
      first.add(game);
      second.add(game);
    }
    expect(first.representativeIndex()).toEqual(second.representativeIndex());
  });

  it('carries the SIMULATED evidence label and engine version', () => {
    const summary = runSeries('label', 50);
    expect(summary.evidenceType).toBe('SIMULATED');
    expect(summary.engineVersion).toBe('drive-v2');
  });
});
