import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_ORIGIN } from '../src/site/config';
import { openGraphProblems } from '../src/site/crawl';
import { ROUTES } from '../src/site/routes';

/**
 * The share tags and share cards in the built site (S-03), read from dist/ like
 * e2e/crawl.spec.ts. tests/share.test.ts shows each check fails on a bad input.
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const page = (route: { path: string }) => readFileSync(join(DIST, route.path, 'index.html'), 'utf8');

/** A PNG's size from its IHDR chunk: the signature, then the chunk's length and type, then width and height. */
function pngSize(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);
  expect(bytes.subarray(1, 4).toString('latin1'), `${file} is a PNG`).toBe('PNG');
  expect(bytes.subarray(12, 16).toString('latin1')).toBe('IHDR');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test.describe('share cards', () => {
  test('every built page passes the Open Graph check', () => {
    for (const route of ROUTES) {
      expect(openGraphProblems(page(route), route.path), route.path || 'home').toEqual([]);
    }
  });

  test("every page's og:image is a 1200×630 PNG in dist/", () => {
    for (const route of ROUTES) {
      const image = /<meta property="og:image" content="([^"]+)"/.exec(page(route))?.[1] ?? '';
      expect(image.startsWith(`${SITE_ORIGIN}/`), image).toBe(true);
      expect(pngSize(join(DIST, image.slice(SITE_ORIGIN.length + 1))), image).toEqual({ width: 1200, height: 630 });
    }
  });

  test('the card renderer stays out of the client: no runtime dependency, nothing in the bundle', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { dependencies: Record<string, string> };
    expect(Object.keys(pkg.dependencies)).not.toContain('satori');
    expect(Object.keys(pkg.dependencies)).not.toContain('@resvg/resvg-js');
    const scripts = readdirSync(join(DIST, 'assets')).filter((name) => name.endsWith('.js'));
    expect(scripts.length).toBeGreaterThan(0);
    for (const name of scripts) {
      const js = readFileSync(join(DIST, 'assets', name), 'utf8');
      for (const marker of ['satori', 'resvg', 'og:image', 'Share card:']) {
        expect(js.includes(marker), `${name} contains ${marker}`).toBe(false);
      }
    }
  });
});
