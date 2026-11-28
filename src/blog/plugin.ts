/**
 * The `posts` Vite plugin (ADR 0007): compiles a post file in `src/blog/posts/` to a module of
 * plain data at build time, with `parse.ts`, so the Markdown parser runs in Node and only the
 * finished tree reaches the browser.
 *
 *   ./posts/<slug>.md        export default { slug, title, …, body }   the whole post
 *   ./posts/<slug>.md?meta   export default { slug, title, … }         its frontmatter only
 *
 * A post with a problem fails the build (and the unit tests, which load the same modules)
 * with every problem `parsePost` found.
 */

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import type { Plugin } from 'vite';
import { parsePost } from './parse';

const POST_FILE = /[\\/]src[\\/]blog[\\/]posts[\\/][^\\/]+\.md$/;

export function posts(): Plugin {
  return {
    name: 'posts',
    enforce: 'pre',
    load(id) {
      const [file = '', query = ''] = id.split('?');
      if (!POST_FILE.test(file)) return null;
      this.addWatchFile(file);
      const { body, ...meta } = parsePost(readFileSync(file, 'utf8'), basename(file, '.md'));
      const data = new URLSearchParams(query).has('meta') ? meta : { ...meta, body };
      return `export default ${JSON.stringify(data)};`;
    },
  };
}
