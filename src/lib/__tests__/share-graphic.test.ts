import { describe, expect, it } from 'vitest';
import {
  buildShareCaption,
  buildShareText,
  buildXIntentUrl,
  fitFontSize,
  formatCount,
  formatDayCount,
  shareFileName,
  wrapText,
} from '../share-graphic';

const SITE = 'https://howmanydayssincemichiganhasbeatenohiostate.com';

describe('formatCount', () => {
  it('leaves three-digit counts alone', () => {
    expect(formatCount(628)).toBe('628');
  });

  it('adds a thousands separator', () => {
    expect(formatCount(1000)).toBe('1,000');
  });
});

describe('formatDayCount', () => {
  it('uses the singular on day one', () => {
    expect(formatDayCount(1)).toBe('1 day');
  });

  it('uses the plural on day zero', () => {
    expect(formatDayCount(0)).toBe('0 days');
  });

  it('uses the plural beyond day one', () => {
    expect(formatDayCount(628)).toBe('628 days');
  });
});

describe('buildShareCaption', () => {
  it('leads with the count and names the rivalry', () => {
    expect(buildShareCaption(628)).toContain('628 days since Michigan beat Ohio State');
  });

  it('omits the URL so callers control placement', () => {
    expect(buildShareCaption(628)).not.toContain('http');
  });
});

describe('buildShareText', () => {
  it('appends the site URL on its own line', () => {
    expect(buildShareText(628, SITE)).toBe(`${buildShareCaption(628)}\n${SITE}`);
  });
});

describe('buildXIntentUrl', () => {
  it('points at the X post intent', () => {
    expect(buildXIntentUrl(628, SITE)).toMatch(/^https:\/\/x\.com\/intent\/post\?/);
  });

  it('sends text and url as separate encoded params', () => {
    const params = new URL(buildXIntentUrl(628, SITE)).searchParams;
    expect(params.get('text')).toBe(buildShareCaption(628));
    expect(params.get('url')).toBe(SITE);
  });
});

describe('shareFileName', () => {
  it('embeds the count so repeat downloads do not collide', () => {
    expect(shareFileName(628)).toBe('days-since-michigan-beat-ohio-state-628.png');
  });
});

describe('wrapText', () => {
  // Stand-in for canvas metrics: every character is 10 units wide.
  const measure = (line: string) => line.length * 10;

  it('returns an empty list for empty input', () => {
    expect(wrapText('   ', 100, measure)).toEqual([]);
  });

  it('keeps text on one line when it fits', () => {
    expect(wrapText('GO BUCKS', 100, measure)).toEqual(['GO BUCKS']);
  });

  it('breaks at the last word that fits', () => {
    expect(wrapText('DAYS SINCE MICHIGAN BEAT OHIO STATE', 200, measure)).toEqual([
      'DAYS SINCE MICHIGAN',
      'BEAT OHIO STATE',
    ]);
  });

  it('gives an over-long word its own line instead of looping', () => {
    expect(wrapText('A SUPERCALIFRAGILISTIC B', 50, measure)).toEqual([
      'A',
      'SUPERCALIFRAGILISTIC',
      'B',
    ]);
  });

  it('collapses runs of whitespace', () => {
    expect(wrapText('GO   BUCKS', 100, measure)).toEqual(['GO BUCKS']);
  });
});

describe('fitFontSize', () => {
  it('keeps the maximum size when the text already fits', () => {
    expect(fitFontSize(1000, 290, 120, (size) => size * 2)).toBe(290);
  });

  it('steps down until the text fits', () => {
    // width = size * 3, so the first size fitting 600 is 200.
    expect(fitFontSize(600, 290, 120, (size) => size * 3, 10)).toBe(200);
  });

  it('never drops below the floor', () => {
    expect(fitFontSize(10, 290, 120, (size) => size * 100)).toBe(120);
  });
});
