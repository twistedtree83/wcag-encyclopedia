/**
 * The post parser (ADR 0007): one Markdown file with frontmatter in, a `Post` out, or an error
 * naming every problem with the post and the line it is on.
 *
 * Build-time only. The `posts` Vite plugin (`plugin.ts`, in `vite.config.ts`) is its one caller
 * in the build, so the Markdown parser runs in Node and never reaches the browser: a page gets the
 * finished tree as data. `e2e/blog.spec.ts` checks no parser code is in `dist/assets`.
 *
 * What a post body may hold is the `NODES` table: one converter per Markdown node type. A node
 * type with no entry fails the build, so a post can't slip in raw HTML or an image.
 *
 * Embeds (S-08) are leaf directives, one line each: `::example{num="1.4.3"}` shows that
 * criterion's fail and pass examples, `::lab{id="fade-text" num="1.4.3"}` shows that lab judging
 * that criterion. They only point at what the site already has: no attribute or label can add
 * content, and a container directive (`:::`), which would hold the post's own, fails. Inline
 * directives are not switched on, so a colon in running text stays text.
 */

import { fromMarkdown } from 'mdast-util-from-markdown';
import { directive } from 'micromark-extension-directive';
import { directiveFromMarkdown, type LeafDirective } from 'mdast-util-directive';
import type { Heading, Link, Nodes, Parent } from 'mdast';
import { parse as parseYaml } from 'yaml';
import { EXPECTED } from '../criteria/manifest';
import { SITE_ORIGIN } from '../site/config';
import { PATHS, criterionPath } from '../site/routes';
import type { Post, PostElement, PostMeta, PostNode, PostTag } from './post';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const FIELDS = ['title', 'description', 'published', 'updated', 'criteria'] as const;
const CRITERIA = new Set(EXPECTED.map((c) => c.num));

/** Every page a post may link to, by its path from the root (`/criteria/1.4.3/`). */
const SITE_PAGES = new Set(
  [...Object.values(PATHS), ...EXPECTED.map((c) => criterionPath(c.num))].map((p) => `/${p}`),
);

/** What one walk of the body collects besides the tree. */
type Walk = {
  readonly post: Pick<PostMeta, 'slug' | 'criteria'>;
  /** The file line of the body's first line, so problems name the line in the file. */
  readonly offset: number;
  readonly problems: string[];
  readonly linked: Set<string>;
  /** Each embed so far, as `::example 1.4.3` or `::lab fade-text`, so none is embedded twice. */
  readonly embedded: Set<string>;
  /** The level of the heading before, 1 being the page's own h1. */
  level: number;
};

type Convert<N> = (node: N, walk: Walk) => PostNode[];

const el = (tag: PostTag, children: PostNode[], extra: Partial<PostElement> = {}): PostElement => ({
  tag,
  children,
  ...extra,
});

const lineOf = (node: Nodes, walk: Walk) => (node.position?.start.line ?? 0) + walk.offset;

const fail = (walk: Walk, node: Nodes, problem: string): PostNode[] => {
  walk.problems.push(`line ${lineOf(node, walk)}: ${problem}`);
  return [];
};

const children = (node: Parent, walk: Walk): PostNode[] =>
  (node.children as Nodes[]).flatMap((child) => convert(child, walk));

const plain = (node: Nodes): string =>
  'value' in node ? node.value : 'children' in node ? (node.children as Nodes[]).map(plain).join('') : '';

const wrap =
  (tag: PostTag): Convert<Parent> =>
  (node, walk) => [el(tag, children(node, walk))];

const unsupported =
  (what: string): Convert<Nodes> =>
  (node, walk) =>
    fail(walk, node, `${what}, which a post can't hold`);

