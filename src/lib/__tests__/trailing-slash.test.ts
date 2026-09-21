import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { redirectTargetFor } from '../trailing-slash';

describe('redirectTargetFor', () => {
  it('sends a page to the form the canonical and the sitemap name', () => {
    expect(redirectTargetFor('/record/1926')).toBe('/record/1926/');
    expect(redirectTargetFor('/teams/ohio-state/2024')).toBe('/teams/ohio-state/2024/');
    expect(redirectTargetFor('/rivalry-lab/about')).toBe('/rivalry-lab/about/');
  });

  it('serves the canonical form itself', () => {
    expect(redirectTargetFor('/')).toBeNull();
    expect(redirectTargetFor('/record/1926/')).toBeNull();
  });

  it('leaves the card endpoint alone', () => {
    // `trailingSlash: 'always'` sent these to `/og/home.png/` in the
    // 2026-09-06 attempt and broke every unfurled link.
    expect(redirectTargetFor('/og/home.png')).toBeNull();
    expect(redirectTargetFor('/og/record/2024.png')).toBeNull();
    expect(redirectTargetFor('/og/teams/ohio-state/2024.png')).toBeNull();
  });

  it('leaves the API routes alone', () => {
    expect(redirectTargetFor('/api/health')).toBeNull();
    expect(redirectTargetFor('/api/matchup')).toBeNull();
    expect(redirectTargetFor('/api/simulate')).toBeNull();
    expect(redirectTargetFor('/api/chalk-talk')).toBeNull();
  });

  it('leaves files alone', () => {
    expect(redirectTargetFor('/favicon.svg')).toBeNull();
    expect(redirectTargetFor('/og-logo.png')).toBeNull();
    expect(redirectTargetFor('/sitemap-index.xml')).toBeNull();
    expect(redirectTargetFor('/robots.txt')).toBeNull();
    expect(redirectTargetFor('/mo-carmen.png')).toBeNull();
    expect(redirectTargetFor('/_astro/site.abc123.css')).toBeNull();
  });
});

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));

/** Every `.astro` file under `src/`. */
function astroFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = `${directory}/${entry}`;
    if (statSync(path).isDirectory()) return astroFiles(path);
    return entry.endsWith('.astro') ? [path] : [];
  });
}

describe('internal links', () => {
  it('are written in the canonical slash form', () => {
    // A slashless href costs a redirect hop on every navigation, which is the
    // whole reason the redirect above is a fallback and not the fix.
    const offenders = astroFiles(sourceRoot).flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      return [...source.matchAll(/href=(?:"(\/[^"#]*)"|\{`(\/[^`]*)`\})/g)]
        .map((match) => match[1] ?? match[2])
        .filter((href) => href !== '/' && !href.endsWith('/'))
        .filter((href) => !href.slice(href.lastIndexOf('/') + 1).includes('.'))
        .map((href) => `${path.slice(sourceRoot.length)}: ${href}`);
    });
    expect(offenders).toEqual([]);
  });
});
