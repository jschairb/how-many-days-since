/**
 * Pure helpers behind the shareable "days since" graphic.
 *
 * Nothing here touches the DOM or a canvas context: text measurement is
 * injected so the layout math can be unit tested in Node.
 */

export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;

/** Same wording as the page's <h1>, so the card reads as the site. */
export const SHARE_HEADLINE = 'How many days since Michigan has beaten Ohio State?';

/** Adds thousands separators so 1000 reads as 1,000. */
export function formatCount(days: number): string {
  return days.toLocaleString('en-US');
}

/** "1 day" / "628 days" — the count with its unit. */
export function formatDayCount(days: number): string {
  return days === 1 ? '1 day' : `${formatCount(days)} days`;
}

/** The sentence posted alongside the image. No URL: callers add that. */
export function buildShareCaption(days: number): string {
  return `${formatDayCount(days)} since Michigan beat Ohio State. Go Bucks! 🅾️`;
}

/** Caption plus the site URL, for share sheets that take one text blob. */
export function buildShareText(days: number, siteUrl: string): string {
  return `${buildShareCaption(days)}\n${siteUrl}`;
}

/** X keeps text and URL separate so the link unfurls its own preview card. */
export function buildXIntentUrl(days: number, siteUrl: string): string {
  const params = new URLSearchParams({
    text: buildShareCaption(days),
    url: siteUrl,
  });
  return `https://x.com/intent/post?${params.toString()}`;
}

export function shareFileName(days: number): string {
  return `days-since-michigan-beat-ohio-state-${days}.png`;
}

/**
 * Greedy word wrap. `measure` reports the rendered width of a candidate line;
 * a single word wider than `maxWidth` gets its own line rather than looping.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  measure: (line: string) => number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = words[0];

  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (measure(candidate) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  lines.push(current);
  return lines;
}

/**
 * Largest font size (stepping down by `step`) whose rendered width fits
 * `maxWidth`, floored at `minSize` so the digits never vanish.
 */
export function fitFontSize(
  maxWidth: number,
  maxSize: number,
  minSize: number,
  measureAtSize: (size: number) => number,
  step = 4
): number {
  let size = maxSize;
  while (size > minSize && measureAtSize(size) > maxWidth) {
    size -= step;
  }
  return Math.max(size, minSize);
}
