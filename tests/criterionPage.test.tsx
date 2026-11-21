import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CORPUS, criterion } from '../src/criteria/corpus';
import { render, ROUTES } from '../src/entry-server';
import { CriterionPage } from '../src/pages/CriterionPage';
import { RouteProvider } from '../src/site/RouteContext';
import { criterionPath } from '../src/site/routes';

/**
 * The criterion page as the build writes it: the static HTML a reader gets before any script
 * runs (ADR 0001). Optional sections appear only when the record has something to put in them.
 */

// Adds a fixture lab; every real lab still resolves through the real registry.
vi.mock('../src/labs/registry', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/labs/registry')>();
  return {
    ...real,
    labById: (id: string) =>
      id === 'fixture-lab'
        ? { id, title: 'Try it: a fixture lab', Lab: () => <p>Fixture lab body</p> }
        : real.labById(id),
  };
});

const main = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));
const h2s = (html: string) =>
  [...main(html).matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1]!.replace(/<[^>]+>/g, ''));
const decode = (s: string) =>
  s
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

function page(num: string) {
  const route = ROUTES.find((r) => r.num === num)!;
  return render(route).html;
}

describe('every criterion page', () => {
  it('is rendered for all 55 criteria', () => {
    expect(ROUTES.filter((r) => r.page === 'criterion')).toHaveLength(55);
  });

  for (const record of CORPUS) {
    it(`${record.num} has its name, restatement and both captions in the static HTML`, () => {
      const html = decode(page(record.num));
      expect(html).toMatch(new RegExp(`<h1[^>]*>${escapeRe(record.name)}</h1>`));
      expect(html).toContain(record.plain);
      expect(html).toContain(record.fail.caption);
      expect(html).toContain(record.pass.caption);
    });
  }
});

describe('the anatomy', () => {
  it('puts the breadcrumb first, with the current page marked', () => {
    const html = decode(page('2.4.11'));
    const crumbs = html.slice(
      html.indexOf('<nav class="trail"'),
      html.indexOf('</nav>', html.indexOf('<nav class="trail"')),
    );
    expect(crumbs).toContain('aria-label="Breadcrumb"');
    expect(crumbs).toContain('href="../../"');
    expect(crumbs).toContain('href="../"');
    expect(crumbs).toMatch(/aria-current="page"[^>]*>2\.4\.11 Focus Not Obscured \(Minimum\)</);
    expect(html.indexOf('class="trail"')).toBeLessThan(html.indexOf('<h1'));
  });

  it('shows the facts card with In WCAG since', () => {
    const html = decode(page('2.4.11'));
    const facts = html.slice(html.indexOf('<dl class="facts'), html.indexOf('</dl>'));
    const pairs = [...facts.matchAll(/<dt>(.*?)<\/dt><dd>(.*?)<\/dd>/g)].map((m) => [
      m[1],
      m[2]!.replace(/<[^>]+>/g, ''),
    ]);
    expect(pairs).toEqual([
      ['Principle', 'Operable'],
      ['Guideline', '2.4'],
      ['Level', 'AA'],
      ['In WCAG since', '2.2'],
      ['Number', '2.4.11'],
    ]);
  });

  it('tags a criterion new in 2.2, and only those', () => {
    const head = (num: string) => main(page(num)).match(/class="ch"[\s\S]*?<\/section>/)![0];
    expect(head('2.4.11')).toContain('New in 2.2');
    expect(head('2.4.7')).not.toContain('New in 2.2');
  });

  for (const record of CORPUS) {
    it(`${record.num} shows its sections in order, the optional ones only when it has them`, () => {
      const expected = [
        'Broken, then fixed',
        ...(record.diff ? ['What changed in the code'] : []),
        ...(record.demos?.length ? ['Watch it happen'] : []),
        ...(record.labs?.length ? ['Try it yourself'] : []),
        record.guideline === '1.1' || record.guideline === '2.3'
          ? expect.stringMatching(/^More from /)
          : `Also in guideline ${record.guideline}`,
      ];
      expect(h2s(page(record.num))).toEqual(expected);
    });
  }

  it('mounts one player per demo, so 2.4.7 has two and 1.4.3 none', () => {
    const players = (num: string) => (page(num).match(/<figure class="demo"/g) ?? []).length;
    expect(players('2.4.7')).toBe(2);
    expect(players('1.4.10')).toBe(1);
    expect(players('1.4.3')).toBe(0);
    const total = CORPUS.reduce((n, r) => n + players(r.num), 0);
    expect(total).toBe(9);
  });

  it('shows a lab under Try it yourself when the record has one', () => {
    const record = { ...criterion('2.4.11')!, labs: ['fixture-lab'] };
    const route = { path: criterionPath(record.num), page: 'criterion' as const, num: record.num };
    const html = renderToString(
      <RouteProvider value={route}>
        <CriterionPage record={record} />
      </RouteProvider>,
    );
    expect(h2s(`<main>${html}</main>`)).toContain('Try it yourself');
    expect(html).toContain('Try it: a fixture lab');
    expect(html).toContain('Fixture lab body');
  });

  it('shows up to six index cards linking to their criterion pages', () => {
    const html = page('1.4.3');
    const cards = [...html.matchAll(/<li><a class="surf" href="([^"]+)"/g)].map((m) => m[1]);
    expect(cards).toEqual([
      '../1.4.1/',
      '../1.4.2/',
      '../1.4.4/',
      '../1.4.5/',
      '../1.4.10/',
      '../1.4.11/',
    ]);
  });

  it('pages to the previous and next criterion, and only one way at the ends', () => {
    const pager = (num: string) => {
      const html = page(num);
      const block = html.slice(html.indexOf('class="pager"'));
      return [...block.matchAll(/<a[^>]*href="([^"]+)"[^>]*rel="(prev|next)"/g)].map((m) => [
        m[2],
        m[1],
      ]);
    };
    expect(pager('1.4.10')).toEqual([
      ['prev', '../1.4.5/'],
      ['next', '../1.4.11/'],
    ]);
    expect(pager('1.1.1')).toEqual([['next', '../1.2.1/']]);
    expect(pager('4.1.3')).toEqual([['prev', '../4.1.2/']]);
  });
});

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
