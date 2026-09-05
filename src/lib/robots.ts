/**
 * robots.txt, decided per request.
 *
 * The file used to be written at build time by `astro-robots-txt`. A static
 * file is served before the middleware runs and cannot vary by host, so the
 * same rules now come from an endpoint. On the long domain with the default
 * settings the body is byte-for-byte what the integration wrote.
 *
 * While canonicals point at the long domain, the new host is a staging copy
 * and asks crawlers to stay out, so it advertises nothing. The long domain is
 * never blocked, even after the flip: a crawler has to fetch the old URLs to
 * see their redirects.
 */
import { NEW_HOST, type SiteContext } from './hosts';

export function robotsTxt(site: Pick<SiteContext, 'host' | 'canonicalHost'>): string {
  const staged = site.host === NEW_HOST && site.canonicalHost !== NEW_HOST;
  if (staged) return 'User-agent: *\nDisallow: /\n';
  return `User-agent: *\nAllow: /\nSitemap: https://${site.canonicalHost}/sitemap-index.xml\n`;
}
