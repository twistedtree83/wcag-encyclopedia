/// <reference types="vite/client" />
/**
 * Every post's frontmatter, newest first: what the blog index lists and what a post page's
 * title and description come from. Each `.md?meta` module is the frontmatter alone, built by
 * the `posts` plugin in vite.config.ts, so a page carries no post body it doesn't show.
 */

import { newestFirst, type PostMeta } from './post';

const FILES = import.meta.glob<PostMeta>('./posts/*.md', { query: '?meta', import: 'default', eager: true });

export const POSTS: readonly PostMeta[] = newestFirst(Object.values(FILES));

export function postMeta(slug: string | undefined): PostMeta {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`blog: no post ${slug}`);
  return post;
}
