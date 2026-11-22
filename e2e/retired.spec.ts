import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES } from '../src/site/routes';

/**
 * The redesign retired the single long page (ADR 0001). This reads the built site itself,
 * every page and every stylesheet in dist/, so a retired part coming back through any route
 * fails here, whatever source file it came from. tests/retired.test.ts guards the source.
 */

const DIST = fileURLToPath(new URL('../dist', import.meta.url));

/** Markup only the retired parts wrote. */
const RETIRED_MARKUP = [
  'class="rail', // the rail
  'class="strip', // the "You are in" strip
  'You are in',
  'class="drawer', // the mobile drawer
  'class="nav-toggle',
  'class="opener', // principle openers
  'howto-heading', // "how to read a card"
  'class="preview', // the viewport preview
  'viewport-picker',
  'library-heading', // the demo library index
  'class="library',
  'class="masthead',
  'Newsreader', // the old fonts
  'Public+Sans',
  'IBM+Plex+Mono',
];

/** Selectors and fonts only the retired stylesheet had. */
const RETIRED_CSS = [
  '.rail',
  '.strip__',
  '.drawer',
  '.opener',
  '.howto',
  '.preview-bar',
  '.viewport-picker',
  '.library__',
  '.masthead',
  '@container preview',
  'container-name:preview',
  'Newsreader', // the old fonts
  'Public Sans',
  'IBM Plex Mono',
];

test.describe('the retired single page', () => {
  test('is in no built page', () => {
    for (const route of ROUTES) {
      const html = readFileSync(join(DIST, route.path, 'index.html'), 'utf8');
      for (const marker of RETIRED_MARKUP) {
        expect(html.includes(marker), `/${route.path} contains ${marker}`).toBe(false);
      }
    }
  });

  test('is in no built stylesheet', () => {
    const sheets = readdirSync(join(DIST, 'assets')).filter((f) => f.endsWith('.css'));
    expect(sheets.length).toBeGreaterThan(0);
    for (const sheet of sheets) {
      const css = readFileSync(join(DIST, 'assets', sheet), 'utf8').replace(/\s+/g, '');
      for (const marker of RETIRED_CSS) {
        expect(css.includes(marker.replace(/\s+/g, '')), `${sheet} contains ${marker}`).toBe(false);
      }
    }
  });
});
