/// <reference types="vite/client" />
/**
 * The slug of every post: one per Markdown file in `./posts/`, so adding a post is adding a
 * file and no list is edited (ADR 0004's reason, ADR 0007). The route table builds the post
 * pages from this.
 *
 * Under Vite (the builds and the unit tests) the glob is expanded when the file is compiled.
 * The e2e specs import the route table without Vite, where `import.meta.glob` does not exist,
 * so there the folder is read from disk instead. Both give the same list.
 */

const name = (file: string) => file.replace(/^.*\//, '').replace(/\.md$/, '');

function postFiles(): string[] {
  try {
    return Object.keys(import.meta.glob('./posts/*.md', { query: '?meta', eager: true }));
  } catch {
    // Node without Vite (Playwright). getBuiltinModule needs no import, so nothing Node-only
    // is bundled for the browser, where this branch never runs.
    const fs = process.getBuiltinModule('node:fs');
    const dir = new URL('./posts/', import.meta.url);
    return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : [];
  }
}

export const POST_SLUGS: readonly string[] = postFiles().map(name).sort();
