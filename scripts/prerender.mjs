/**
 * The prerender step (ADR 0001): writes one static HTML page per route.
 *
 * Runs after both Vite builds (see `npm run build`):
 *   - `dist/site.html` is the client template, with hashed asset links and the token CSS;
 *   - `dist-ssr/entry-server.js` renders a route to HTML with React.
 * For each route it fills the template's title, description and app markup, marks `#root`
 * with the route so the client hydrates the same page, rewrites asset links for the page's
 * depth (the site uses relative URLs throughout so it works under any GitHub Pages prefix),
 * and writes `dist/<path>index.html`. Each page gets its canonical tag, checked against ADR 0006.
 * Then it writes the crawl files, `dist/robots.txt` and `dist/sitemap.xml` (src/site/crawl.ts),
 * with each page's `lastmod` the last commit date of the files it is built from, and removes
 * the template.
 *
 * Plain ESM JavaScript, so it runs on the CI's Node without a TypeScript step.
 */

import { execFileSync } from 'node:child_process';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const { render, ROUTES, canonicalTag, canonicalProblems, pageSources, robotsTxt, sitemapXml, sitemapProblems } = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href);
const raw = await readFile(join(dist, 'site.html'), 'utf8');

// Preload the two self-hosted faces every page shows above the fold: body text (Onest 400) and
// the h1 (Figtree 800). Vite hashes the file names, so find them in the built assets.
const PRELOADED_FONTS = ['onest-latin-400-normal', 'figtree-latin-800-normal'];
const assets = await readdir(join(dist, 'assets'));
const preloads = PRELOADED_FONTS.map((face) => {
  const file = assets.find((name) => name.startsWith(`${face}-`) && name.endsWith('.woff2'));
  if (!file) throw new Error(`prerender: no ${face} woff2 in dist/assets`);
  return `<link rel="preload" href="./assets/${file}" as="font" type="font/woff2" crossorigin />`;
}).join('\n    ');
if (!raw.includes('<!--@fonts-->')) throw new Error('prerender: site.html has no <!--@fonts-->');
const template = raw.replace('<!--@fonts-->', () => preloads);

for (const marker of ['<!--@legacy-redirect-->', '<!--@canonical-->', '<!--@title-->', '<!--@description-->', '<!--@app-->', '<div id="root">']) {
  if (!template.includes(marker)) throw new Error(`prerender: site.html has no ${marker}`);
}

const escape = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

let written = 0;
for (const route of ROUTES) {
  const { html, title, description, head } = render(route);
  if (!html.includes('<main')) throw new Error(`prerender: ${route.path} rendered no <main>`);

  const depth = route.path.split('/').filter(Boolean).length;
  const prefix = depth ? '../'.repeat(depth) : './';
  const page = template
    .replaceAll('"./assets/', `"${prefix}assets/`)
    .replace('<!--@legacy-redirect-->', () => head)
    .replace('<!--@canonical-->', () => canonicalTag(route.path))
    .replace('<!--@title-->', escape(title))
    .replace('<!--@description-->', escape(description))
    .replace('<div id="root">', `<div id="root" data-route="${escape(route.path)}">`)
    .replace('<!--@app-->', () => html);

  const wrong = canonicalProblems(page, route.path);
  if (wrong.length) throw new Error(`prerender: ${route.path || 'home'}: ${wrong.join('; ')}`);

  const out = join(dist, route.path, 'index.html');
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, page);
  written++;
}

/**
 * The UTC date of the last commit that touched any of `files`. A file with no commit yet (a
 * new page before its first commit) counts as changed today. CI checks out the full history
 * (`fetch-depth: 0` in verify.yml); a shallow clone would date every page to its one commit.
 */
function lastCommitDate(files) {
  const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...files], { cwd: root, encoding: 'utf8' }).trim();
  return new Date(iso || Date.now()).toISOString().slice(0, 10);
}

const sitemap = sitemapXml(ROUTES.map((route) => ({ path: route.path, lastmod: lastCommitDate(pageSources(route)) })));
const invalid = sitemapProblems(sitemap);
if (invalid.length) throw new Error(`prerender: sitemap.xml: ${invalid.join('; ')}`);
await writeFile(join(dist, 'sitemap.xml'), sitemap);
await writeFile(join(dist, 'robots.txt'), robotsTxt());

await rm(join(dist, 'site.html'));
console.log(`prerender: wrote ${written} page${written === 1 ? '' : 's'}, robots.txt and sitemap.xml`);
