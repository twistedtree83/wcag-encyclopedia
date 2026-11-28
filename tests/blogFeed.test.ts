import { describe, it, expect } from 'vitest';
import { feedProblems, feedXml } from '../src/blog/feed';
import type { Post } from '../src/blog/post';
import { fixturePost } from './fixturePost';

/**
 * The blog feed (S-09): an Atom 1.0 document at /blog/feed.xml with every post in full. The
 * prerender step writes it with `feedXml` and fails the build on anything `feedProblems` finds.
 */

const ORIGIN = 'https://wcagencyclopedia.com';

/** A second post, newer than the fixture and never updated, about one of its criteria. */
const newer = (): Post => {
  const { updated: _, ...post } = fixturePost();
  return { ...post, slug: 'a-newer-post', title: 'A newer post on <contrast> & focus', published: '2026-11-24' };
};

const entries = (xml: string) => [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]!);
const one = (xml: string, tag: string) => new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`).exec(xml)?.[1];

describe('the blog feed', () => {
  it('is an Atom 1.0 feed with no problems', () => {
    const xml = feedXml([fixturePost(), newer()], '2026-11-01');
    expect(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">')).toBe(true);
    expect(feedProblems(xml)).toEqual([]);
  });

  it('names itself, the blog index and the organisation, all by absolute URL', () => {
    const xml = feedXml([fixturePost()], '2026-11-01');
    const head = xml.slice(0, xml.indexOf('<entry>'));
    expect(one(head, 'id')).toBe(`${ORIGIN}/blog/`);
    expect(head).toContain(`<link rel="self" type="application/atom+xml" href="${ORIGIN}/blog/feed.xml" />`);
    expect(head).toContain(`<link rel="alternate" type="text/html" href="${ORIGIN}/blog/" />`);
    expect(head).toContain(`<author><name>WCAG Encyclopedia</name><uri>${ORIGIN}/</uri></author>`);
  });

  it('lists every post newest first, each at its absolute post URL', () => {
    const list = entries(feedXml([fixturePost(), newer()], '2026-11-01'));
    expect(list.map((e) => one(e, 'id'))).toEqual([`${ORIGIN}/blog/a-newer-post/`, `${ORIGIN}/blog/fixture-contrast-thresholds/`]);
    expect(list[1]).toContain(`<link rel="alternate" type="text/html" href="${ORIGIN}/blog/fixture-contrast-thresholds/" />`);
  });

  it('dates each entry as its page does, and the feed by its latest change', () => {
    const xml = feedXml([fixturePost(), newer()], '2026-11-01');
    const [latest, fixture] = entries(xml);
    expect(one(fixture!, 'published')).toBe('2026-11-02T00:00:00Z');
    expect(one(fixture!, 'updated')).toBe('2026-11-20T00:00:00Z');
    expect(one(latest!, 'updated')).toBe('2026-11-24T00:00:00Z');
    expect(one(xml.slice(0, xml.indexOf('<entry>')), 'updated')).toBe('2026-11-24T00:00:00Z');
  });

  it('carries each post in full, with links to the site made absolute', () => {
    const [entry] = entries(feedXml([fixturePost()], '2026-11-01'));
    expect(one(entry!, 'summary')).toMatch(/^How the contrast of text/);
    const content = /<content type="html">([\s\S]*?)<\/content>/.exec(entry!)![1]!;
    const html = content.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&amp;', '&');
    expect(html).toContain(`<a href="${ORIGIN}/criteria/1.4.3/">Contrast (Minimum)</a>`);
    expect(html).toContain('<h2>Two thresholds, one formula</h2>');
    expect(html).toContain('<a href="https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html">');
    expect(html).toContain('<code>.field { border-color: #767676; }</code>');
  });

  it('escapes post text, so a title with markup characters stays well formed', () => {
    const xml = feedXml([newer()], '2026-11-01');
    expect(xml).toContain('<title>A newer post on &lt;contrast&gt; &amp; focus</title>');
    expect(feedProblems(xml)).toEqual([]);
  });

  it('is still a valid feed with no posts, dated by the fallback', () => {
    const xml = feedXml([], '2026-11-01');
    expect(entries(xml)).toEqual([]);
    expect(one(xml, 'updated')).toBe('2026-11-01T00:00:00Z');
    expect(feedProblems(xml)).toEqual([]);
  });
});

describe('the feed check', () => {
  const good = () => feedXml([fixturePost(), newer()], '2026-11-01');

  it('fails a relative entry URL', () => {
    const xml = good().replace(`<id>${ORIGIN}/blog/a-newer-post/</id>`, '<id>/blog/a-newer-post/</id>');
    expect(feedProblems(xml)).toContainEqual(expect.stringMatching(/entry id \/blog\/a-newer-post\/ is not an absolute URL on https:\/\/wcagencyclopedia\.com/));
    const link = good().replace(`href="${ORIGIN}/blog/a-newer-post/"`, 'href="../a-newer-post/"');
    expect(feedProblems(link)).toContainEqual(expect.stringMatching(/entry link \.\.\/a-newer-post\/ is not an absolute URL/));
  });

  it('fails an entry missing a required element', () => {
    for (const tag of ['id', 'title', 'updated', 'content']) {
      const [entry] = entries(good());
      const without = entry!.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`), '');
      expect(feedProblems(good().replace(entry!, without)), tag).toContainEqual(`an entry has 0 ${tag} elements, not 1`);
    }
  });

  it('fails a feed missing its id, its updated date or its self link', () => {
    const head = (xml: string) => xml.slice(0, xml.indexOf('<entry>'));
    const drop = (pattern: RegExp) => {
      const xml = good();
      return xml.replace(head(xml), head(xml).replace(pattern, ''));
    };
    expect(feedProblems(drop(/<id>[^<]*<\/id>/))).toContain('the feed has 0 id elements, not 1');
    expect(feedProblems(drop(/<updated>[^<]*<\/updated>/))).toContain('the feed has 0 updated elements, not 1');
    expect(feedProblems(drop(/<link rel="self"[^>]*>/))).toContain(`the feed has no self link to ${ORIGIN}/blog/feed.xml`);
  });

  it('fails a date that is not RFC 3339', () => {
    const xml = good().replace('<published>2026-11-02T00:00:00Z</published>', '<published>2 November 2026</published>');
    expect(feedProblems(xml)).toContain('published "2 November 2026" is not an RFC 3339 date-time');
  });

  it('fails markup that is not well formed', () => {
    expect(feedProblems(good().replace('</summary>', ''))).toContainEqual(expect.stringMatching(/not well formed/));
    expect(feedProblems(good().replace('&amp; focus', '& focus'))).toContain('an unescaped &');
    expect(feedProblems('<rss version="2.0"></rss>')).toEqual(['not a feed in the http://www.w3.org/2005/Atom namespace']);
  });

  it('fails two entries with one id', () => {
    const xml = feedXml([fixturePost(), fixturePost()], '2026-11-01');
    expect(feedProblems(xml)).toContain(`entry id ${ORIGIN}/blog/fixture-contrast-thresholds/ is used twice`);
  });
});
