import { describe, expect, it } from 'vitest';
import games from '../../data/rivalry-games.json';
import { formatScoringMargin, meetingSides, sideClass, sideTone, type RivalrySide } from '../rivalry-archive';

const tiedGames = games.filter((game) => game.winner === 'Tie');

describe('sideTone', () => {
  it('gives each team its own tone', () => {
    expect(sideTone('Ohio State')).toBe('ohio-state');
    expect(sideTone('Michigan')).toBe('michigan');
  });

  it('gives a tie neutral ink rather than the Michigan default', () => {
    expect(sideTone('Tie')).toBe('ink');
  });

  it('keeps every tied meeting in the record off both palettes', () => {
    expect(tiedGames.map((game) => game.year)).toEqual([1992, 1973, 1949, 1941, 1910, 1900]);
    expect(tiedGames.flatMap((game) => [game.winner, game.loser].map((side) => sideClass(side as RivalrySide))))
      .toEqual(Array(12).fill('tie'));
  });
});

describe('sideClass', () => {
  it('maps each tone to its site.css color class', () => {
    expect(sideClass('Ohio State')).toBe('osu');
    expect(sideClass('Michigan')).toBe('mich');
    expect(sideClass('Tie')).toBe('tie');
  });
});

describe('meetingSides', () => {
  it('lists the winner first when a team won', () => {
    const [first, second] = meetingSides({ winner: 'Michigan', loser: 'Ohio State', wScore: 42, lScore: 27, wRank: 5, lRank: 2 });

    expect(first).toEqual({ team: 'Michigan', teamId: 'michigan', score: 42, rank: 5 });
    expect(second).toEqual({ team: 'Ohio State', teamId: 'ohio-state', score: 27, rank: 2 });
  });

  it('names both teams when the record carries Tie on both sides', () => {
    const [first, second] = meetingSides({ winner: 'Tie', loser: 'Tie', wScore: 13, lScore: 13, wRank: null, lRank: null });

    expect(first).toEqual({ team: 'Ohio State', teamId: 'ohio-state', score: 13, rank: null });
    expect(second).toEqual({ team: 'Michigan', teamId: 'michigan', score: 13, rank: null });
  });

  it('names Ohio State and Michigan once each on every meeting in the record', () => {
    for (const game of games) {
      const [first, second] = meetingSides(game);

      expect([first.team, second.team].sort()).toEqual(['Michigan', 'Ohio State']);
      expect([first.teamId, second.teamId].sort()).toEqual(['michigan', 'ohio-state']);
    }
  });

  it('gives all six tied meetings equal scores and no reported rank', () => {
    expect(tiedGames.map((game) => game.year)).toEqual([1992, 1973, 1949, 1941, 1910, 1900]);

    for (const game of tiedGames) {
      const [first, second] = meetingSides(game);

      expect(first.team).toBe('Ohio State');
      expect(second.team).toBe('Michigan');
      expect(first.score).toBe(second.score);
      expect([first.rank, second.rank]).toEqual([null, null]);
    }
  });
});

describe('formatScoringMargin', () => {
  it('rounds the per-game average to a tenth and signs it', () => {
    expect(formatScoringMargin(17.333333333333332)).toBe('+17.3');
    expect(formatScoringMargin(-8.666666666666666)).toBe('-8.7');
  });

  it('signs an even margin as a gain', () => {
    expect(formatScoringMargin(0)).toBe('+0.0');
  });
});
