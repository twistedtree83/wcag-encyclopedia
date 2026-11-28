/**
 * The prerender step (ADR 0001): writes one static HTML page per route.
 *
 * Runs after both Vite builds (see `npm run build`):
 *   - `dist/site.html` is the client template, with hashed asset links and the token CSS;
 *   - `dist-ssr/entry-server.js` renders a route to HTML with React.
 * For each route it fills the template's title, description and app markup, marks `#root`
 * with the route so the client hydrates the same page, rewrites asset links for the page's
 * depth (the site uses relative URLs throughout so it works under any GitHub Pages prefix),
 * and writes `dist/<path>index.html`. Each page gets its canonical tag, checked against ADR 0006,
 * and its JSON-LD (src/site/jsonLd.ts), dated from the git history and checked the same way,
 * and its Open Graph and Twitter tags (src/site/share.ts), checked by `openGraphProblems`. Then it
 * draws the share cards into `dist/share/`. The 404 page is written once more, to `dist/404.html`,
 * with root-absolute asset links and no canonical tag, JSON-LD or share tags.
 * Then it writes the blog's Atom feed, `dist/blog/feed.xml` (src/blog/feed.tsx), checked by
 * `feedProblems`. Then it writes the crawl files, `dist/robots.txt` and `dist/sitemap.xml` (src/site/crawl.ts),
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

const {
  render,
  ROUTES,
  NOT_FOUND,
  NOINDEX,
  FEED_PATH,
  blogFeed,
  feedProblems,
  canonicalTag,
  canonicalProblems,
  openGraphProblems,
  structuredData,
  jsonLdProblems,
  pageSources,
  robotsTxt,
  sitemapXml,
  sitemapProblems,
  CARD_FONTS,
  CARD_HEIGHT,
  CARD_WIDTH,
  cardContrastProblems,
  shareCard,
  toSatori,
} = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href);
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

for (const marker of ['<!--@legacy-redirect-->', '<!--@canonical-->', '<!--@structured-data-->', '<!--@share-->', '<!--@analytics-->', '<!--@title-->', '<!--@description-->', '<!--@app-->', '<div id="root">']) {
  if (!template.includes(marker)) throw new Error(`prerender: site.html has no ${marker}`);
}

const escape = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/**
 * One page's HTML. `prefix` is how its asset links start; `canonical` and `jsonLd` are its
 * canonical tag and JSON-LD (both empty for the 404 page, which is not indexed).
 */
function pageHtml(route, prefix, { canonical, jsonLd }) {
  const { html, title, description, head, beacon, share } = render(route);
  if (!html.includes('<main')) throw new Error(`prerender: ${route.path} rendered no <main>`);
  return template
    .replaceAll('"./assets/', `"${prefix}assets/`)
    .replace('<!--@legacy-redirect-->', () => head)
    .replace('<!--@canonical-->', () => canonical)
    .replace('<!--@structured-data-->', () => jsonLd)
    .replace('<!--@share-->', () => share)
    .replace('<!--@title-->', escape(title))
    .replace('<!--@description-->', escape(description))
    .replace('<div id="root">', `<div id="root" data-route="${escape(route.path)}">`)
    .replace('<!--@app-->', () => html)
    .replace('<!--@analytics-->', () => beacon);
}

let written = 0;
/** Each page's last-changed date: its sitemap `lastmod` and its JSON-LD `dateModified`. */
const lastmods = new Map();
for (const route of ROUTES) {
  const sources = pageSources(route);
  const modified = lastCommitDate(sources);
  lastmods.set(route.path, modified);
  const jsonLd = structuredData(route, { published: firstCommitDate(sources), modified });

  const depth = route.path.split('/').filter(Boolean).length;
  const page = pageHtml(route, depth ? '../'.repeat(depth) : './', { canonical: canonicalTag(route.path), jsonLd });

  const wrong = [...canonicalProblems(page, route.path), ...openGraphProblems(page, route.path)];
  if (wrong.length) throw new Error(`prerender: ${route.path || 'home'}: ${wrong.join('; ')}`);
  const badJsonLd = jsonLdProblems(page, route);
  if (badJsonLd.length) throw new Error(`prerender: ${route.path || 'home'} JSON-LD: ${badJsonLd.join('; ')}`);

  const out = join(dist, route.path, 'index.html');
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, page);
  written++;
}

