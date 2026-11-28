import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePost } from '../../src/blog/parse';
import type { PostNode } from '../../src/blog/post';

/**
 * What the posts embed (S-08), read from the post files with the build's own parser, so a spec
 * can run each embedded lab and example on the post page that shows it.
 */

export type PostEmbed = {
  readonly slug: string;
  /** The post page's URL, `/blog/<slug>/`. */
  readonly url: string;
  readonly tag: 'example' | 'lab';
  readonly num: string;
  /** A lab embed's lab id. */
  readonly lab?: string;
};

const POSTS = fileURLToPath(new URL('../../src/blog/posts', import.meta.url));

const embedsIn = (nodes: readonly PostNode[]): { tag: 'example' | 'lab'; num: string; lab?: string }[] =>
  nodes.flatMap((n) => {
    if (typeof n === 'string') return [];
    if (n.tag === 'example' || n.tag === 'lab') return [{ tag: n.tag, num: n.num!, ...(n.lab ? { lab: n.lab } : {}) }];
    return embedsIn(n.children);
  });

/** Every embed in every post, in file order. */
export const POST_EMBEDS: readonly PostEmbed[] = readdirSync(POSTS)
  .filter((f) => f.endsWith('.md'))
  .sort()
  .flatMap((file) => {
    const slug = basename(file, '.md');
    const post = parsePost(readFileSync(join(POSTS, file), 'utf8'), slug);
    return embedsIn(post.body).map((e) => ({ slug, url: `/blog/${slug}/`, ...e }));
  });