/** One converter per Markdown node type a post body may hold. */
const NODES: { [T in Nodes['type']]?: Convert<Extract<Nodes, { type: T }>> } = {
  paragraph: wrap('p'),
  emphasis: wrap('em'),
  strong: wrap('strong'),
  blockquote: wrap('blockquote'),
  text: (node) => [node.value],
  inlineCode: (node) => [el('code', [node.value])],
  code: (node) => [el('pre', [el('code', [node.value])])],
  break: () => [el('br', [])],
  thematicBreak: () => [el('hr', [])],
  heading: (node, walk) => heading(node, walk),
  link: (node, walk) => link(node, walk),
  list: (node, walk) => {
    // A tight list's items hold their text directly, as the HTML of a Markdown list does.
    const items = node.children.map((item) =>
      el(
        'li',
        node.spread || item.spread
          ? children(item, walk)
          : item.children.flatMap((c) => (c.type === 'paragraph' ? children(c, walk) : convert(c, walk))),
      ),
    );
    const start = node.ordered && node.start != null && node.start !== 1 ? { start: node.start } : {};
    return [el(node.ordered ? 'ol' : 'ul', items, start)];
  },
  html: unsupported('raw HTML'),
  image: unsupported('an image'),
  imageReference: unsupported('an image'),
  linkReference: unsupported('a reference-style link (write the address in the link)'),
  definition: unsupported('a link definition (write the address in the link)'),
  leafDirective: (node, walk) => embed(node, walk),
  containerDirective: (node, walk) =>
    fail(walk, node, `:::${node.name} is a block of the post's own content, which a post can't hold: embed an existing example with ::example or a lab with ::lab`),
};

function convert(node: Nodes, walk: Walk): PostNode[] {
  const to = NODES[node.type] as Convert<Nodes> | undefined;
  return to ? to(node, walk) : fail(walk, node, `a ${node.type}, which a post can't hold`);
}

function heading(node: Heading, walk: Walk): PostNode[] {
  const text = plain(node);
  if (node.depth === 1) return fail(walk, node, `heading "${text}" is h1: a post's headings start at h2, under the page's own h1`);
  if (node.depth > walk.level + 1) fail(walk, node, `heading "${text}" is h${node.depth} after h${walk.level}: headings go down one level at a time`);
  walk.level = node.depth;
  return [el(`h${node.depth}` as PostTag, children(node, walk))];
}

/**
 * A link to the site is written as its page's path from the root (`/criteria/1.4.3/`) and
 * becomes a relative link on the page. A criterion page must be one of the post's `criteria`.
 */
