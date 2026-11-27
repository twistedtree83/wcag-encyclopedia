import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Every e2e spec opens pages through `e2e/support/open.ts`, which also waits for the web fonts.
 * A spec that waits for `data-hydrated` itself skips that wait, and its geometry checks measure
 * fallback-font layout on some runs and not others.
 */

const E2E = fileURLToPath(new URL('../e2e', import.meta.url));
const HELPER = 'support/open.ts';

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return entry.name.endsWith('.ts') ? [path] : [];
  });
}

/** The argument text of each `waitForFunction(` call, up to its closing `)`. */
export function waitForFunctionCalls(source: string): string[] {
  const calls: string[] = [];
  for (let at = source.indexOf('waitForFunction('); at !== -1; at = source.indexOf('waitForFunction(', at + 1)) {
    let depth = 0;
    let end = at + 'waitForFunction'.length;
    for (; end < source.length; end++) {
      if (source[end] === '(') depth++;
      else if (source[end] === ')' && --depth === 0) break;
    }
    calls.push(source.slice(at, end + 1));
  }
  return calls;
}

describe('the shared e2e page opener', () => {
  it('finds a hydration wait however it is written', () => {
    const src = "await page.waitForFunction(() => (document.documentElement.dataset.hydrated === 'true'));";
    expect(waitForFunctionCalls(src).some((c) => c.includes('hydrated'))).toBe(true);
    expect(waitForFunctionCalls('page.waitForFunction(() => window.ok)')).toEqual([
      'waitForFunction(() => window.ok)',
    ]);
  });

  it('is the only e2e file that waits for hydration itself', () => {
    const all = files(E2E).map((f) => relative(E2E, f));
    expect(all).toContain(HELPER);
    const offenders = all.filter(
      (f) =>
        f !== HELPER &&
        waitForFunctionCalls(readFileSync(join(E2E, f), 'utf8')).some((c) => c.includes('hydrated')),
    );
    expect(offenders, 'use open() or whenReady() from e2e/support/open.ts').toEqual([]);
  });
});
