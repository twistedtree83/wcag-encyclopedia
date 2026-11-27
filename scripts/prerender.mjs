/**
 * The prerender step (ADR 0001): writes one static HTML page per route.
 *
 * Runs after both Vite builds (see `npm run build`):
 *   - `dist/site.html` is the client template, with hashed asset links and the token CSS;
 *   - `dist-ssr/entry-server.js` renders a route to HTML with React.
 * For each route it fills the template's title, description and app markup, marks `#root`
 * with the route so the client hydrates the same page, rewrites asset links for the page's
 * depth (the site uses relative URLs throughout so it works under any GitHub Pages prefix),
 * and writes `dist/<path>index.html`. Then it removes the template.
 *
 * Plain ESM JavaScript, so it runs on the CI's Node without a TypeScript step.
 */

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const { render, ROUTES } = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href);
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

for (const marker of ['<!--@legacy-redirect-->', '<!--@analytics-->', '<!--@title-->', '<!--@description-->', '<!--@app-->', '<div id="root">']) {
  if (!template.includes(marker)) throw new Error(`prerender: site.html has no ${marker}`);
}

const escape = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

let written = 0;
for (const route of ROUTES) {
  const { html, title, description, head, beacon } = render(route);
  if (!html.includes('<main')) throw new Error(`prerender: ${route.path} rendered no <main>`);

  const depth = route.path.split('/').filter(Boolean).length;
  const prefix = depth ? '../'.repeat(depth) : './';
  const page = template
    .replaceAll('"./assets/', `"${prefix}assets/`)
    .replace('<!--@legacy-redirect-->', () => head)
    .replace('<!--@title-->', escape(title))
    .replace('<!--@description-->', escape(description))
    .replace('<div id="root">', `<div id="root" data-route="${escape(route.path)}">`)
    .replace('<!--@app-->', () => html)
    .replace('<!--@analytics-->', () => beacon);

  const out = join(dist, route.path, 'index.html');
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, page);
  written++;
}

await rm(join(dist, 'site.html'));
console.log(`prerender: wrote ${written} page${written === 1 ? '' : 's'}`);
