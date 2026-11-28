import { renderToStaticMarkup } from 'react-dom/server';
import { SITE_NAME } from '../site/jsonLd';
import { absoluteUrl } from '../site/crawl';
import { SITE_ORIGIN } from '../site/config';
import { RouteProvider } from '../site/RouteContext';
import { FEED_PATH, PATHS, postPath, rel, type Route } from '../site/routes';
import { newestFirst, type Post } from './post';
import { PostBody } from './PostBody';

/**
 * The blog feed (S-09): an Atom 1.0 document (RFC 4287) at `/blog/feed.xml` holding every post
 * in full, newest first. Every address in it is absolute (ADR 0006), built from SITE_ORIGIN.
 * The prerender step writes it through `src/entry-server.tsx` and fails the build on anything
 * `feedProblems` finds. Build-time only: the browser never imports this module.
 */

const ATOM = 'http://www.w3.org/2005/Atom';
const FEED_TITLE = `${SITE_NAME} blog`;

const escapeXml = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/** A post's W3C date as the RFC 3339 date-time Atom requires: midnight UTC on that day. */
const dateTime = (date: string) => `${date}T00:00:00Z`;

/**
 * The `<link rel="alternate">` that lets a reader's browser or feed reader find the feed from a
 * blog page's head. Relative, like every link between pages (ADR 0001): only the feed's own
 * contents need absolute addresses.
 */
export function feedLink(route: Route): string {
  return `<link rel="alternate" type="application/atom+xml" title="${escapeXml(FEED_TITLE)}" href="${rel(route.path, PATHS.blog)}feed.xml" />`;
}

/** A post body as HTML, its links to the site absolute, for a feed reader that is on no page. */
function bodyHtml(post: Post): string {
  const route: Route = { path: postPath(post.slug), page: 'post', slug: post.slug };
  return renderToStaticMarkup(
    <RouteProvider value={route}>
      <PostBody nodes={post.body} link={absoluteUrl} />
    </RouteProvider>,
  );
}

/**
 * The feed for `posts`. Its `updated` is the latest post's change; `fallback`, a W3C date, dates
 * a feed with no posts yet (the prerender step passes the blog index's last change).
 */
