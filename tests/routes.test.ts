import { describe, it, expect } from 'vitest';
import { ROUTES, criterionPath, rel, routeFor } from '../src/site/routes';
import { EXPECTED } from '../src/criteria/manifest';

/**
 * The route list is what the prerender step writes and what the axe scan visits, so it is
 * the one place a page is added. Links between pages are relative (GitHub Pages serves the
 * site under a repository prefix and has no rewrites), so `rel` must be right in every
 * direction.
 */
describe('the route list', () => {
  it('publishes the 1.4.3 criterion page at criteria/1.4.3/', () => {
    expect(ROUTES).toContainEqual({ path: 'criteria/1.4.3/', page: 'criterion', num: '1.4.3' });
  });

  it('publishes the About page at about/', () => {
    expect(ROUTES).toContainEqual({ path: 'about/', page: 'about' });
  });

  it('publishes one criterion page for every criterion in the manifest, in number order', () => {
    const published = ROUTES.filter((r) => r.page === 'criterion');
    expect(published).toHaveLength(55);
    expect(published.map((r) => r.num)).toEqual(EXPECTED.map((c) => c.num));
    expect(routeFor('criteria/1.4.10/')?.num).toBe('1.4.10');
  });

  it('only publishes criteria the manifest knows', () => {
    const known = new Set(EXPECTED.map((c) => c.num));
    for (const route of ROUTES.filter((r) => r.page === 'criterion')) {
      expect(known.has(route.num!), route.path).toBe(true);
    }
  });

  it('writes every path with a trailing slash and no leading one', () => {
    for (const { path } of ROUTES) {
      if (path === '') continue;
      expect(path, path).toMatch(/^[^/].*\/$/);
    }
  });

  it('names no path twice', () => {
    const paths = ROUTES.map((r) => r.path);
    expect(paths.length).toBe(new Set(paths).size);
  });

  it('finds a route by path', () => {
    expect(routeFor('criteria/1.4.3/')?.num).toBe('1.4.3');
    expect(routeFor('criteria/9.9.9/')).toBeUndefined();
  });

  it('builds criterion paths from the number', () => {
    expect(criterionPath('2.4.11')).toBe('criteria/2.4.11/');
  });
});

describe('rel', () => {
  it('climbs out of a criterion page to a sibling section', () => {
    expect(rel('criteria/1.4.3/', 'colour-check/')).toBe('../../colour-check/');
  });

  it('climbs out of a criterion page to the home page', () => {
    expect(rel('criteria/1.4.3/', '')).toBe('../../');
  });

  it('stays inside a shared parent', () => {
    expect(rel('criteria/1.4.3/', 'criteria/')).toBe('../');
    expect(rel('criteria/1.4.3/', 'criteria/1.4.4/')).toBe('../1.4.4/');
    expect(rel('criteria/', 'criteria/1.4.3/')).toBe('1.4.3/');
  });

  it('goes down from the home page', () => {
    expect(rel('', 'criteria/1.4.3/')).toBe('criteria/1.4.3/');
  });

  it('points at the current page as ./', () => {
    expect(rel('criteria/1.4.3/', 'criteria/1.4.3/')).toBe('./');
    expect(rel('', '')).toBe('./');
  });

  it('keeps a query string and a fragment', () => {
    expect(rel('criteria/1.4.3/', 'criteria/?p=1')).toBe('../?p=1');
    expect(rel('criteria/1.4.3/', 'about/#accessibility-statement')).toBe(
      '../../about/#accessibility-statement',
    );
  });
});
