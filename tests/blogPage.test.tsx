import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Site } from '../src/site/Site';
import { PATHS, ROUTES, routeFor } from '../src/site/routes';
import { FIXTURE_ROUTE, fixturePost } from './fixturePost';
import { BlogPage } from '../src/pages/BlogPage';
import { RouteProvider } from '../src/site/RouteContext';

/**
 * The post page and the blog index (S-07), rendered as the prerender step renders them. The
 * post page is checked on the fixture post (tests/fixturePost.ts).
 */

const postPage = () => renderToStaticMarkup(<Site route={FIXTURE_ROUTE} post={fixturePost()} />);
const blogRoute = routeFor(PATHS.blog)!;
const main = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));
const text = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');

/** The page's heading outline: each heading's level, in document order. */
const outline = (html: string) => [...main(html).matchAll(/<h([1-6])\b[^>]*>(.*?)<\/h\1>/g)].map((m) => ({ level: Number(m[1]), text: text(m[2]!) }));

/** One h1, and no heading more than one level below the heading before it. */
function outlineProblems(html: string): string[] {
  const heads = outline(html);
  const problems: string[] = [];
  if (heads.filter((h) => h.level === 1).length !== 1 || heads[0]?.level !== 1) problems.push('the page does not open with its one h1');
  heads.forEach((h, i) => {
    const before = heads[i - 1];
    if (before && h.level > before.level + 1) problems.push(`"${h.text}" is h${h.level} after h${before.level}`);
  });
  return problems;
}

describe('the post page', () => {
  it('has the post title as its one h1', () => {
    const heads = outline(postPage());
    expect(heads[0]).toEqual({ level: 1, text: 'Two contrast thresholds, for text and for everything else' });
  });

  it('passes the outline test: the body headings start at h2 under the h1, in order', () => {
    const html = postPage();
    expect(outline(html).map((h) => h.level)).toEqual([1, 2, 3, 2]);
    expect(outlineProblems(html)).toEqual([]);
  });

  it('shows the published and the updated date', () => {
    const html = main(postPage());
    expect(html).toContain('<time dateTime="2026-11-02">2 November 2026</time>');
    expect(html).toContain('<time dateTime="2026-11-20">20 November 2026</time>');
    expect(text(html)).toMatch(/Published 2 November 2026\. Updated 20 November 2026\./);
  });

  it('shows no updated date on a post never updated', () => {
    const { updated: _, ...post } = fixturePost();
    const html = main(renderToStaticMarkup(<Site route={FIXTURE_ROUTE} post={post} />));
    expect(text(html)).toMatch(/Published 2 November 2026\./);
    expect(text(html)).not.toMatch(/Updated/);
  });

  it('carries no byline', () => {
    const html = text(main(postPage()));
    expect(html).not.toMatch(/\bBy\b|\bauthor\b|written by/i);
    expect(main(postPage())).not.toMatch(/rel="author"|class="[^"]*byline/);
  });

  it('links each criterion it names to its criterion page, relative to the post', () => {
    const html = main(postPage());
    expect(html).toContain('<a href="../../criteria/1.4.3/">Contrast (Minimum)</a>');
    expect(html).toContain('<a href="../../criteria/1.4.11/">Non-text Contrast</a>');
    expect(html).toContain('<a href="https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html">');
  });

  it('sits under Blog in the breadcrumb and the header', () => {
    const html = postPage();
    expect(text(html.match(/<nav class="trail"[\s\S]*?<\/nav>/)![0])).toBe('HomeBlogTwo contrast thresholds, for text and for everything else');
    expect(html).toMatch(/<a href="\.\.\/"[^>]*aria-current="page">Blog<\/a>/);
  });
});

describe('the blog index', () => {
  const index = (posts = [fixturePost()]) =>
    renderToStaticMarkup(
      <RouteProvider value={blogRoute}>
        <BlogPage posts={posts} />
      </RouteProvider>,
    );

  it('is a route, beside the posts, so the sitemap and the axe scan include it', () => {
    expect(blogRoute).toEqual({ path: 'blog/', page: 'blog' });
    for (const route of ROUTES.filter((r) => r.page === 'post')) expect(route.path).toBe(`blog/${route.slug}/`);
  });

  it('lists each post newest first, linked, with its date and description', () => {
    const older = { ...fixturePost(), slug: 'older', title: 'An older post on the same subject', published: '2026-01-05' };
    delete (older as { updated?: string }).updated;
    const html = index([older, fixturePost()]);
    const titles = [...html.matchAll(/<h2[^>]*><a href="([^"]+)">(.*?)<\/a><\/h2>/g)].map((m) => [m[1], m[2]]);
    expect(titles).toEqual([
      ['fixture-contrast-thresholds/', 'Two contrast thresholds, for text and for everything else'],
      ['older/', 'An older post on the same subject'],
    ]);
    expect(html).toContain('<time dateTime="2026-11-02">2 November 2026</time>');
    expect(text(html)).toContain(fixturePost().description);
  });

  it('passes the outline test', () => {
    const html = renderToStaticMarkup(<Site route={blogRoute} />);
    expect(outlineProblems(html)).toEqual([]);
    expect(outlineProblems(`<main>${index()}</main>`)).toEqual([]);
  });

  it('says so when there is no post yet', () => {
    expect(text(index([]))).toMatch(/No posts yet/);
  });

  it('is in the header nav, current on the index', () => {
    const html = renderToStaticMarkup(<Site route={blogRoute} />);
    expect(html).toMatch(/<a href="\.\/"[^>]*aria-current="page">Blog<\/a>/);
    const home = renderToStaticMarkup(<Site route={routeFor('')!} />);
    expect(home).toMatch(/<a href="blog\/">Blog<\/a>/);
  });
});
