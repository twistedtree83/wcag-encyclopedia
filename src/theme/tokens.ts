/**
 * The two Swatch theme palettes, as data.
 *
 * This is the single source of truth for colour. The stylesheets get these as CSS custom
 * properties (see `css.ts`, injected at build time), and the token contrast audit reads the
 * same objects, so a colour cannot change in one place and not the other.
 *
 * Names and values come from the `:root` block of the Swatch design
 * (`design/mockups/swatch/swatch.css`), so the design and the build stay diffable. The design
 * writes some tokens as aliases (`--accent-text: var(--a1)`); here each alias is spelt out per
 * theme from the colour it points at, so every token is a hex value the audit can measure.
 *
 * Non-colour tokens (type, spacing, shape, motion) live in `src/styles/swatch.css`.
 */

/** The colours each theme writes down directly. */
const darkBase = {
  bg: '#2A2B2D',
  deep: '#1A1C1C',
  raise: '#323336',
  ink: '#F3F3F0',
  'ink-2': '#C3C3BE',
  line: '#4A4B4F',
  'line-2': '#8A8B90',

  a1: '#9CCADE',
  a2: '#F8D17D',
  a3: '#FFB3A9',
  a4: '#FFFFFF',
  'a-ink': '#1F5E7A',
  'on-a': '#1A1C1C',

  exhibit: '#121313',
  'pledge-bg': '#F3F3F0',
  'pledge-fg': '#1A1C1C',
  loop: '#8E8F93',

  /**
   * Colours used *inside* examples to depict some other product's interface. They are tokens
   * rather than literals so they stay theme-aware and get audited: a fail example must break
   * exactly the criterion it illustrates and nothing else. Examples sit on `--deep` (the stage).
   */
  /** A link as another product draws it. Must pass 1.4.3, so 1.4.1's example fails only 1.4.1. */
  'ex-link': '#7FB4EE',
  /** Control edges. Weak deliberately fails 1.4.11; strong passes. */
  'ex-border-weak': '#2E2E28',
  'ex-border-strong': '#8C8779',
  /** Body text. Weak deliberately fails 1.4.3; strong passes. */
  'ex-text-weak': '#575751',
  'ex-text-strong': '#B3ADA1',
};

type BaseToken = keyof typeof darkBase;

const lightBase: Record<BaseToken, string> = {
  ...darkBase,
  bg: '#F4F3EF',
  deep: '#FFFFFF',
  raise: '#FFFFFF',
  ink: '#1A1C1C',
  'ink-2': '#4A4B4F',
  line: '#D6D4CE',
  'line-2': '#7A7A7E',
  a4: '#E4E2DC',
  'pledge-bg': '#1A1C1C',
  'pledge-fg': '#F3F3F0',
  loop: '#A9A7A0',

  'ex-link': '#1668C4',
  'ex-border-weak': '#EBEBEB',
  'ex-border-strong': '#6A6A6A',
  'ex-text-weak': '#9C9C9C',
  'ex-text-strong': '#54524C',
};

/** The design's aliases, resolved against one theme's base colours. */
function withAliases(base: Record<BaseToken, string>, theme: 'light' | 'dark') {
  const isDark = theme === 'dark';
  return {
    ...base,
    'card-bg': base.raise,
    'accent-text': isDark ? base.a1 : base['a-ink'],
    'err-text': isDark ? base.a3 : '#A83226',
    'ok-text': isDark ? base.a1 : base['a-ink'],
    focus: isDark ? base.a2 : '#1A1C1C',
    'btn-bg': base.a2,
    'btn-fg': base['on-a'],
    'btn2-line': base['line-2'],
    'nav-on-bg': base.ink,
    'nav-on-fg': base.bg,
    'chip-on-bg': base.ink,
    'chip-on-fg': base.bg,
    'badge-bg': base.ink,
    'badge-fg': base.bg,
    // The inner edge of the Broken and Fixed stages: rose and sky in dark, neutral in light.
    // Decorative: the labels say which is which.
    'stage-edge-bad': isDark ? base.a3 : base['line-2'],
    'stage-edge-good': isDark ? base.a1 : base['line-2'],
    // The edge of a card surface (.surf): none to see in dark (it matches the card), a
    // hairline in light. Decorative: cards are told apart by their fill and spacing.
    'surf-edge': isDark ? base.raise : base.line,
    // The edge of a --deep panel (the filter panel, the colour check): none in dark, a
    // hairline in light.
    // Decorative: the panel is told apart by its fill.
    'panel-edge': isDark ? base.deep : base.line,
  };
}

export const dark = withAliases(darkBase, 'dark');
export type Token = keyof typeof dark;
export const light: Record<Token, string> = withAliases(lightBase, 'light');

export const palettes = { light, dark } as const;
export type ThemeName = keyof typeof palettes;
export const THEMES: readonly ThemeName[] = ['light', 'dark'];

/**
 * Every foreground/background token pair that actually occurs in the interface.
 *
 * This list is the audit's scope. When a component introduces a new pairing, it is added
 * here: an unlisted pairing is an untested pairing. `kind` selects the threshold:
 * `body` 4.5:1, `large` and `ui` 3:1.
 */
