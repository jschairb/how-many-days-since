import { afterEach, describe, expect, it, vi } from 'vitest';
import { LONG_HOST, NEW_HOST } from '../lib/hosts';
import { onRequest } from '../middleware';

type Next = (payload?: string) => Promise<Response>;

/**
 * A request as the middleware sees it, with the pieces of the Astro context it
 * reads. `rewrite` does what Astro's does: re-renders the target path, which
 * runs the middleware again with the same `locals`.
 */
function run(host: string, path: string, init: RequestInit = {}, locals: Record<string, unknown> = {}) {
  const url = new URL(path, 'http://127.0.0.1:4321');
  const request = new Request(url, { ...init, headers: { host: '127.0.0.1:4321', 'x-forwarded-host': host, ...init.headers } });
  const next = vi.fn<Next>(async (payload) => new Response(`rendered ${payload ?? url.pathname}`));
  const rewrite = vi.fn(async (payload: string) => {
    const again = run(host, payload, init, locals);
    const response = await again.response;
    return new Response(`rewritten ${payload}: ${await response.text()}`, response);
  });
  const context = {
    request,
    url,
    locals,
    rewrite,
    redirect: (location: string, status = 302) => new Response(null, { status, headers: { Location: location } }),
  };
  return { response: Promise.resolve(onRequest(context as never, next as never) as Promise<Response>), next, rewrite, locals };
}

afterEach(() => vi.unstubAllEnvs());

describe('long domain with the default settings', () => {
  it.each(['/', '/record', '/record/2024/', '/rivalry-lab/about', '/api/matchup?osuYear=1995&michYear=2023', '/og/home.png'])(
    'passes %s straight through, unrewritten and unredirected',
    async (path) => {
      const { response, next, locals } = run(LONG_HOST, path);
      const result = await response;
      expect(result.status).toBe(200);
      expect(next).toHaveBeenCalledWith();
      expect(locals.site).toMatchObject({ host: LONG_HOST, basePath: '', canonicalHost: LONG_HOST });
    }
  );

  it('treats an unknown host the same as the long domain', async () => {
    const { next, locals } = run('localhost', '/record');
    expect(next).toHaveBeenCalledWith();
    expect(locals.site).toMatchObject({ host: LONG_HOST, basePath: '' });
  });

  it('serves nothing under /thegame on the long domain', async () => {
    const { response, next } = run(LONG_HOST, '/thegame/record');
    // The path is handed on as-is; no page lives there, so Astro answers 404.
    await response;
    expect(next).toHaveBeenCalledWith();
  });
});

describe('new domain', () => {
  it('serves the placeholder at the root', async () => {
    const { response, next } = run(NEW_HOST, '/');
    const result = await response;
    expect(result.status).toBe(200);
    expect(await result.text()).toContain('<h1>Rivalry Lab</h1>');
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    ['/thegame', '/'],
    ['/thegame/', '/'],
    ['/thegame/record', '/record'],
    ['/thegame/record/2024/', '/record/2024/'],
    ['/thegame/api/matchup?osuYear=1995&michYear=2023', '/api/matchup?osuYear=1995&michYear=2023'],
    ['/thegame/og/home.png', '/og/home.png'],
  ])('rewrites %s to the page at %s', async (path, target) => {
    const { response, next, rewrite, locals } = run(NEW_HOST, path);
    const result = await response;
    expect(rewrite).toHaveBeenCalledWith(target);
    // The first pass never renders in place; the second pass, for the inner
    // path, hands straight on instead of answering 404 for it.
    expect(next).not.toHaveBeenCalled();
    expect(await result.text()).toBe(`rewritten ${target}: rendered ${new URL(target, 'http://x').pathname}`);
    expect(locals.site).toMatchObject({ host: NEW_HOST, basePath: '/thegame', canonicalHost: LONG_HOST });
    expect(locals.hostRewrite).toEqual({ from: new URL(path, 'http://x').pathname, to: new URL(target, 'http://x').pathname });
  });

  it.each(['/record', '/rivalry-lab', '/api/health', '/thegamer'])('answers 404 for %s outside the prefix', async (path) => {
    const { response, next } = run(NEW_HOST, path);
    expect((await response).status).toBe(404);
    expect(next).not.toHaveBeenCalled();
  });

  it('lets robots.txt through at the root', async () => {
    const { next } = run(NEW_HOST, '/robots.txt');
    expect(next).toHaveBeenCalledWith();
  });

  it('honours a www prefix on the new host', async () => {
    const { response, rewrite } = run(`www.${NEW_HOST}`, '/thegame/countdown');
    await response;
    expect(rewrite).toHaveBeenCalledWith('/countdown');
  });

  it('hands the inner path on when it runs again after its own rewrite', async () => {
    const { next, rewrite } = run(NEW_HOST, '/og/home.png', {}, { hostRewrite: { from: '/thegame/og/home.png', to: '/og/home.png' } });
    expect(next).toHaveBeenCalledWith();
    expect(rewrite).not.toHaveBeenCalled();
  });
});

