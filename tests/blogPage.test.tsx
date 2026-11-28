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
    // The embedded lab brings its title (h3), its steps (h4) and its own h4, as on its criterion page.
    expect(outline(html).map((h) => h.level)).toEqual([1, 2, 3, 3, 4, 4, 2]);
    expect(outlineProblems(html)).toEqual([]);
  });

  it('shows an embedded example pair exactly as its criterion page does, linked to that page', () => {
    const html = main(postPage());
    const pair = (page: string) => page.match(/<div class="ex">[\s\S]*?<\/figure><\/div>/)![0];
    const criterionPage = renderToStaticMarkup(<Site route={routeFor('criteria/1.4.11/')!} />);
    const embed = html.match(/<div class="embed embed--example">[\s\S]*?<\/figure><\/div>/)![0];
    expect(pair(embed)).toBe(pair(criterionPage));
    expect(embed).toContain('<a href="../../criteria/1.4.11/">1.4.11 Non-text Contrast</a>');
    expect(text(embed)).toMatch(/^Broken, then fixed, from 1\.4\.11 Non-text Contrast: the same interface twice/);
  });

  it('shows an embedded lab exactly as its criterion page does, judging the criterion named', () => {
    const html = main(postPage());
    const slot = (page: string) => page.match(/<div class="lab-slot" data-lab="fade-text">[\s\S]*?<p class="sr" aria-live="polite"><\/p><\/div><\/div>/)![0];
    const criterionPage = main(renderToStaticMarkup(<Site route={routeFor('criteria/1.4.3/')!} />));
    // The same markup but for the ids React's useId gives, which depend on the place in the page.
    const ids = (markup: string) => markup.replace(/_R_[a-z0-9]+_/g, '_R_');
    expect(ids(slot(html))).toBe(ids(slot(criterionPage)));
    expect(slot(html)).toContain('1.4.3 passes');
    const embed = html.slice(html.indexOf('<div class="embed embed--lab">'));
    expect(embed.startsWith(`<div class="embed embed--lab">${slot(html)}<p class="embed__from">A lab from <a href="../../criteria/1.4.3/">1.4.3 Contrast (Minimum)</a>`)).toBe(true);
  });

  it('fails the build on a lab id no lab answers to, or a criterion the lab does not judge', () => {
    const withLab = (lab: string, num: string) => {
      const post = fixturePost();
      return { ...post, body: post.body.map((n) => (typeof n !== 'string' && n.tag === 'lab' ? { ...n, lab, num } : n)) };
    };
    expect(() => renderToStaticMarkup(<Site route={FIXTURE_ROUTE} post={withLab('contrast', '1.4.3')} />)).toThrow(
      /post fixture-contrast-thresholds: ::lab contrast is no lab \(the ids are in src\/labs\/INDEX\.md\)/,
    );
    expect(() => renderToStaticMarkup(<Site route={FIXTURE_ROUTE} post={withLab('fade-text', '1.4.11')} />)).toThrow(
      /post fixture-contrast-thresholds: ::lab fade-text does not judge 1\.4\.11: it is on 1\.4\.3/,
    );
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
