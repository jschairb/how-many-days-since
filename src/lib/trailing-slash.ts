/**
 * Which request paths get sent to their trailing-slash form.
 *
 * `canonicalUrl` already declares the slash form on every page, so the
 * slashless form answering 200 leaves two live URLs for one page and asks
 * Google to take the canonical's word for it. A 301 settles it at the door.
 *
 * Astro's `trailingSlash: 'always'` would do this, but it applies to every
 * route, and the 2026-09-06 attempt at it sent `/og/home.png` to
 * `/og/home.png/` and broke the card endpoint. The exclusions below are the
 * reason this lives in middleware instead.
 */

/** Routes that serve something other than a page, and take no slash. */
const PASSTHROUGH_PREFIXES = ['/api/', '/og/', '/_astro/', '/_image'];

/**
 * The path a request should be redirected to, or `null` to serve it as asked.
 */
export function redirectTargetFor(pathname: string): string | null {
  if (pathname === '/' || pathname.endsWith('/')) return null;
  if (PASSTHROUGH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;
  // A dot in the last segment means a file: `/favicon.svg`, `/og-logo.png`,
  // `/sitemap-index.xml`, and everything else `public/` serves directly.
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (lastSegment.includes('.')) return null;
  return `${pathname}/`;
}
