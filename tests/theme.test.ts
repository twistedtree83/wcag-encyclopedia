import { describe, it, expect } from 'vitest';
import { resolveTheme, readChoice, THEME_STORAGE_KEY } from '../src/theme/useTheme';

/**
 * Theme resolution. One rule, and the one people get wrong.
 */
describe('resolveTheme', () => {
  it('follows the OS when the reader has expressed no preference', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });

  it('lets an explicit dark choice win over a light OS', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('lets an explicit light choice win over a dark OS', () => {
    // The common bug: treating the stored value as a dark-only override and ignoring 'light'.
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('falls back to the OS when storage holds something unrecognised', () => {
    expect(resolveTheme(readChoice('purple'), true)).toBe('dark');
    expect(resolveTheme(readChoice(''), false)).toBe('light');
  });
});

describe('readChoice', () => {
  it('accepts only the two themes', () => {
    expect(readChoice('light')).toBe('light');
    expect(readChoice('dark')).toBe('dark');
    expect(readChoice('DARK')).toBeNull();
    expect(readChoice(null)).toBeNull();
  });
});

describe('the pre-paint script and the hook agree', () => {
  it('uses the same storage key in both places', async () => {
    const { readFileSync } = await import('node:fs');
    const html = readFileSync('index.html', 'utf8');
    // If these drift, the page renders one theme before hydration and another after.
    expect(html).toContain(THEME_STORAGE_KEY);
  });
});
