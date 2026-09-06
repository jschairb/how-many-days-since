import { describe, expect, it } from 'vitest';
import { trailingSlashRedirect } from '../trailing-slash';

describe('trailingSlashRedirect', () => {
  it('sends the slashless form of a page to the slash form', () => {
    expect(trailingSlashRedirect('/record')).toBe('/record/');
    expect(trailingSlashRedirect('/record/1897')).toBe('/record/1897/');
    expect(trailingSlashRedirect('/mo-carmen')).toBe('/mo-carmen/');
    expect(trailingSlashRedirect('/teams/ohio-state/2024')).toBe('/teams/ohio-state/2024/');
  });

  it('leaves the root and the slash form alone', () => {
    expect(trailingSlashRedirect('/')).toBeNull();
    expect(trailingSlashRedirect('/record/')).toBeNull();
    expect(trailingSlashRedirect('/record/1897/')).toBeNull();
  });

  it('leaves files and the API alone', () => {
    expect(trailingSlashRedirect('/og/home.png')).toBeNull();
    expect(trailingSlashRedirect('/og/record/2024.png')).toBeNull();
    expect(trailingSlashRedirect('/sitemap-index.xml')).toBeNull();
    expect(trailingSlashRedirect('/api/health')).toBeNull();
    expect(trailingSlashRedirect('/api/matchup')).toBeNull();
    expect(trailingSlashRedirect('/_astro/index.js')).toBeNull();
    expect(trailingSlashRedirect('/_server-islands/Card')).toBeNull();
  });
});
