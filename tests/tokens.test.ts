import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { contrastRatio, formatRatio, meetsAA, requiredRatio } from '../src/color/contrast';
import { palettes, light, dark, THEMES, TOKEN_PAIRS, type Token } from '../src/theme/tokens';
import { tokensCss } from '../src/theme/css';

/**
 * The token contrast audit.
 *
 * This is the site's central claim — "everything on this page obeys the criteria it
 * documents" — and the only one that rots silently when someone adjusts a colour. Every
 * foreground/background pairing that actually occurs is enumerated in TOKEN_PAIRS and
 * checked in both themes.
 *
 * If this fails, fix the token. Never relax the threshold and never delete the pair.
 */

/**
 * The design guide's measured-contrast table (DESIGN-GUIDE.md §3.4), copied here as the
 * independent source of truth: the pair, the threshold it needs, and the ratio the guide
 * measured in each theme. The audit must cover every row, and the palettes must still produce
 * the ratios the guide promises.
 */
const GUIDE_TABLE: readonly {
  row: string;
  fg: Token;
  bg: Token;
  needs: 4.5 | 3;
  dark: number;
  light: number;
}[] = [
  { row: 'Main text on page', fg: 'ink', bg: 'bg', needs: 4.5, dark: 12.7, light: 15.4 },
  { row: 'Secondary text on page', fg: 'ink-2', bg: 'bg', needs: 4.5, dark: 8.0, light: 7.8 },
  { row: 'Secondary text on panels', fg: 'ink-2', bg: 'deep', needs: 4.5, dark: 9.7, light: 8.7 },
  { row: 'Secondary text on cards', fg: 'ink-2', bg: 'card-bg', needs: 4.5, dark: 7.1, light: 8.7 },
  { row: 'Accent text on page', fg: 'accent-text', bg: 'bg', needs: 4.5, dark: 8.0, light: 6.4 },
  { row: 'Error text on page', fg: 'err-text', bg: 'bg', needs: 4.5, dark: 8.3, light: 6.0 },
  { row: 'Error text on cards', fg: 'err-text', bg: 'card-bg', needs: 4.5, dark: 7.4, light: 6.7 },
  { row: 'Ink on sky', fg: 'on-a', bg: 'a1', needs: 4.5, dark: 9.7, light: 9.7 },
  { row: 'Ink on sun', fg: 'on-a', bg: 'a2', needs: 4.5, dark: 11.7, light: 11.7 },
  { row: 'Ink on rose', fg: 'on-a', bg: 'a3', needs: 4.5, dark: 10.0, light: 10.0 },
  { row: 'Ink on Robust card', fg: 'on-a', bg: 'a4', needs: 4.5, dark: 17.1, light: 13.2 },
  { row: 'Pledge panel text', fg: 'pledge-fg', bg: 'pledge-bg', needs: 4.5, dark: 15.4, light: 15.4 },
  { row: 'Control borders on page', fg: 'line-2', bg: 'bg', needs: 3, dark: 4.2, light: 3.8 },
  { row: 'Control borders on panels', fg: 'line-2', bg: 'deep', needs: 3, dark: 5.0, light: 4.3 },
  { row: 'Control borders on cards', fg: 'line-2', bg: 'card-bg', needs: 3, dark: 3.7, light: 4.3 },
  { row: 'Focus ring on page', fg: 'focus', bg: 'bg', needs: 3, dark: 9.7, light: 15.4 },
  { row: 'Focus ring on panels', fg: 'focus', bg: 'deep', needs: 3, dark: 11.7, light: 17.1 },
];

