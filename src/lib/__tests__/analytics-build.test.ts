import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * The measurement tag went missing from all 25 `/record/` pages once the
 * hardcoded id moved to the environment. Those pages set `prerender = true`,
 * so `SiteShell.astro` reads the id while `npm run build` runs, and the build
 * stage of the container had no `GA_MEASUREMENT_ID`. The server-rendered pages
 * kept their tag, which is why the gap read as "analytics works" from the home
 * page alone.
 *
 * These guard the two halves of the contract: the shell reads the variable at
 * all, and the build stage is handed it.
 */
const read = (relative: string) => readFileSync(fileURLToPath(new URL(`../../../${relative}`, import.meta.url)), 'utf8');

describe('the measurement id reaches a prerendered page', () => {
  it('has SiteShell read the id from the process environment', () => {
    expect(read('src/components/SiteShell.astro')).toContain('process.env.GA_MEASUREMENT_ID');
  });

  it('declares the id as a build argument in the container build stage', () => {
    const dockerfile = read('Dockerfile');
    const buildStage = dockerfile.slice(0, dockerfile.lastIndexOf('FROM '));
    expect(buildStage).toMatch(/^ARG GA_MEASUREMENT_ID$/m);
    expect(buildStage).toMatch(/^ENV GA_MEASUREMENT_ID=\$GA_MEASUREMENT_ID$/m);
  });

  it('forwards the id before the build step that prerenders the pages', () => {
    const dockerfile = read('Dockerfile');
    expect(dockerfile.indexOf('ENV GA_MEASUREMENT_ID')).toBeLessThan(dockerfile.indexOf('RUN npm run build'));
  });
});

/**
 * Astro wraps a `define:vars` inline script in an IIFE, so `function gtag()`
 * stays private to that closure and `window.gtag` never exists. The GA library
 * reads `window.dataLayer` directly, so page_view still arrived and the gap
 * looked like working analytics. Every custom event went nowhere:
 * `trackEvent` and ShareGraphic both bail on `typeof window.gtag !== 'function'`.
 *
 * The Playwright suite cannot catch this. It stubs `window.gtag` itself, and
 * the test server renders no tag at all.
 */
describe('the bootstrap reaches the custom events', () => {
  for (const file of ['src/components/SiteShell.astro', 'src/pages/mo-carmen.astro']) {
    it(`assigns gtag onto window in ${file}`, () => {
      const source = read(file);
      const bootstrap = source.slice(source.indexOf('window.dataLayer')).replace(/\s+/g, '');
      expect(bootstrap).toContain('window.gtag=function(');
      // A bare `function gtag()` is the closure-scoped form the IIFE swallows.
      expect(bootstrap).not.toMatch(/(^|[^.])functiongtag\(/);
    });
  }

  it('has the call sites read gtag off window', () => {
    expect(read('src/lib/client/analytics.ts')).toContain('window as Window & { gtag?: Gtag }');
  });
});
