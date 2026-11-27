import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES } from '../src/site/routes';

/**
 * The web fonts are self-hosted (docs/CONVENTIONS.md, "Tokens and CSS"): no page asks a third
 * party for anything, so a reader's visit is never reported to a font CDN, and layout in tests
 * never waits on the network. This reads the built site in dist/, like e2e/retired.spec.ts.
 */

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const sheets = () => readdirSync(join(DIST, 'assets')).filter((f) => f.endsWith('.css'));

test.describe('self-hosted fonts', () => {
  test('no built page or stylesheet references a font CDN', () => {
    const files = [
      ...ROUTES.map((r) => join(r.path, 'index.html')),
      ...sheets().map((s) => join('assets', s)),
    ];
    for (const file of files) {
      const text = readFileSync(join(DIST, file), 'utf8');
      for (const host of FONT_HOSTS) {
        expect(text.includes(host), `${file} references ${host}`).toBe(false);
      }
    }
  });

  test('every page preloads the body and heading faces it ships', () => {
    const assets = readdirSync(join(DIST, 'assets'));
    for (const route of ROUTES) {
      const html = readFileSync(join(DIST, route.path, 'index.html'), 'utf8');
      const preloads = [
        ...html.matchAll(/<link rel="preload" href="([^"]+)" as="font" type="font\/woff2" crossorigin/g),
      ].map((m) => m[1]!.split('/').pop()!);
      expect(
        preloads.map((file) => file.replace(/-[\w-]{8}\.woff2$/, '')),
        `/${route.path}`,
      ).toEqual(['onest-latin-400-normal', 'figtree-latin-800-normal']);
      for (const file of preloads) expect(assets, `/${route.path} preloads ${file}`).toContain(file);
    }
  });

  test('every @font-face is Figtree or Onest, swaps, and loads from the site', () => {
    const faces = sheets().flatMap((s) =>
      [...readFileSync(join(DIST, 'assets', s), 'utf8').matchAll(/@font-face\{([^}]*)\}/g)].map(
        (m) => m[1]!,
      ),
    );
    expect(faces.length).toBeGreaterThan(0);
    const families = new Set<string>();
    for (const face of faces) {
      families.add(/font-family:\s*['"]?([^;'"]+)/.exec(face)![1]!);
      expect(face).toContain('font-display:swap');
      for (const url of face.matchAll(/url\(([^)]+)\)/g)) {
        expect(url[1]!, face).toMatch(/^\.\/[\w-]+\.woff2?$/);
      }
    }
    expect([...families].sort()).toEqual(['Figtree', 'Onest']);
  });
});
