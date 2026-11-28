import { renderToStaticMarkup } from 'react-dom/server';
import { SITE_NAME } from '../site/jsonLd';
import { absoluteUrl } from '../site/crawl';
import { RouteProvider } from '../site/RouteContext';
import { FEED_PATH, PATHS, postPath, rel, type Route } from '../site/routes';
import { newestFirst, type Post } from './post';
import { ATOM, escapeXml } from './feedCheck';
import { PostBody } from './PostBody';

/**
 * The blog feed (S-09): an Atom 1.0 document (RFC 4287) at `/blog/feed.xml` holding every post
 * in full, newest first. Every address in it is absolute (ADR 0006), built from SITE_ORIGIN.
 * The prerender step writes it through `src/entry-server.tsx` and fails the build on anything
 * `feedProblems` (`feedCheck.ts`) finds. Build-time only: the browser never imports this module.
 */

const FEED_TITLE = `${SITE_NAME} blog`;

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
      <PostBody slug={post.slug} nodes={post.body} link={absoluteUrl} />
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
