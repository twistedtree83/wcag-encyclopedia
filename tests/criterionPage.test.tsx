import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { postsAbout } from '../src/blog/post';
import { POSTS } from '../src/blog/posts';
import { CORPUS, criterion } from '../src/criteria/corpus';
import { render, ROUTES } from '../src/entry-server';
import type { CriterionRecord } from '../src/criteria/types';
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

/** A criterion page for a record that is not in the corpus as it stands (a fixture field added). */
function renderPage(record: CriterionRecord) {
  const route = { path: criterionPath(record.num), page: 'criterion' as const, num: record.num };
  return renderToString(
    <RouteProvider value={route}>
      <CriterionPage record={record} />
    </RouteProvider>,
  );
}

function page(num: string) {
  const route = ROUTES.find((r) => r.num === num)!;
  return render(route).html;
}

describe('every criterion page', () => {
  it('is rendered for all 55 criteria', () => {
    expect(ROUTES.filter((r) => r.page === 'criterion')).toHaveLength(55);
  });

  // The first of these pays for the first full page render, which has passed vitest's 5 s
  // default on a loaded machine; the rest are a few ms each.
  for (const record of CORPUS) {
    it(
      `${record.num} has its name, restatement and both captions in the static HTML`,
      () => {
        const html = decode(page(record.num));
        expect(html).toMatch(new RegExp(`<h1[^>]*>${escapeRe(record.name)}</h1>`));
        expect(html).toContain(record.plain);
        expect(html).toContain(record.fail.caption);
        expect(html).toContain(record.pass.caption);
      },
      30_000,
    );
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
        ...(record.procedure?.length ? ['How to test'] : []),
        ...(record.questions?.length ? ['Common questions'] : []),
        ...(record.labs?.length ? ['Try it yourself'] : []),
        ...(postsAbout(record.num, POSTS).length ? ['Further reading'] : []),
        record.guideline === '1.1' || record.guideline === '2.3'
          ? expect.stringMatching(/^More from /)
          : `Also in guideline ${record.guideline}`,
      ];
      expect(h2s(page(record.num))).toEqual(expected);
    });
  }

  it('puts How to test and Common questions between the demos and the labs on 4.1.2 and 4.1.3', () => {
    for (const num of ['4.1.2', '4.1.3']) {
      expect(h2s(page(num))).toEqual([
        'Broken, then fixed',
        'What changed in the code',
        'Watch it happen',
        'How to test',
        'Common questions',
        'Try it yourself',
        ...(postsAbout(num, POSTS).length ? ['Further reading'] : []),
        'Also in guideline 4.1',
      ]);
    }
  });

  it('shows the test procedure as an ordered list, one step per item', () => {
    const record = {
      ...criterion('2.4.11')!,
      procedure: ['Open the page.', 'Press Tab until the footer link has focus.', 'Look at the link.'],
    };
    const html = decode(main(`<main>${renderPage(record)}</main>`));
    const section = html.slice(html.indexOf('id="procedure-title"'));
    const list = section.slice(section.indexOf('<ol'), section.indexOf('</ol>'));
    expect([...list.matchAll(/<li>(.*?)<\/li>/g)].map((m) => m[1])).toEqual(record.procedure);
  });

  it('shows each common question as a heading, with its answer under it', () => {
    const record = {
      ...criterion('2.4.11')!,
      questions: [
        { question: 'Does a sticky header count?', answer: 'Yes, when it covers the focused control.' },
        { question: 'Does a cookie banner count?', answer: 'Only while it is open.' },
      ],
    };
    const html = decode(main(`<main>${renderPage(record)}</main>`));
    const start = html.indexOf('id="questions-title"');
    const section = html.slice(start, html.indexOf('</section>', start));
    const pairs = [...section.matchAll(/<h3[^>]*>(.*?)<\/h3>\s*<p>(.*?)<\/p>/g)].map((m) => [m[1], m[2]]);
    expect(pairs).toEqual([
      ['Does a sticky header count?', 'Yes, when it covers the focused control.'],
      ['Does a cookie banner count?', 'Only while it is open.'],
    ]);
  });

  it('mounts one player per demo, so 2.4.7 has two and 1.4.3 none', () => {
    const players = (num: string) => (page(num).match(/<figure class="demo"/g) ?? []).length;
    expect(players('2.4.7')).toBe(2);
    expect(players('1.4.10')).toBe(1);
    expect(players('1.4.3')).toBe(0);
    const total = CORPUS.reduce((n, r) => n + players(r.num), 0);
    expect(total).toBe(9);
  });

  it('shows a lab under Try it yourself when the record has one', () => {
    const html = renderPage({ ...criterion('2.4.11')!, labs: ['fixture-lab'] });
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

describe('live examples before any script runs (#43)', () => {
  const examples = (html: string) =>
    html.slice(html.indexOf('id="examples-title"'), html.indexOf('</section>', html.indexOf('id="examples-title"')));

  it('pre-renders 4.1.2’s static stages, with no input bar and no live example', () => {
    const html = decode(examples(page('4.1.2')));
    expect(html).toContain('"" — group');
    expect(html).toContain('"Email notifications, switch, on"');
    expect(html).not.toContain('inbar');
    expect(html).not.toContain('Read it aloud');
    expect(html).not.toContain('ex--live');
  });
});

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