export function feedXml(posts: readonly Post[], fallback: string): string {
  const sorted = newestFirst(posts);
  const changed = (post: Post) => post.updated ?? post.published;
  const latest = sorted.map(changed).sort().at(-1) ?? fallback;
  const entries = sorted.flatMap((post) => {
    const url = escapeXml(absoluteUrl(postPath(post.slug)));
    return [
      '  <entry>',
      `    <id>${url}</id>`,
      `    <title>${escapeXml(post.title)}</title>`,
      `    <link rel="alternate" type="text/html" href="${url}" />`,
      `    <published>${dateTime(post.published)}</published>`,
      `    <updated>${dateTime(changed(post))}</updated>`,
      `    <summary>${escapeXml(post.description)}</summary>`,
      `    <content type="html">${escapeXml(bodyHtml(post))}</content>`,
      '  </entry>',
    ];
  });
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<feed xmlns="${ATOM}">`,
    `  <id>${escapeXml(absoluteUrl(PATHS.blog))}</id>`,
    `  <title>${escapeXml(FEED_TITLE)}</title>`,
    `  <link rel="self" type="application/atom+xml" href="${escapeXml(absoluteUrl(FEED_PATH))}" />`,
    `  <link rel="alternate" type="text/html" href="${escapeXml(absoluteUrl(PATHS.blog))}" />`,
    `  <updated>${dateTime(latest)}</updated>`,
    `  <author><name>${escapeXml(SITE_NAME)}</name><uri>${escapeXml(absoluteUrl(PATHS.home))}</uri></author>`,
    ...entries,
    '</feed>',
    '',
  ].join('\n');
}

const RFC_3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/** The elements named `tag` that are direct text children here (Atom's simple elements). */
const texts = (xml: string, tag: string) => [...xml.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => m[1] ?? '');

const unescape = (text: string) => text.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&amp;', '&');

/**
 * RFC 4287's rules for the feed, checked by hand (no XML library in the build): well-formed
 * markup with text escaped; a `feed` root in the Atom namespace with one `id`, `title` and
 * `updated`, an `author`, and a `self` link to its own address; each entry with one `id`,
 * `title`, `updated` and `content` and an `alternate` link, each address absolute on
 * SITE_ORIGIN; every date RFC 3339; no entry id used twice. Returns what is wrong, or `[]`.
 */
export function feedProblems(xml: string): string[] {
  const isFeed = /^<\?xml version="1\.0" encoding="utf-8"\?>\s*<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">[\s\S]*<\/feed>\s*$/.test(xml);
  if (!isFeed) return [`not a feed in the ${ATOM} namespace`];
  const problems: string[] = [...wellFormedProblems(xml.replace(/^<\?xml[^>]*\?>/, ''))];
  if (/&(?!(amp|lt|gt|apos|quot|#\d+|#x[0-9a-f]+);)/i.test(xml)) problems.push('an unescaped &');

  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1] ?? '');
  const head = xml.replace(/<entry>[\s\S]*?<\/entry>/g, '');
  for (const tag of ['id', 'title', 'updated']) {
    const count = texts(head, tag).length;
    if (count !== 1) problems.push(`the feed has ${count} ${tag} elements, not 1`);
  }
  if (!/<author>\s*<name>[^<]+<\/name>/.test(head)) problems.push('the feed has no author');
  const self = absoluteUrl(FEED_PATH);
  if (!head.includes(`<link rel="self" type="application/atom+xml" href="${escapeXml(self)}" />`)) problems.push(`the feed has no self link to ${self}`);

  const onSite = (url: string) => url.startsWith(`${SITE_ORIGIN}/`);
  const seen = new Set<string>();
  for (const entry of entries) {
    for (const tag of ['id', 'title', 'updated', 'content']) {
      const count = texts(entry, tag).length;
      if (count !== 1) problems.push(`an entry has ${count} ${tag} elements, not 1`);
    }
    const [id] = texts(entry, 'id').map(unescape);
    if (id !== undefined) {
      if (!onSite(id)) problems.push(`entry id ${id} is not an absolute URL on ${SITE_ORIGIN}`);
      if (seen.has(id)) problems.push(`entry id ${id} is used twice`);
      seen.add(id);
    }
    const links = [...entry.matchAll(/<link rel="alternate"[^>]*\bhref="([^"]*)"/g)].map((m) => unescape(m[1] ?? ''));
    if (links.length !== 1) problems.push(`an entry has ${links.length} alternate links, not 1`);
    for (const link of links) if (!onSite(link)) problems.push(`entry link ${link} is not an absolute URL on ${SITE_ORIGIN}`);
  }
  for (const tag of ['published', 'updated']) {
    for (const date of texts(xml, tag)) if (!RFC_3339.test(date)) problems.push(`${tag} "${date}" is not an RFC 3339 date-time`);
  }
  return problems;
}

/** Every tag closed in order, and no `<` left in text: the markup is well formed. */
function wellFormedProblems(xml: string): string[] {
  const open: string[] = [];
  for (const [tag, closing, name = '', selfClosing] of xml.matchAll(/<(\/?)([A-Za-z][\w:.-]*)\b[^<>]*?(\/?)>/g)) {
    if (selfClosing) continue;
    if (!closing) {
      open.push(name);
      continue;
    }
    const top = open.pop();
    if (top !== name) return [`not well formed: ${tag} closes <${top ?? 'nothing'}>`];
  }
  if (open.length) return [`not well formed: <${open.at(-1)}> is never closed`];
  if (/</.test(xml.replace(/<\/?[A-Za-z][\w:.-]*\b[^<>]*>/g, ''))) return ['not well formed: a < in text'];
  return [];
}
