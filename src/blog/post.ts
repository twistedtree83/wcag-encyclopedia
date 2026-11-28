/**
 * A post (CONTEXT.md, ADR 0007) as the site holds it: its frontmatter and its body as a tree
 * of plain, JSON-safe nodes. `parse.ts` builds it from the Markdown file at build time; the
 * page draws it with `PostBody.tsx`. Types only, so it costs the browser nothing.
 */

/** A post's frontmatter, with its slug (the file name, and its URL: `blog/<slug>/`). */
export type PostMeta = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** W3C dates, `2026-11-02`. */
  readonly published: string;
  readonly updated?: string;
  /** The criterion numbers the post discusses, each linked from its body. */
  readonly criteria: readonly string[];
};

/**
 * One node of a post body: text, or an element. A link to a page of the site carries `to`, a
 * site path (`criteria/1.4.3/`) the page turns into a relative href; any other link carries
 * `href` as written.
 */
export type PostNode = string | PostElement;

export type PostElement = {
  readonly tag: PostTag;
  readonly children: readonly PostNode[];
  readonly to?: string;
  readonly href?: string;
  /** An ordered list's first number, when it is not 1. */
  readonly start?: number;
};

export type PostTag =
  | 'p'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'ul'
  | 'ol'
  | 'li'
  | 'blockquote'
  | 'pre'
  | 'code'
  | 'em'
  | 'strong'
  | 'a'
  | 'br'
  | 'hr';

export type Post = PostMeta & { readonly body: readonly PostNode[] };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** `2026-11-02` as the page shows it, "2 November 2026", the same in every time zone. */
export function longDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${d} ${MONTHS[(m ?? 1) - 1]} ${y}`;
}

/** Newest first, by published date, then by slug so the order is stable. */
export function newestFirst<P extends PostMeta>(posts: readonly P[]): P[] {
  return [...posts].sort((a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug));
}

/** How many posts a criterion page lists under "Further reading". */
export const FURTHER_READING = 3;

/**
 * A criterion page's "Further reading" (S-09): the newest posts whose `criteria` include `num`,
 * at most `FURTHER_READING` of them. Read from the posts' frontmatter, so no list is kept.
 */
export function postsAbout<P extends PostMeta>(num: string, posts: readonly P[]): P[] {
  return newestFirst(posts.filter((post) => post.criteria.includes(num))).slice(0, FURTHER_READING);
}
