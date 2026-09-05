import { describe, expect, it } from 'vitest';
import { SITE_URL, canonicalPath, canonicalUrl, canonicalUrlOn } from '../canonical';
import { LONG_HOST, NEW_HOST, readHostConfig, siteContextFor } from '../hosts';

describe('canonicalPath', () => {
  it('keeps the root as a bare slash', () => {
    expect(canonicalPath('/')).toBe('/');
    expect(canonicalPath('')).toBe('/');
  });

  it('adds the trailing slash the sitemap publishes', () => {
    expect(canonicalPath('/mo-carmen')).toBe('/mo-carmen/');
    expect(canonicalPath('/rivalry-lab/about')).toBe('/rivalry-lab/about/');
  });

  it('resolves both variants of a URL to the same canonical', () => {
    expect(canonicalPath('/mo-carmen/')).toBe(canonicalPath('/mo-carmen'));
    expect(canonicalPath('/record//')).toBe('/record/');
  });
});

describe('canonicalUrl', () => {
  it('matches the sitemap entry for the same page', () => {
    expect(canonicalUrl('/')).toBe(`${SITE_URL}/`);
    expect(canonicalUrl('/mo-carmen')).toBe(`${SITE_URL}/mo-carmen/`);
    expect(canonicalUrl('/record/2024/')).toBe(`${SITE_URL}/record/2024/`);
  });
});

describe('canonicalUrlOn', () => {
  const defaults = readHostConfig({});
  const flipped = readHostConfig({ CANONICAL_HOST: NEW_HOST });

  it('points at the long domain from either host by default', () => {
    expect(canonicalUrlOn(siteContextFor(LONG_HOST, defaults), '/record')).toBe(canonicalUrl('/record'));
    expect(canonicalUrlOn(siteContextFor(NEW_HOST, defaults), '/record')).toBe(canonicalUrl('/record'));
    expect(canonicalUrlOn(siteContextFor(NEW_HOST, defaults), '/')).toBe(`${SITE_URL}/`);
  });

  it('points under /thegame/ on the new domain once CANONICAL_HOST flips', () => {
    expect(canonicalUrlOn(siteContextFor(LONG_HOST, flipped), '/')).toBe(`https://${NEW_HOST}/thegame/`);
    expect(canonicalUrlOn(siteContextFor(NEW_HOST, flipped), '/record/2024')).toBe(`https://${NEW_HOST}/thegame/record/2024/`);
  });
});
