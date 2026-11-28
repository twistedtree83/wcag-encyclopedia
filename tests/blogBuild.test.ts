import { describe, it, expect, vi } from 'vitest';

/**
 * A post as the build sees it (S-07): with the fixture post standing in for the post files,
 * it joins ROUTES (and so the sitemap and the axe scan), renders through `render`, and carries
 * a `BlogPosting` that passes the prerender step's JSON-LD check.
 */

vi.mock('../src/blog/slugs', () => ({ POST_SLUGS: ['fixture-contrast-thresholds'] }));
vi.mock('../src/blog/posts', async () => {
  const { fixturePost } = await import('./fixturePost');
  const { body: _, ...meta } = fixturePost();
  return { POSTS: [meta], postMeta: () => meta };
});
vi.mock('../src/blog/bodies', async () => {
  const { fixturePost } = await import('./fixturePost');
  return { postFor: () => fixturePost() };
});

const { render, ROUTES, structuredData, pageSources } = await import('../src/entry-server');
const { jsonLdProblems } = await import('../src/site/jsonLd');

const ORIGIN = 'https://wcagencyclopedia.com';
const POST = ROUTES.find((r) => r.page === 'post')!;
const GIT_DATES = { published: '2025-01-01', modified: '2026-11-25' };
const blocks = (markup: string): Record<string, any>[] =>
  [...markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!));

describe('a post in the build', () => {
  it('is a route at blog/<slug>/, after the fixed and criterion pages', () => {
    expect(POST).toEqual({ path: 'blog/fixture-contrast-thresholds/', page: 'post', slug: 'fixture-contrast-thresholds' });
    expect(ROUTES.at(-1)).toBe(POST);
  });

  it('renders with its own title and description', () => {
    const page = render(POST);
    expect(page.title).toBe('Two contrast thresholds, for text and for everything else');
    expect(page.description).toMatch(/^How the contrast of text/);
    expect(page.html).toContain('<h1 id="post-title">Two contrast thresholds, for text and for everything else</h1>');
  });

  it('is dated in the sitemap from its Markdown file', () => {
    expect(pageSources(POST)).toEqual(['src/blog/posts/fixture-contrast-thresholds.md']);
  });

  it('carries a BreadcrumbList and a BlogPosting by the organisation, dated as the page shows', () => {
    const markup = structuredData(POST, GIT_DATES);
    expect(blocks(markup).map((b) => b['@type']).sort()).toEqual(['BlogPosting', 'BreadcrumbList']);
    const posting = blocks(markup).find((b) => b['@type'] === 'BlogPosting');
    const org = { '@type': 'Organization', name: 'WCAG Encyclopedia', url: `${ORIGIN}/` };
    expect(posting).toMatchObject({
      headline: 'Two contrast thresholds, for text and for everything else',
      url: `${ORIGIN}/blog/fixture-contrast-thresholds/`,
      mainEntityOfPage: `${ORIGIN}/blog/fixture-contrast-thresholds/`,
      datePublished: '2026-11-02',
      dateModified: '2026-11-20',
      author: org,
      publisher: org,
      image: `${ORIGIN}/share/blog-fixture-contrast-thresholds.png`,
    });
    expect(posting!.about).toEqual([
      { '@type': 'DefinedTerm', name: '1.4.3 Contrast (Minimum)', termCode: '1.4.3', url: `${ORIGIN}/criteria/1.4.3/` },
      { '@type': 'DefinedTerm', name: '1.4.11 Non-text Contrast', termCode: '1.4.11', url: `${ORIGIN}/criteria/1.4.11/` },
    ]);
    expect(blocks(markup).find((b) => b['@type'] === 'BreadcrumbList')!.itemListElement.map((i: any) => i.name)).toEqual([
      'Home',
      'Blog',
      'Two contrast thresholds, for text and for everything else',
    ]);
    expect(jsonLdProblems(markup, POST)).toEqual([]);
  });

  it('fails the check when a BlogPosting is missing or wrong', () => {
    const markup = structuredData(POST, GIT_DATES);
    const without = markup.replace(/<script[^>]*>[^<]*"BlogPosting"[^<]*<\/script>/, '');
    expect(jsonLdProblems(without, POST)).toContainEqual(expect.stringMatching(/not \[BlogPosting, BreadcrumbList\]/));
    const byline = markup.replace(/"author":\{[^}]*\}/, '"author":{"@type":"Person","name":"Someone"}');
    expect(jsonLdProblems(byline, POST)).toContain('BlogPosting author is not the organisation');
    const undated = markup.replace('"datePublished":"2026-11-02"', '"datePublished":"November"');
    expect(jsonLdProblems(undated, POST)).toContain('BlogPosting datePublished "November" is not a date');
  });

  it('has its own share card, an article, with its title, date and criteria', async () => {
    const { shareCard, shareTags, cardContrastProblems } = await import('../src/site/share');
    const card = shareCard(POST);
    expect(card.file).toBe('share/blog-fixture-contrast-thresholds.png');
    expect(card.alt).toBe('Share card: Two contrast thresholds, for text and for everything else, a post on the WCAG Encyclopedia blog about 1.4.3, 1.4.11');
    expect(JSON.stringify(card.tree)).toContain('2 November 2026');
    expect(cardContrastProblems(card.tree)).toEqual([]);
    expect(shareTags(POST)).toContain('<meta property="og:type" content="article" />');
    expect(shareTags(POST)).toContain(`<meta property="og:image" content="${ORIGIN}/share/blog-fixture-contrast-thresholds.png" />`);
    expect(render(POST).share).toBe(shareTags(POST));
  });

  it('gives the blog index the site card and a breadcrumb only', async () => {
    const { shareCard } = await import('../src/site/share');
    expect(shareCard(ROUTES.find((r) => r.page === 'blog')!).file).toBe('share/site.png');
    const blog = ROUTES.find((r) => r.page === 'blog')!;
    const markup = structuredData(blog, GIT_DATES);
    expect(blocks(markup).map((b) => b['@type'])).toEqual(['BreadcrumbList']);
    expect(jsonLdProblems(markup, blog)).toEqual([]);
    expect(pageSources(blog)).toEqual(['src/pages/BlogPage.tsx', 'src/blog/posts']);
  });
});
