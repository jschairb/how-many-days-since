import { describe, expect, it } from 'vitest';
import { calcDaysSince, formatEasternTime } from '../days';

describe('calcDaysSince', () => {
  it('returns 0 on the exact reference date', () => {
    const ref = new Date('2024-11-30T05:00:00.000Z');
    expect(calcDaysSince(ref, ref)).toBe(0);
  });

  it('counts full days elapsed', () => {
    const ref = new Date('2024-11-30T05:00:00.000Z');
    const now = new Date('2024-12-03T05:00:00.000Z');
    expect(calcDaysSince(ref, now)).toBe(3);
  });

  it('floors partial days', () => {
    const ref = new Date('2024-11-30T05:00:00.000Z');
    const now = new Date('2024-11-30T05:00:00.000Z');
    // 23h 59m 59s later — still day 0
    const almostOneDay = new Date(ref.getTime() + (24 * 60 * 60 * 1000) - 1);
    expect(calcDaysSince(ref, almostOneDay)).toBe(0);
  });

  it('returns 0 when now is before the reference date', () => {
    const ref = new Date('2025-11-30T05:00:00.000Z');
    const now = new Date('2024-11-30T05:00:00.000Z');
    expect(calcDaysSince(ref, now)).toBe(0);
  });
});

describe('formatEasternTime', () => {
  it('formats a UTC time as Eastern time (EST, UTC-5)', () => {
    // 2025-01-01T18:00:00Z = 1:00 PM EST
    const date = new Date('2025-01-01T18:00:00.000Z');
    expect(formatEasternTime(date)).toBe('1:00 PM');
  });

  it('zero-pads minutes', () => {
    // 2025-01-01T17:05:00Z = 12:05 PM EST
    const date = new Date('2025-01-01T17:05:00.000Z');
    expect(formatEasternTime(date)).toBe('12:05 PM');
  });
});
