/**
 * The two hostnames this server answers on, and what each one serves.
 *
 * The long domain is where the site has always lived: The Game at the root.
 * The new domain is the Rivalry Lab platform, where The Game is one folder
 * (`/thegame/`) and other rivalries will be its siblings. One server serves
 * both; the middleware reads the request's host and picks the layout.
 *
 * Two settings steer the migration, both read from the environment:
 *
 * - `CANONICAL_HOST`: the host every page names in its canonical URL. Defaults
 *   to the long domain. Set it to the new domain on flip day, for the build
 *   (the sitemap is written then) and for the running server.
 * - `REDIRECT_TO_NEW_HOST`: when `true`, a request to the long domain gets a
 *   permanent redirect to its new-domain path (see `redirect-map.ts`).
 *   Defaults to off, so the long domain keeps serving pages.
 */
export const LONG_HOST = 'howmanydayssincemichiganhasbeatenohiostate.com';
export const NEW_HOST = 'therivalrylab.com';
/** Where The Game lives on the new host. No trailing slash. */
export const THE_GAME_BASE = '/thegame';

export type KnownHost = typeof LONG_HOST | typeof NEW_HOST;
export type BasePath = '' | typeof THE_GAME_BASE;

export interface HostConfig {
  /** Host named in canonical URLs, the sitemap, and robots.txt. */
  canonicalHost: string;
  /** Whether the long domain answers with permanent redirects to the new one. */
  redirectToNewHost: boolean;
}

/** What one request sees: the host it arrived on and where its canonical lives. */
export interface SiteContext {
  /** Which known host the request resolved to. */
  host: KnownHost;
  /** Prefix pages live under on this host: '' on the long domain, '/thegame' on the new one. */
  basePath: BasePath;
  /** Host named in canonical URLs, from CANONICAL_HOST. */
  canonicalHost: string;
  /** `https://` and the canonical host, no path. */
  canonicalOrigin: string;
  /** Prefix pages live under on the canonical host. */
  canonicalBase: BasePath;
}

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

/** Lower-cases a host and drops scheme, port, path, and a leading `www.`. */
export function normalizeHost(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const host = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0]
    .replace(/^www\./, '');
  return host || undefined;
}

/** Reads the migration settings. Missing or empty values fall back to the defaults. */
export function readHostConfig(env: Record<string, string | undefined> = process.env): HostConfig {
  return {
    canonicalHost: normalizeHost(env.CANONICAL_HOST) ?? LONG_HOST,
    redirectToNewHost: TRUE_VALUES.has((env.REDIRECT_TO_NEW_HOST ?? '').trim().toLowerCase()),
  };
}

/**
 * The host a request was addressed to. A proxy in front of the container
 * names the public host in `X-Forwarded-Host`; a direct request names it in
 * `Host`.
 */
export function requestHost(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-host')?.split(',')[0];
  return normalizeHost(forwarded) ?? normalizeHost(request.headers.get('host'));
}

/**
 * The new host when the request names it. Anything else (the long domain,
 * localhost, a container address, a health checker) is the long domain, so an
 * unexpected host can only produce the layout the site has always served.
 */
export function knownHost(host: string | undefined): KnownHost {
  return host === NEW_HOST ? NEW_HOST : LONG_HOST;
}

/** The prefix pages live under on a host. */
export function basePathFor(host: string): BasePath {
  return host === NEW_HOST ? THE_GAME_BASE : '';
}

export function siteContextFor(host: string | undefined, config: HostConfig = readHostConfig()): SiteContext {
  const known = knownHost(host);
  return {
    host: known,
    basePath: basePathFor(known),
    canonicalHost: config.canonicalHost,
    canonicalOrigin: `https://${config.canonicalHost}`,
    canonicalBase: basePathFor(config.canonicalHost),
  };
}

/** The context for the current render, from the middleware or, failing that, the request. */
export function siteFrom(context: { locals: { site?: SiteContext }; request: Request }): SiteContext {
  return context.locals.site ?? siteContextFor(requestHost(context.request));
}

/** A root-relative page path as it appears on this host: `/record` is `/thegame/record` on the new one. */
export function pathOn(site: Pick<SiteContext, 'basePath'>, path: string): string {
  return path === '/' ? `${site.basePath}/` : `${site.basePath}${path}`;
}

/**
 * The absolute root of the site on the canonical host, with no trailing slash.
 * Absolute self-references (og:image, the share link) hang off it.
 */
export function canonicalRoot(site: Pick<SiteContext, 'canonicalOrigin' | 'canonicalBase'>): string {
  return `${site.canonicalOrigin}${site.canonicalBase}`;
}

/** Strips the base from a path on the new host. `null` when the path is outside it. */
export function stripBase(pathname: string, basePath: string): string | null {
  if (!basePath) return pathname;
  if (pathname === basePath) return '/';
  if (pathname.startsWith(`${basePath}/`)) return pathname.slice(basePath.length);
  return null;
}
