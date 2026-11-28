/// <reference types="vite/client" />
/**
 * Every post in full, for the prerender step only: `entry-server.tsx` is its one importer. The
 * browser loads just the post of the page it is on (`entry-client.tsx`).
 */

import type { Post } from './post';

const FILES = import.meta.glob<Post>('./posts/*.md', { import: 'default', eager: true });

export function postFor(slug: string | undefined): Post {
  const post = FILES[`./posts/${slug}.md`];
  if (!post) throw new Error(`blog: no post ${slug}`);
  return post;
}
