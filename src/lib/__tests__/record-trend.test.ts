import { describe, expect, it } from 'vitest';
import { calculateTrend } from '../record-trend';

describe('calculateTrend', () => {
  it('identifies an Ohio State trend when the decade margin rises', () => {
    const trend = calculateTrend([
      { year: 1900, margin: -2 },
      { year: 1910, margin: 0 },
      { year: 1920, margin: 2 },
    ]);

    expect(trend.direction).toBe('Ohio State');
    expect(trend.slope).toBeCloseTo(0.2);
    expect(trend.start).toBeCloseTo(-2);
    expect(trend.end).toBeCloseTo(2);
  });

  it('identifies a Michigan trend when the decade margin falls', () => {
    const trend = calculateTrend([
      { year: 2000, margin: 4 },
      { year: 2010, margin: 0 },
      { year: 2020, margin: -4 },
    ]);

    expect(trend.direction).toBe('Michigan');
  });

  it('reports an even trend when the line is flat', () => {
    const trend = calculateTrend([
      { year: 2000, margin: 1 },
      { year: 2010, margin: 1 },
    ]);

    expect(trend.direction).toBe('Even');
    expect(trend.slope).toBe(0);
  });
});
