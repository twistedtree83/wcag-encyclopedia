import { describe, it, expect } from 'vitest';
import { contrastRatio, formatRatio, meetsAA, requiredRatio } from '../src/color/contrast';
import { palettes, light, dark, THEMES, TOKEN_PAIRS } from '../src/theme/tokens';
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

  it('audits every declared pair against its Level AA threshold, in both themes', () => {
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
              `is ${formatRatio(ratio)}, needs ${requiredRatio(pair.kind)}:1 ` +
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

  it('covers both surfaces for every ink level, so no prose pairing is untested', () => {
    for (const ink of ['ink', 'ink2', 'ink3'] as const) {
      for (const surface of ['bg', 'panel', 'panel2'] as const) {
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
    for (const token of Object.keys(light)) {
      expect(css).toContain(`--${token}: ${light[token as keyof typeof light]}`);
      expect(css).toContain(`--${token}: ${dark[token as keyof typeof dark]}`);
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

describe('the stylesheet does not defeat its own audit', () => {
  it('never fades text with opacity', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync('src/styles/global.css', 'utf8');
    // Opacity composites a token against its background, so the pair the audit measured is
    // not the pair that ships. A badge here measured 5.6:1 by token and 4.36:1 on screen.
    const declarations = css.match(/^\s*opacity:\s*[\d.]+/gm) ?? [];
    expect(declarations, `remove: ${declarations.join(', ')}`).toEqual([]);
  });
});