describe('the token palettes', () => {
  it('defines the same tokens in both themes', () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  it('defines every token as a hex colour', () => {
    for (const theme of THEMES) {
      for (const [token, value] of Object.entries(palettes[theme])) {
        expect(value, `${theme}.${token}`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it('carries no token from the retired palette', () => {
    const retired = ['ink2', 'ink3', 'panel', 'panel2', 'rule', 'rule2', 'link', 'fail', 'pass'];
    for (const name of retired) expect(Object.keys(light), name).not.toContain(name);
    expect(Object.keys(light).filter((k) => /^p\d|wash$/.test(k))).toEqual([]);
  });

  it('audits every declared pair against its threshold, in both themes', () => {
    const failures: string[] = [];

    for (const theme of THEMES) {
      const palette = palettes[theme];
      for (const pair of TOKEN_PAIRS) {
        const fg = palette[pair.fg];
        const bg = palette[pair.bg];
        const ratio = contrastRatio(fg, bg);
        const passes = meetsAA(ratio, pair.kind);
        const shouldPass = (pair.expect ?? 'pass') === 'pass';

        if (shouldPass && !passes) {
          failures.push(
            `${theme}: --${pair.fg} (${fg}) on --${pair.bg} (${bg}) ` +
              `is ${formatRatio(ratio)}, below its ${requiredRatio(pair.kind)}:1 threshold ` +
              `for ${pair.kind} — ${pair.where}`,
          );
        }
        if (!shouldPass && passes) {
          failures.push(
            `${theme}: --${pair.fg} (${fg}) on --${pair.bg} (${bg}) ` +
              `is ${formatRatio(ratio)} and now CLEARS ${requiredRatio(pair.kind)}:1 — ` +
              `it is meant to fail, or the example stops demonstrating anything. ${pair.where}`,
          );
        }
      }
    }

    expect(failures, `\n${failures.join('\n')}\n`).toEqual([]);
  });

  it("checks every pair in the design guide's measured-contrast table at its threshold", () => {
    for (const row of GUIDE_TABLE) {
      const pair = TOKEN_PAIRS.find((p) => p.fg === row.fg && p.bg === row.bg);
      expect(pair, `${row.row} (--${row.fg} on --${row.bg}) is not in TOKEN_PAIRS`).toBeDefined();
      expect(requiredRatio(pair!.kind), `${row.row} is audited at the wrong threshold`).toBe(
        row.needs,
      );
      expect(pair!.expect ?? 'pass', row.row).toBe('pass');
    }
  });

  it('still produces the ratios the design guide measured, in both themes', () => {
    // The guide prints one decimal, sometimes rounded and sometimes truncated, so allow the
    // difference between the two. Anything more means the palette drifted from the design.
    const drift: string[] = [];
    for (const row of GUIDE_TABLE) {
      for (const theme of THEMES) {
        const ratio = contrastRatio(palettes[theme][row.fg], palettes[theme][row.bg]);
        if (Math.abs(ratio - row[theme]) > 0.06) {
          drift.push(`${theme}: ${row.row} is ${ratio.toFixed(2)}:1, the guide says ${row[theme]}:1`);
        }
      }
    }
    expect(drift, `\n${drift.join('\n')}\n`).toEqual([]);
  });

  it('keeps the tightest pair — control borders on dark cards — at 3.7:1', () => {
    const ratio = contrastRatio(dark['line-2'], dark['card-bg']);
    expect(formatRatio(ratio)).toBe('3.7:1');
  });

  it('covers every surface for every ink level, so no prose pairing is untested', () => {
    for (const ink of ['ink', 'ink-2'] as const) {
      for (const surface of ['bg', 'deep', 'raise', 'card-bg'] as const) {
        const covered = TOKEN_PAIRS.some((p) => p.fg === ink && p.bg === surface);
        expect(covered, `--${ink} on --${surface} is not in TOKEN_PAIRS`).toBe(true);
      }
    }
  });

  it('names no pair twice', () => {
    const keys = TOKEN_PAIRS.map((p) => `${p.fg}/${p.bg}`);
    expect(keys.length).toBe(new Set(keys).size);
  });
});

describe('the emitted token CSS', () => {
  it('declares every token as a custom property for both themes', () => {
    const css = tokensCss();
    for (const token of Object.keys(light) as Token[]) {
      expect(css).toContain(`--${token}: ${light[token]}`);
      expect(css).toContain(`--${token}: ${dark[token]}`);
    }
  });

  it('lets an explicit light choice win over a dark OS setting', () => {
    // Without the guard, a reader on a dark OS who picks light gets dark anyway.
    expect(tokensCss()).toContain(':root:not([data-theme="light"])');
  });

  it('lets an explicit dark choice win over a light OS setting', () => {
    expect(tokensCss()).toContain(':root[data-theme="dark"]');
  });
});

describe('the stylesheets do not defeat their own audit', () => {
  const sheets = readdirSync('src/styles')
    .filter((f) => f.endsWith('.css'))
    .map((f) => ({ file: f, css: readFileSync(`src/styles/${f}`, 'utf8') }));

  it('never fade text with opacity', () => {
    // Opacity composites a token against its background, so the pair the audit measured is
    // not the pair that ships. A badge here measured 5.6:1 by token and 4.36:1 on screen.
    for (const { file, css } of sheets) {
      const declarations = css.match(/^\s*opacity:\s*[\d.]+/gm) ?? [];
      expect(declarations, `${file}: remove ${declarations.join(', ')}`).toEqual([]);
    }
  });

  it('write no literal hex colour in the site stylesheet, so every pairing can be audited', () => {
    // examples.css depicts other products and is audited through its own ex-* tokens.
    const swatch = readFileSync('src/styles/swatch.css', 'utf8');
    const literals = swatch.match(/:\s*[^;{}]*#[0-9a-f]{3,8}\b/gi) ?? [];
    expect(literals, 'swatch.css: use a token from tokens.ts').toEqual([]);
  });

  it('audits the pair tiles’ Passes/Fails badge', () => {
    expect(TOKEN_PAIRS.some((p) => p.fg === 'tag-fg' && p.bg === 'tag-bg')).toBe(true);
  });

  it('use no colour token that tokens.ts does not define', () => {
    const known = new Set<string>(Object.keys(light));
    for (const { file, css } of sheets) {
      // Colour properties only: non-colour custom properties (type, spacing) live in CSS.
      const used = [...css.matchAll(/(?:color|background|border[a-z-]*|outline|fill|stroke|box-shadow|text-decoration[a-z-]*)\s*:[^;]*?var\(--([a-z0-9-]+)\)/g)]
        .map((m) => m[1]!)
        .filter((name) => !/^(fh|fb|rad|bwid|gut|pad|gap|sp|lift|speed|loop-w|loop-dash)/.test(name));
      const unknown = [...new Set(used.filter((name) => !known.has(name)))];
      expect(unknown, `${file} uses undefined colour tokens`).toEqual([]);
    }
  });
});