export type TokenPair = {
  readonly fg: Token;
  readonly bg: Token;
  readonly kind: 'body' | 'large' | 'ui';
  readonly where: string;
  /**
   * What the audit should assert. `pass` (the default) is the interface's own chrome, which
   * must clear its threshold. `fail` is a colour used inside a *failing* example, where the
   * whole point is that it does not. Asserting the failure means a colour drift that
   * accidentally made the bad example look acceptable breaks the build too.
   */
  readonly expect?: 'pass' | 'fail';
};

export const TOKEN_PAIRS: readonly TokenPair[] = [
  // Text on each surface: the page, panels and stages (deep), raised hovers, cards.
  { fg: 'ink', bg: 'bg', kind: 'body', where: 'main text on the page' },
  { fg: 'ink', bg: 'deep', kind: 'body', where: 'main text on a panel or stage' },
  { fg: 'ink', bg: 'raise', kind: 'body', where: 'nav link on its hover background' },
  { fg: 'ink', bg: 'card-bg', kind: 'body', where: 'main text on a card' },
  { fg: 'ink-2', bg: 'bg', kind: 'body', where: 'secondary text on the page' },
  { fg: 'ink-2', bg: 'deep', kind: 'body', where: 'secondary text on panels' },
  { fg: 'ink-2', bg: 'raise', kind: 'body', where: 'secondary text on a raised surface' },
  { fg: 'ink-2', bg: 'card-bg', kind: 'body', where: 'secondary text on cards' },

  // Accent, error and pass text.
  { fg: 'accent-text', bg: 'bg', kind: 'body', where: 'accent text and links on the page' },
  { fg: 'accent-text', bg: 'deep', kind: 'body', where: 'accent text on panels' },
  { fg: 'accent-text', bg: 'raise', kind: 'body', where: 'accent text on raised surfaces' },
  { fg: 'err-text', bg: 'bg', kind: 'body', where: 'error text on the page' },
  { fg: 'err-text', bg: 'card-bg', kind: 'body', where: 'error text on cards ("Fails when:")' },
  { fg: 'err-text', bg: 'deep', kind: 'body', where: 'error text on panels' },
  { fg: 'ok-text', bg: 'bg', kind: 'body', where: 'pass text on the page' },
  { fg: 'ok-text', bg: 'deep', kind: 'body', where: 'pass text on panels' },

  // Ink on the pastel fills: stage labels, principle cards, tags.
  { fg: 'on-a', bg: 'a1', kind: 'body', where: 'ink on sky (Fixed label, Perceivable)' },
  { fg: 'on-a', bg: 'a2', kind: 'body', where: 'ink on sun (Operable, New tag)' },
  { fg: 'on-a', bg: 'a3', kind: 'body', where: 'ink on rose (Broken label, Understandable)' },
  { fg: 'on-a', bg: 'a4', kind: 'body', where: 'ink on the Robust card' },
  { fg: 'pledge-fg', bg: 'pledge-bg', kind: 'body', where: 'pledge panel text' },

  // Inverted and filled controls.
  { fg: 'btn-fg', bg: 'btn-bg', kind: 'body', where: 'primary button and skip link' },
  { fg: 'nav-on-fg', bg: 'nav-on-bg', kind: 'body', where: 'current page in the nav' },
  { fg: 'chip-on-fg', bg: 'chip-on-bg', kind: 'body', where: 'pressed chip' },
  { fg: 'badge-fg', bg: 'badge-bg', kind: 'body', where: 'Level AA badge' },

  // Non-text: control borders and the focus ring must clear 3:1 (1.4.11).
  { fg: 'line-2', bg: 'bg', kind: 'ui', where: 'control borders on the page' },
  { fg: 'line-2', bg: 'deep', kind: 'ui', where: 'control borders on panels' },
  { fg: 'line-2', bg: 'card-bg', kind: 'ui', where: 'control borders on cards (the tightest pair)' },
  { fg: 'btn2-line', bg: 'bg', kind: 'ui', where: 'secondary button border (theme toggle)' },
  { fg: 'focus', bg: 'bg', kind: 'ui', where: 'focus ring on the page' },
  { fg: 'focus', bg: 'deep', kind: 'ui', where: 'focus ring on panels' },
  { fg: 'focus', bg: 'raise', kind: 'ui', where: 'focus ring on raised surfaces and cards' },

  // Colours used inside examples, on the stage they mount in. A fail example must break
  // exactly the criterion it illustrates, never a second one by accident.
  { fg: 'ex-link', bg: 'deep', kind: 'body', where: 'depicted link inside an example (1.4.1)' },
  {
    fg: 'ex-border-strong',
    bg: 'deep',
    kind: 'ui',
    where: 'depicted control edge in a passing example (1.4.11)',
  },
  {
    fg: 'ex-text-strong',
    bg: 'deep',
    kind: 'body',
    where: 'depicted body text in a passing example (1.4.3)',
  },
  {
    fg: 'ex-text-weak',
    bg: 'deep',
    kind: 'body',
    expect: 'fail',
    where: 'depicted body text in a failing example (1.4.3), must stay under 4.5:1',
  },
  {
    fg: 'ex-border-weak',
    bg: 'deep',
    kind: 'ui',
    expect: 'fail',
    where: 'depicted control edge in a failing example (1.4.11), must stay under 3:1',
  },
];
