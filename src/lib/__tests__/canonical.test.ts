import { describe, expect, it } from 'vitest';
import { SITE_URL, canonicalPath, canonicalUrl } from '../canonical';

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
