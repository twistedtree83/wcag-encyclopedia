import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { PostMeta } from '../src/blog/post';

/**
 * "Further reading" on a criterion page (S-09): up to three posts whose `criteria` include the
 * criterion, newest first, and no section at all when none does. The list comes from the posts'
 * frontmatter (`POSTS`), so here the fixture post stands in for the post files.
 */

vi.mock('../src/blog/posts', async () => {
  const { fixturePost } = await import('./fixturePost');
  const { body: _, ...meta } = fixturePost();
  return { POSTS: [meta], postMeta: () => meta };
});

const { render, ROUTES } = await import('../src/entry-server');
const { CriterionPage } = await import('../src/pages/CriterionPage');
const { RouteProvider } = await import('../src/site/RouteContext');
const { criterion } = await import('../src/criteria/corpus');
const { criterionPath } = await import('../src/site/routes');

const main = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));
const h2s = (html: string) => [...main(html).matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1]!.replace(/<[^>]+>/g, ''));
const section = (html: string) => {
  const start = html.indexOf('id="reading-title"');
  return start === -1 ? '' : html.slice(start, html.indexOf('</section>', start));
};

const post = (slug: string, published: string, criteria: string[]): PostMeta => ({
  slug,
  title: `Post ${slug}`,
  description: `About ${criteria.join(' and ')}.`,
  published,
  criteria,
});

const page = (num: string, posts: readonly PostMeta[]) => {
  const record = criterion(num)!;
  return renderToStaticMarkup(
    <RouteProvider value={{ path: criterionPath(num), page: 'criterion', num }}>
      <main>
        <CriterionPage record={record} posts={posts} />
      </main>
    </RouteProvider>,
  );
};

describe('Further reading on a criterion page', () => {
  const posts = [
    post('oldest', '2026-01-10', ['1.4.3']),
    post('newest', '2026-11-20', ['1.4.3', '1.4.11']),
    post('other', '2026-11-25', ['2.4.7']),
    post('middle', '2026-06-01', ['1.4.11', '1.4.3']),
    post('second', '2026-09-15', ['1.4.3']),
  ];

  it('lists the three newest posts that discuss the criterion, each linked relatively', () => {
    const list = section(page('1.4.3', posts));
    expect([...list.matchAll(/<h3><a href="([^"]+)">([^<]+)<\/a><\/h3>/g)].map((m) => [m[1], m[2]])).toEqual([
      ['../../blog/newest/', 'Post newest'],
      ['../../blog/second/', 'Post second'],
      ['../../blog/middle/', 'Post middle'],
    ]);
    expect(list).toContain('<time dateTime="2026-11-20">20 November 2026</time>');
    expect(list).toContain('About 1.4.3 and 1.4.11.');
  });

  it('comes after the labs and before the related criteria', () => {
    expect(h2s(page('1.4.3', posts))).toEqual(['Broken, then fixed', 'Try it yourself', 'Further reading', 'Also in guideline 1.4']);
  });

  it('lists fewer than three when fewer discuss it', () => {
    expect([...section(page('2.4.7', posts)).matchAll(/<h3>/g)]).toHaveLength(1);
  });

  it('shows no heading when no post discusses the criterion', () => {
    expect(page('1.1.1', posts)).not.toContain('Further reading');
    expect(page('1.4.3', [])).not.toContain('Further reading');
  });

  it('is built from the posts’ frontmatter on the page the prerender step writes', () => {
    const built = (num: string) => render(ROUTES.find((r) => r.num === num)!).html;
    expect(section(built('1.4.11'))).toContain('../../blog/fixture-contrast-thresholds/');
    expect(section(built('1.4.3'))).toContain('Two contrast thresholds, for text and for everything else');
    expect(built('2.4.7')).not.toContain('Further reading');
  });
});
