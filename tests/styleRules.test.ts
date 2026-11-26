import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';

/**
 * The mechanical style rules.
 *
 * Each rule here is stated in prose in docs/CONVENTIONS.md or design guide §7, and each is the
 * kind a reviewer misses because it is one line in a large diff. If one fails, fix the code.
 * An exception goes in the explicit lists below, with its reason, and in the guide or
 * CONVENTIONS too.
 */

function walk(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path, ext);
    return ext.test(name) ? [path] : [];
  });
}

const sheets = readdirSync('src/styles')
  .filter((f) => f.endsWith('.css'))
  .map((f) => ({ file: f, root: postcss.parse(readFileSync(`src/styles/${f}`, 'utf8')) }));

/** Each declaration of `props` as `file selector { prop: value }`, with its rule's selector. */
function declarations(props: RegExp) {
  const found: { file: string; selector: string; prop: string; value: string }[] = [];
  for (const { file, root } of sheets) {
    root.walkDecls(props, (decl) => {
      const parent = decl.parent;
      const selector = parent && parent.type === 'rule' ? (parent as postcss.Rule).selector : '';
      found.push({ file, selector: selector.replace(/\s+/g, ' '), prop: decl.prop, value: decl.value });
    });
  }
  return found;
}

/** Splits on commas that are not inside parentheses. */
function topLevelList(value: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(current.trim());
      current = '';
    } else current += ch;
  }
  out.push(current.trim());
  return out.filter(Boolean);
}

describe('motion (design guide §7)', () => {
  // "Only opacity, transform and colour animate."
  const ALLOWED = new Set([
    'none',
    'opacity',
    'transform',
    'color',
    'background-color',
    'border-color',
    'outline-color',
    'fill',
    'stroke',
  ]);

  // The two transitions §7 names as predating the rule. Nothing else joins this list.
  const GRANDFATHERED: readonly { selector: string; prop: string; reason: string }[] = [
    { selector: '.scale__fill', prop: 'width', reason: "§7: the fade lab's scale fill" },
    { selector: '.prev', prop: 'filter', reason: "§7: the colour preview's greyscale filter" },
  ];

  it('transitions only opacity, transform and colour properties', () => {
    const bad: string[] = [];
    for (const d of declarations(/^transition(-property)?$/)) {
      const names = topLevelList(d.value).map((layer) => layer.split(/\s+/)[0]!);
      for (const name of names) {
        if (ALLOWED.has(name)) continue;
        if (GRANDFATHERED.some((g) => g.selector === d.selector && g.prop === name)) continue;
        bad.push(`${d.file}: ${d.selector} { ${d.prop}: ${d.value} } animates ${name}`);
      }
    }
    expect(bad, `\n${bad.join('\n')}\n`).toEqual([]);
  });
});

describe('fonts', () => {
  // The one monospace stack, used for code in the site and in examples.
  const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

  // Depictions that must not use the site's fonts, each with its reason.
  const EXCEPTIONS: readonly { selector: string; reason: string }[] = [
    {
      selector: '.ncard',
      reason: 'the 1.4.12 notice card is measured, so it uses the system font no late web font can change',
    },
    {
      selector: '.reader-colours--on, .reader-colours--on *',
      reason: "depicts the reader's own user stylesheet, which brings its own font",
    },
  ];

  it('sets every font-family from --fh or --fb, or the monospace stack', () => {
    const bad: string[] = [];
    for (const d of declarations(/^font-family$/)) {
      const value = d.value.replace(/\s*!important$/, '');
      if (/^var\(--f[hb]\)(, [\w-]+)*$/.test(value)) continue;
      if (value === MONO) continue;
      if (EXCEPTIONS.some((e) => e.selector === d.selector)) continue;
      bad.push(`${d.file}: ${d.selector} { font-family: ${d.value} }`);
    }
    expect(bad, `\n${bad.join('\n')}\n`).toEqual([]);
  });
});

describe('swatch.css layout', () => {
  it('adds every component section before "Breakpoints"', () => {
    const lines = readFileSync('src/styles/swatch.css', 'utf8').split('\n');
    const breakpoints = lines.findIndex((l) => /^\/\* --- Breakpoints\b/.test(l));
    expect(breakpoints, 'swatch.css has no "Breakpoints" section').toBeGreaterThan(0);
    const after = lines
      .slice(breakpoints + 1)
      .filter((l) => /^\/\* --- /.test(l))
      .map((l) => l.trim());
    expect(after, 'move these sections above "Breakpoints"').toEqual([]);
  });
});

describe('e2e axe scans', () => {
  it('exclude only [data-depicts-failure]', () => {
    const bad: string[] = [];
    for (const file of walk('e2e', /\.ts$/)) {
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/\.exclude\(([^)]*)\)/g)) {
        if (m[1]!.trim() !== "'[data-depicts-failure]'") bad.push(`${file}: .exclude(${m[1]})`);
      }
    }
    expect(bad, `\n${bad.join('\n')}\n`).toEqual([]);
  });
});

describe('wording', () => {
  // CONVENTIONS: never call a threshold or a criterion a "rule" in code, class names or copy.
  // "Rule" is fine only where something else's rules are meant, named by the word before it.
  const QUALIFIERS = /\b(pronunciation|naming|role|format|HTML|English|CSS)\s+rules?\b/gi;

  it('never calls a criterion or a threshold a "rule" in labs or criterion records', () => {
    const bad: string[] = [];
    for (const file of [...walk('src/labs', /\.tsx?$/), ...walk('src/criteria', /\.tsx?$/)]) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (/\brules?\b/i.test(line.replace(QUALIFIERS, ''))) bad.push(`${file}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(bad, `\n${bad.join('\n')}\n`).toEqual([]);
  });
});
