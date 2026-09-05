import { describe, expect, it } from 'vitest';
import {
  LONG_HOST,
  NEW_HOST,
  THE_GAME_BASE,
  canonicalRoot,
  knownHost,
  normalizeHost,
  pathOn,
  readHostConfig,
  requestHost,
  siteContextFor,
  stripBase,
} from '../hosts';

describe('normalizeHost', () => {
  it('lower-cases and drops scheme, port, path, and www', () => {
    expect(normalizeHost('HTTPS://WWW.TheRivalryLab.com:443/thegame/')).toBe(NEW_HOST);
    expect(normalizeHost('  therivalrylab.com  ')).toBe(NEW_HOST);
  });

  it('treats blanks as unset', () => {
    expect(normalizeHost('')).toBeUndefined();
    expect(normalizeHost('   ')).toBeUndefined();
    expect(normalizeHost(undefined)).toBeUndefined();
    expect(normalizeHost(null)).toBeUndefined();
  });
});

describe('readHostConfig', () => {
  it('defaults to the long domain with redirects off', () => {
    expect(readHostConfig({})).toEqual({ canonicalHost: LONG_HOST, redirectToNewHost: false });
    expect(readHostConfig({ CANONICAL_HOST: '', REDIRECT_TO_NEW_HOST: '' })).toEqual({
      canonicalHost: LONG_HOST,
      redirectToNewHost: false,
    });
  });

  it('reads the flip settings', () => {
    expect(readHostConfig({ CANONICAL_HOST: 'https://therivalrylab.com', REDIRECT_TO_NEW_HOST: 'true' })).toEqual({
      canonicalHost: NEW_HOST,
      redirectToNewHost: true,
    });
  });

  it('accepts the usual spellings of true and nothing else', () => {
    for (const value of ['1', 'true', 'TRUE', 'yes', 'on']) {
      expect(readHostConfig({ REDIRECT_TO_NEW_HOST: value }).redirectToNewHost, value).toBe(true);
    }
    for (const value of ['0', 'false', 'no', 'off', 'maybe']) {
      expect(readHostConfig({ REDIRECT_TO_NEW_HOST: value }).redirectToNewHost, value).toBe(false);
    }
  });
});

describe('requestHost', () => {
  it('prefers the proxy forwarded host over Host', () => {
    const request = new Request('http://127.0.0.1:4321/', {
      headers: { host: '127.0.0.1:4321', 'x-forwarded-host': 'therivalrylab.com, 10.0.0.1' },
    });
    expect(requestHost(request)).toBe(NEW_HOST);
  });

  it('falls back to Host', () => {
    const request = new Request('http://example/', { headers: { host: `${LONG_HOST}:443` } });
    expect(requestHost(request)).toBe(LONG_HOST);
  });
});

describe('knownHost', () => {
  it('resolves only the new domain to the new host', () => {
    expect(knownHost(NEW_HOST)).toBe(NEW_HOST);
    expect(knownHost(LONG_HOST)).toBe(LONG_HOST);
    expect(knownHost('localhost')).toBe(LONG_HOST);
    expect(knownHost('10.0.0.5')).toBe(LONG_HOST);
    expect(knownHost(undefined)).toBe(LONG_HOST);
  });
});

describe('siteContextFor', () => {
  const defaults = readHostConfig({});

  it('serves the long domain at the root with canonicals to itself by default', () => {
    expect(siteContextFor(LONG_HOST, defaults)).toEqual({
      host: LONG_HOST,
      basePath: '',
      canonicalHost: LONG_HOST,
      canonicalOrigin: `https://${LONG_HOST}`,
      canonicalBase: '',
    });
  });

  it('serves the new domain under the prefix, still canonical to the long domain by default', () => {
    expect(siteContextFor(NEW_HOST, defaults)).toEqual({
      host: NEW_HOST,
      basePath: THE_GAME_BASE,
      canonicalHost: LONG_HOST,
      canonicalOrigin: `https://${LONG_HOST}`,
      canonicalBase: '',
    });
  });

  it('moves the canonical under the prefix once CANONICAL_HOST is the new domain', () => {
    const flipped = readHostConfig({ CANONICAL_HOST: NEW_HOST });
    expect(siteContextFor(LONG_HOST, flipped)).toMatchObject({
      basePath: '',
      canonicalOrigin: `https://${NEW_HOST}`,
      canonicalBase: THE_GAME_BASE,
    });
  });
});

describe('path helpers', () => {
  it('prefixes page paths on the new host only', () => {
    expect(pathOn({ basePath: '' }, '/')).toBe('/');
    expect(pathOn({ basePath: '' }, '/record/2024')).toBe('/record/2024');
    expect(pathOn({ basePath: THE_GAME_BASE }, '/')).toBe('/thegame/');
    expect(pathOn({ basePath: THE_GAME_BASE }, '/record/2024')).toBe('/thegame/record/2024');
  });

  it('builds the canonical root with no trailing slash', () => {
    expect(canonicalRoot(siteContextFor(NEW_HOST, readHostConfig({})))).toBe(`https://${LONG_HOST}`);
    expect(canonicalRoot(siteContextFor(NEW_HOST, readHostConfig({ CANONICAL_HOST: NEW_HOST })))).toBe(
      `https://${NEW_HOST}/thegame`
    );
  });

  it('strips the base and rejects paths outside it', () => {
    expect(stripBase('/thegame', THE_GAME_BASE)).toBe('/');
    expect(stripBase('/thegame/', THE_GAME_BASE)).toBe('/');
    expect(stripBase('/thegame/record/2024', THE_GAME_BASE)).toBe('/record/2024');
    expect(stripBase('/thegamer', THE_GAME_BASE)).toBeNull();
    expect(stripBase('/record', THE_GAME_BASE)).toBeNull();
    expect(stripBase('/record', '')).toBe('/record');
  });
});