describe('REDIRECT_TO_NEW_HOST', () => {
  it('is inert when unset or false', async () => {
    for (const value of [undefined, '', 'false', '0']) {
      if (value === undefined) vi.unstubAllEnvs();
      else vi.stubEnv('REDIRECT_TO_NEW_HOST', value);
      const { response, next } = run(LONG_HOST, '/record');
      expect((await response).status, String(value)).toBe(200);
      expect(next).toHaveBeenCalledWith();
    }
  });

  it.each([
    ['/', '/thegame/'],
    ['/record', '/thegame/record'],
    ['/record/', '/thegame/record/'],
    ['/record/2024', '/thegame/record/2024'],
    ['/countdown', '/thegame/countdown'],
    ['/teams/michigan/2023', '/thegame/teams/michigan/2023'],
    ['/og/record/2024.png', '/thegame/og/record/2024.png'],
    ['/robots.txt', '/robots.txt'],
  ])('permanently redirects %s to %s on the new domain when set', async (path, target) => {
    vi.stubEnv('REDIRECT_TO_NEW_HOST', 'true');
    const { response, next } = run(LONG_HOST, path);
    const result = await response;
    expect(result.status).toBe(301);
    expect(result.headers.get('location')).toBe(`https://${NEW_HOST}${target}`);
    expect(next).not.toHaveBeenCalled();
  });

  it('keeps the query string', async () => {
    vi.stubEnv('REDIRECT_TO_NEW_HOST', 'true');
    const result = await run(LONG_HOST, '/api/matchup?osuYear=1995&michYear=2023').response;
    expect(result.headers.get('location')).toBe(`https://${NEW_HOST}/thegame/api/matchup?osuYear=1995&michYear=2023`);
  });

  it('uses 308 so a POST keeps its method and body', async () => {
    vi.stubEnv('REDIRECT_TO_NEW_HOST', 'true');
    const result = await run(LONG_HOST, '/api/simulate', { method: 'POST', body: '{}' }).response;
    expect(result.status).toBe(308);
    expect(result.headers.get('location')).toBe(`https://${NEW_HOST}/thegame/api/simulate`);
  });

  it('leaves paths with no row in the table to the normal 404', async () => {
    vi.stubEnv('REDIRECT_TO_NEW_HOST', 'true');
    const { response, next } = run(LONG_HOST, '/not-a-page');
    expect((await response).status).toBe(200);
    expect(next).toHaveBeenCalledWith();
  });

  it('never redirects the new domain', async () => {
    vi.stubEnv('REDIRECT_TO_NEW_HOST', 'true');
    const { response, rewrite } = run(NEW_HOST, '/thegame/record');
    expect((await response).status).toBe(200);
    expect(rewrite).toHaveBeenCalledWith('/record');
  });
});

describe('CANONICAL_HOST', () => {
  it('moves the canonical under the prefix on the new domain for both hosts', async () => {
    vi.stubEnv('CANONICAL_HOST', NEW_HOST);
    const long = run(LONG_HOST, '/record');
    await long.response;
    expect(long.locals.site).toMatchObject({ basePath: '', canonicalHost: NEW_HOST, canonicalBase: '/thegame' });

    const fresh = run(NEW_HOST, '/thegame/record');
    await fresh.response;
    expect(fresh.locals.site).toMatchObject({ basePath: '/thegame', canonicalHost: NEW_HOST, canonicalBase: '/thegame' });
  });
});
