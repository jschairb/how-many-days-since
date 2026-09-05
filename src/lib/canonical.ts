/**
 * The one canonical URL for a page.
 *
 * Most pages here are server-rendered, so `Astro.url.pathname` carries whatever
 * form the visitor asked for. Both `/mo-carmen` and `/mo-carmen/` return 200, so
 * deriving the canonical straight from the request makes each variant declare
 * itself canonical and consolidates nothing.
 *
 * Astro builds directory-style URLs and the sitemap publishes the trailing-slash
 * form, so that is the form every page points at, whichever way it was reached.
 */
import { canonicalRoot, type SiteContext } from './hosts';

export const SITE_URL = 'https://howmanydayssincemichiganhasbeatenohiostate.com';

/** The trailing-slash path for a request path. The root stays `/`. */
export function canonicalPath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : `${trimmed}/`;
}

/** The absolute canonical URL, matching the sitemap entry for the same page. */
export function canonicalUrl(pathname: string): string {
  return new URL(canonicalPath(pathname), SITE_URL).toString();
}

/**
 * The canonical URL for a page on whichever host `CANONICAL_HOST` names.
 * `pathname` is the page's own path (`/record`), whichever host served it;
 * the prefix, if any, comes from the context. With the default settings this
 * is `canonicalUrl(pathname)`.
 */
export function canonicalUrlOn(site: Pick<SiteContext, 'canonicalOrigin' | 'canonicalBase'>, pathname: string): string {
  return `${canonicalRoot(site)}${canonicalPath(pathname)}`;
}