// The 404 page (S-05): Cloudflare serves dist/404.html for any path that matches no asset, at
// that path's depth, so its asset links start at the root. Not a route, so not in the sitemap.
// It has no address of its own, so no canonical tag, JSON-LD or share tags.
const notFound = pageHtml(NOT_FOUND, '/', { canonical: '', jsonLd: '' });
if (!notFound.includes(NOINDEX)) throw new Error('prerender: 404.html is not noindex');
if (/rel="canonical"/.test(notFound)) throw new Error('prerender: 404.html has a canonical tag');
if (/application\/ld\+json|property="og:|name="twitter:/.test(notFound)) throw new Error('prerender: 404.html has JSON-LD or share tags');
if (/(href|src)="\.\.?\//.test(notFound)) throw new Error('prerender: 404.html has a relative link, which breaks below the root');
await writeFile(join(dist, NOT_FOUND.path), notFound);

/**
 * The share cards (src/site/share.ts): one PNG per criterion page and one site card, drawn
 * with satori (to SVG) and resvg (to PNG). Both are dev dependencies imported only here, so
 * neither reaches the client bundle. A card whose text fails the contrast check fails the build.
 */
const { default: satori } = await import('satori');
const { Resvg } = await import('@resvg/resvg-js');
const fonts = await Promise.all(
  CARD_FONTS.map(async ({ name, weight, file }) => ({
    name,
    weight,
    style: 'normal',
    data: await readFile(join(root, 'node_modules/@fontsource', file)),
  })),
);
const cards = new Map(ROUTES.map((route) => shareCard(route)).map((card) => [card.file, card]));
for (const card of cards.values()) {
  const low = cardContrastProblems(card.tree);
  if (low.length) throw new Error(`prerender: ${card.file}: ${low.join('; ')}`);
  const svg = await satori(toSatori(card.tree), { width: CARD_WIDTH, height: CARD_HEIGHT, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: CARD_WIDTH } }).render().asPng();
  const out = join(dist, card.file);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, png);
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

/**
 * The UTC date of the first commit that touched any of `files`: a page's `datePublished` in
 * its structured data. A guideline file is older than a criterion added to it later, so this
 * dates a criterion page from its guideline file; no commit yet counts as today.
 */
function firstCommitDate(files) {
  const all = execFileSync('git', ['log', '--reverse', '--format=%cI', '--', ...files], { cwd: root, encoding: 'utf8' }).trim();
  return new Date(all.split('\n')[0] || Date.now()).toISOString().slice(0, 10);
}

// The blog feed (S-09): every post in full. With no posts yet it is dated by the blog index.
const feed = blogFeed(lastmods.get('blog/'));
const badFeed = feedProblems(feed);
if (badFeed.length) throw new Error(`prerender: ${FEED_PATH}: ${badFeed.join('; ')}`);
await writeFile(join(dist, FEED_PATH), feed);

const sitemap = sitemapXml(ROUTES.map((route) => ({ path: route.path, lastmod: lastmods.get(route.path) })));
const invalid = sitemapProblems(sitemap);
if (invalid.length) throw new Error(`prerender: sitemap.xml: ${invalid.join('; ')}`);
await writeFile(join(dist, 'sitemap.xml'), sitemap);
await writeFile(join(dist, 'robots.txt'), robotsTxt());

await rm(join(dist, 'site.html'));
console.log(`prerender: wrote ${written} page${written === 1 ? '' : 's'}, ${cards.size} share cards, 404.html, ${FEED_PATH}, robots.txt and sitemap.xml`);