function link(node: Link, walk: Walk): PostNode[] {
  const url = node.url;
  const inner = children(node, walk);
  if (url.startsWith(SITE_ORIGIN)) return fail(walk, node, `links "${url}": link a page of the site by its path from the root, like /criteria/1.4.3/`);
  if (/^(https?:|mailto:)/.test(url) || url.startsWith('#')) return [el('a', inner, { href: url })];

  const page = url.replace(/[?#].*$/, '');
  if (!url.startsWith('/') || !page.endsWith('/'))
    return fail(walk, node, `links "${url}": link a page of the site by its path from the root, ending in /, like /criteria/1.4.3/`);
  if (!SITE_PAGES.has(page)) return fail(walk, node, `links ${url}, which is no page on the site`);

  const num = /^\/criteria\/([\d.]+)\/$/.exec(page)?.[1];
  if (num) {
    walk.linked.add(num);
    if (!walk.post.criteria.includes(num))
      fail(walk, node, `links criterion ${num}, which its criteria [${walk.post.criteria.join(', ')}] do not list`);
  }
  return [el('a', inner, { to: url.slice(1) })];
}

/** Each embed and what it takes: the attribute and what it means, in order. */
const EMBEDS = {
  example: { num: "the criterion's number" },
  lab: { id: "the lab's id, as in src/labs/INDEX.md", num: 'the criterion its verdict judges' },
} as const satisfies Record<string, Record<string, string>>;

/**
 * An embed of an existing example pair or lab. Its criterion must be one of the post's
 * `criteria`, and counts as linked, since the embed links its page. It must come under a
 * heading: the lab's title is an h3, and some examples hold one.
 */
function embed(node: LeafDirective, walk: Walk): PostNode[] {
  const name = node.name;
  if (!(name in EMBEDS)) return fail(walk, node, `::${name} is no embed a post can use (${Object.keys(EMBEDS).map((k) => `::${k}`).join(', ')})`);
  const takes: Record<string, string> = EMBEDS[name as keyof typeof EMBEDS];
  const attrs = node.attributes ?? {};
  const before = walk.problems.length;
  if (node.children.length) fail(walk, node, `::${name} has a label [${plain(node)}], which it does not take`);
  for (const key of Object.keys(attrs)) if (!(key in takes)) fail(walk, node, `::${name} has ${key}, which it does not take`);
  for (const [key, what] of Object.entries(takes)) if (!attrs[key]) fail(walk, node, `::${name} takes ${key}="…", ${what}`);
  if (walk.problems.length > before) return [];

  const num = attrs.num!;
  const lab = attrs.id;
  const label = lab ? `::${name} ${lab} ${num}` : `::${name} ${num}`;
  if (!CRITERIA.has(num)) return fail(walk, node, `${label} is not a WCAG 2.2 A or AA criterion`);
  walk.linked.add(num);
  if (!walk.post.criteria.includes(num)) fail(walk, node, `${label} is a criterion its criteria [${walk.post.criteria.join(', ')}] do not list`);
  if (walk.level < 2) fail(walk, node, `${label} comes before the first heading: put it under an h2`);
  const key = lab ? `::lab ${lab}` : `::example ${num}`;
  if (walk.embedded.has(key)) fail(walk, node, `${key} is embedded twice: a page shows each example and lab once`);
  walk.embedded.add(key);
  return [lab ? el('lab', [], { lab, num }) : el('example', [], { num })];
}

/** The frontmatter block and the body after it, with the body's first line in the file. */
function split(source: string): { front: string; body: string; offset: number } | undefined {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(source);
  if (!m) return undefined;
  return { front: m[1]!, body: source.slice(m[0].length), offset: m[0].split('\n').length - 1 };
}

function meta(slug: string, front: unknown, problems: string[]): PostMeta {
  const data = (front && typeof front === 'object' ? front : {}) as Record<string, unknown>;
  for (const key of Object.keys(data)) if (!(FIELDS as readonly string[]).includes(key)) problems.push(`${key} is not a post field (${FIELDS.join(', ')})`);

  const text = (key: 'title' | 'description') => {
    const value = data[key];
    if (value === undefined) problems.push(`${key} is missing`);
    else if (typeof value !== 'string' || !value.trim()) problems.push(`${key} is not text`);
    return typeof value === 'string' ? value.trim() : '';
  };
  const date = (key: 'published' | 'updated') => {
    const value = data[key];
    if (value === undefined) {
      if (key === 'published') problems.push('published is missing');
      return undefined;
    }
    const s = String(value);
    if (!DATE.test(s) || Number.isNaN(Date.parse(s))) problems.push(`${key} "${s}" is not a date (write 2026-11-02)`);
    return s;
  };

  const title = text('title');
  const description = text('description');
  const published = date('published') ?? '';
  const updated = date('updated');
  if (updated && published && updated < published) problems.push(`updated ${updated} is before published ${published}`);

  const raw = data.criteria;
  const criteria = Array.isArray(raw) ? raw.map(String) : [];
  if (raw === undefined) problems.push('criteria is missing');
  else if (!Array.isArray(raw)) problems.push('criteria is not a list of criterion numbers');
  else if (!criteria.length) problems.push('criteria is empty: a post discusses at least one criterion');
  for (const num of criteria) if (!CRITERIA.has(num)) problems.push(`criteria: ${num} is not a WCAG 2.2 A or AA criterion`);

  return { slug, title, description, published, ...(updated ? { updated } : {}), criteria };
}

/** Parses one post file. Throws an error listing every problem, each line naming the post. */
export function parsePost(source: string, slug: string): Post {
  const problems: string[] = [];
  if (!SLUG.test(slug)) problems.push(`slug "${slug}" is not lowercase words joined by hyphens`);

  const parts = split(source);
  let post: Post | undefined;
  if (!parts) problems.push('has no frontmatter: start the file with --- and the post fields');
  else {
    let front: unknown;
    try {
      front = parseYaml(parts.front);
    } catch (e) {
      problems.push(`frontmatter does not parse: ${(e as Error).message.split('\n')[0]}`);
    }
    const head = meta(slug, front, problems);
    const walk: Walk = { post: head, offset: parts.offset, problems, linked: new Set(), embedded: new Set(), level: 1 };
    // Leaf and container directives only (see the top of the file): no inline `:name`.
    const { flow } = directive();
    const tree = fromMarkdown(parts.body, { extensions: [{ flow }], mdastExtensions: [directiveFromMarkdown()] });
    const body = children(tree, walk);
    for (const num of head.criteria) if (!walk.linked.has(num)) problems.push(`lists criterion ${num} but never links its page, /criteria/${num}/`);
    post = { ...head, body };
  }

  if (problems.length || !post) throw new Error(problems.map((p) => `post ${slug}: ${p}`).join('\n'));
  return post;
}
