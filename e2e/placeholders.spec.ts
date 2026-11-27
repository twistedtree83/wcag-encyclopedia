import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES } from '../src/site/routes';

/**
 * No built page ships a placeholder. This reads every page in dist/, like e2e/retired.spec.ts,
 * so a stub from any source file fails here.
 *
 * Lab mocks legitimately show made-up addresses such as "you@example.com" or "shop.example" as
 * text, so example domains fail only as a link target, never as displayed text.
 */

const DIST = fileURLToPath(new URL('../dist', import.meta.url));

/** Words that mark unfinished copy, anywhere in the HTML. */
const PLACEHOLDER_WORDS = /\bTODO\b|\bTBD\b|[Ll][Oo][Rr][Ee][Mm] [Ii][Pp][Ss][Uu][Mm]/;

/** An href whose host is, or is under, a reserved example domain. */
const EXAMPLE_HREF = /\shref="(?:[a-z]+:)?(?:\/\/)?(?:[^"/]*[@.])?example\.(?:com|org|net)(?:[/:?#"])/gi;

function placeholdersIn(html: string): string[] {
  const found: string[] = [];
  const word = PLACEHOLDER_WORDS.exec(html);
  if (word) found.push(html.slice(Math.max(0, word.index - 40), word.index + 40));
  for (const m of html.matchAll(EXAMPLE_HREF)) found.push(m[0].trim());
  return found;
}

test.describe('placeholders', () => {
  test('the scan catches each kind, and spares example domains shown as text', () => {
    expect(placeholdersIn('<p>TODO: write this</p>')).toHaveLength(1);
    expect(placeholdersIn('<a href="TODO-feedback">Report</a>')).toHaveLength(1);
    expect(placeholdersIn('<p>Status: TBD</p>')).toHaveLength(1);
    expect(placeholdersIn('<p>Lorem ipsum dolor sit amet</p>')).toHaveLength(1);
    expect(placeholdersIn('<a href="https://example.com/">x</a>')).toHaveLength(1);
    expect(placeholdersIn('<a href="https://www.example.org">x</a>')).toHaveLength(1);
    expect(placeholdersIn('<a class="x" href="mailto:help@example.com">x</a>')).toHaveLength(1);
    expect(placeholdersIn('<span>you@example.com</span><span>shop.example</span>')).toEqual([]);
    expect(placeholdersIn('<a href="https://notexample.com/">x</a>')).toEqual([]);
    expect(placeholdersIn('<p>Today’s todo list is done.</p>')).toEqual([]);
  });

  test('none in any built page', () => {
    for (const route of ROUTES) {
      const html = readFileSync(join(DIST, route.path, 'index.html'), 'utf8');
      expect(placeholdersIn(html), `/${route.path}`).toEqual([]);
    }
  });
});
