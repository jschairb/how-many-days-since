import { describe, expect, it } from 'vitest';
import games from '../../data/rivalry-games.json';
import { formatScoringMargin, sideClass, sideTone, type RivalrySide } from '../rivalry-archive';

describe('sideTone', () => {
  it('gives each team its own tone', () => {
    expect(sideTone('Ohio State')).toBe('ohio-state');
    expect(sideTone('Michigan')).toBe('michigan');
  });

  it('gives a tie neutral ink rather than the Michigan default', () => {
    expect(sideTone('Tie')).toBe('ink');
  });

  it('keeps every tied meeting in the record off both palettes', () => {
    const tied = games.filter((game) => game.winner === 'Tie');

    expect(tied.map((game) => game.year)).toEqual([1992, 1973, 1949, 1941, 1910, 1900]);
    expect(tied.flatMap((game) => [game.winner, game.loser].map((side) => sideClass(side as RivalrySide))))
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

describe('formatScoringMargin', () => {
  it('rounds the per-game average to a tenth and signs it', () => {
    expect(formatScoringMargin(17.333333333333332)).toBe('+17.3');
    expect(formatScoringMargin(-8.666666666666666)).toBe('-8.7');
  });

  it('signs an even margin as a gain', () => {
    expect(formatScoringMargin(0)).toBe('+0.0');
  });
});
