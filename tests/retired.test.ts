import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/**
 * The redesign retired the single long page (ADR 0001): the rail, the "You are in" strip, the
 * drawer, principle openers, "how to read a card", the viewport preview, the demo library and
 * the old palette and fonts. The site is now the pre-rendered pages and nothing else.
 *
 * So every module and stylesheet under src/ must be reachable from what the build runs:
 * entry-server (the prerender), entry-client (hydration) and vite.config (token injection).
 * A file only the old page used would show up here as unreachable.
 */

const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, 'src');
const ENTRIES = ['src/entry-server.tsx', 'src/entry-client.tsx', 'vite.config.ts'];
const SOURCE = /\.(tsx?|css)$/;

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : SOURCE.test(name) ? [path] : [];
  });
}

function resolveImport(from: string, spec: string): string | undefined {
  const base = resolve(dirname(from), spec);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
}

function reachable(): Set<string> {
  const seen = new Set<string>();
  const queue = ENTRIES.map((e) => join(ROOT, e));
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    if (file.endsWith('.css')) continue;
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/(?:from\s+|import\s*\(?\s*)'(\.[^']+)'/g)) {
      const target = resolveImport(file, m[1]!);
      if (target) queue.push(target);
    }
  }
  return seen;
}

describe('the retired single page', () => {
  it('leaves no module or stylesheet under src/ that the built site does not use', () => {
    const used = reachable();
    const orphans = filesUnder(SRC)
      .filter((f) => !used.has(f))
      .map((f) => relative(ROOT, f));
    expect(orphans).toEqual([]);
  });

  it('has no page template of its own', () => {
    expect(existsSync(join(ROOT, 'index.html'))).toBe(false);
  });
});
