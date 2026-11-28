import { describe, it, expect } from 'vitest';
import { CORPUS } from '../src/criteria/corpus';
import { failsWhen, firstSentence } from '../src/site/meta';
import { pageMeta } from '../src/site/Site';
import { ROUTES, criterionPath, PATHS, routeFor } from '../src/site/routes';

/**
 * The title and description every built page carries in its head (S-02, #70). The prerender
 * step writes `pageMeta(route)` into `site.html` for each route, so checking it over `ROUTES`
 * checks every built page. Search results cut titles past about 65 characters and
 * descriptions past about 160; below 30 and 70 they say too little to choose a result by.
 */

const BRAND = 'WCAG Encyclopedia';
const metas = ROUTES.map((route) => ({ path: route.path, page: route.page, ...pageMeta(route) }));
const criterionMetas = metas.filter((m) => m.page === 'criterion');

/** Sentences, split after a full stop, question or exclamation mark. */
const sentences = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

describe('head metadata on every built page', () => {
  it.each(metas)('$path has a title of 30–65 characters', ({ title }) => {
    expect(title.trim()).not.toBe('');
    expect(title.length).toBeGreaterThanOrEqual(30);
    expect(title.length).toBeLessThanOrEqual(65);
  });

  it.each(metas)('$path has a description of 70–160 characters', ({ description }) => {
    expect(description.trim()).not.toBe('');
    expect(description.length).toBeGreaterThanOrEqual(70);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('gives no two pages the same title', () => {
    const titles = metas.map((m) => m.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('gives no two pages the same description', () => {
    const descriptions = metas.map((m) => m.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it.each(metas)('$path names the brand at most once in its title', ({ title }) => {
    expect(title.split(BRAND).length - 1).toBeLessThanOrEqual(1);
  });

  it('leads the home title with the brand', () => {
    expect(pageMeta(routeFor(PATHS.home)!).title.startsWith(BRAND)).toBe(true);
  });
});

describe('criterion page titles and descriptions, built from the record', () => {
  it('titles 1.4.3 in the decided form', () => {
    expect(pageMeta(routeFor(criterionPath('1.4.3'))!).title).toBe(
      '1.4.3 Contrast (Minimum) explained, with examples | WCAG 2.2 AA',
    );
  });

  it('shortens a long criterion name’s title to fit, keeping the number and name', () => {
    const { title } = pageMeta(routeFor(criterionPath('1.2.3'))!);
    expect(title.startsWith('1.2.3 Audio Description or Media Alternative (Prerecorded)')).toBe(true);
    expect(title.length).toBeLessThanOrEqual(65);
  });

  it('describes a criterion by its restatement and the way it fails', () => {
    expect(pageMeta(routeFor(criterionPath('1.4.1'))!).description).toBe(
      'Colour can carry meaning, but never on its own. Fails when: hue is the only signal.',
    );
  });

  it('covers all 55 criteria with different descriptions', () => {
    expect(criterionMetas).toHaveLength(55);
    expect(new Set(criterionMetas.map((m) => m.description)).size).toBe(55);
  });

  it('ends every criterion description with the way it fails', () => {
    for (const record of CORPUS) {
      const { description } = pageMeta(routeFor(criterionPath(record.num))!);
      expect(description.endsWith(failsWhen(record)), record.num).toBe(true);
    }
  });

  it('carries a gist only where the restatement’s first sentence does not fit', () => {
    for (const record of CORPUS) {
      const fits = `${firstSentence(record.plain)} ${failsWhen(record)}`.length <= 160;
      expect(record.gist === undefined, `${record.num}: gist ${record.gist ? 'not needed' : 'needed'}`).toBe(fits);
    }
  });

  it('repeats no sentence across criterion descriptions', () => {
    const seen = new Map<string, string>();
    for (const { path, description } of criterionMetas) {
      for (const sentence of sentences(description)) {
        expect(seen.get(sentence), `"${sentence}" is on ${seen.get(sentence)} and ${path}`).toBeUndefined();
        seen.set(sentence, path);
      }
    }
  });
});
