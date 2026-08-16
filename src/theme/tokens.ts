/**
 * The two theme palettes, as data.
 *
 * This is the single source of truth for colour. The stylesheet gets these as CSS custom
 * properties (see `css.ts`, injected at build time), and the token contrast audit reads the
 * same objects — so a colour cannot change in one place and not the other.
 *
 * Token names come from the design file verbatim, so the design and the build stay diffable.
 * The dark palette redefines existing tokens only; it never introduces a colour without a
 * light counterpart. The `Token` type enforces that.
 */

export const light = {
  bg: '#FAF7F1',
  panel: '#FFFFFF',
  panel2: '#F4F0E7',

  ink: '#1B1A16',
  ink2: '#585449',
  ink3: '#6B6657',

  rule: '#DFD8C9',
  rule2: '#87806F',

  link: '#144E8C',
  'link-hover': '#0C3563',
  focus: '#144E8C',

  fail: '#A32017',
  'fail-bg': '#FCF1F0',
  pass: '#1A6B3C',
  'pass-bg': '#EFF7F1',

  p1: '#8A5300',
  p2: '#0D6664',
  p3: '#3B4CA8',
  p4: '#93264A',

  'p1-wash': '#F6EEDD',
  'p2-wash': '#E7F2F1',
  'p3-wash': '#ECEEF9',
  'p4-wash': '#F8EBEF',

  /**
   * Blue used *inside* examples to depict a link in some other product's interface.
   * It is a token rather than a literal so it stays theme-aware and gets audited: a fail
   * example must break exactly the criterion it illustrates and nothing else. The 1.4.1
   * fail example needs a blue that comfortably passes 1.4.3, so the only thing wrong with
   * it is the missing underline.
   */
  'swatch-link': '#1668C4',
  /** Control edges depicted inside examples. Weak deliberately fails 1.4.11; strong passes. */
  'swatch-border-weak': '#EBEBEB',
  'swatch-border-strong': '#6A6A6A',
} as const;

export type Token = keyof typeof light;

export const dark: Record<Token, string> = {
  bg: '#131311',
  panel: '#1C1C19',
  panel2: '#232320',

  ink: '#F3F0E8',
  ink2: '#B3ADA1',
  ink3: '#948E82',

  rule: '#33332E',
  rule2: '#787368',

  link: '#8FBEF0',
  'link-hover': '#BCD9F8',
  focus: '#8FBEF0',

  fail: '#F2A6A0',
  'fail-bg': '#2A1917',
  pass: '#8ED6A8',
  'pass-bg': '#152420',

  p1: '#E0A93F',
  p2: '#5AC9C1',
  p3: '#A3B1F7',
  p4: '#F49AB0',

  'p1-wash': '#241D0F',
  'p2-wash': '#0F2322',
  'p3-wash': '#171A2C',
  'p4-wash': '#271420',

  'swatch-link': '#7FB4EE',
  'swatch-border-weak': '#2E2E28',
  'swatch-border-strong': '#8C8779',
};

export const palettes = { light, dark } as const;
export type ThemeName = keyof typeof palettes;
export const THEMES: readonly ThemeName[] = ['light', 'dark'];

/**
 * Every foreground/background token pair that actually occurs in the interface.
 *
 * This list is the audit's scope. When a component introduces a new pairing, it is added
 * here — an unlisted pairing is an untested pairing. `kind` selects the threshold:
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
   * whole point is that it does not — asserting the failure means a colour drift that
   * accidentally made the bad example look acceptable would break the build too. A fail
   * example must break exactly what it claims to break, in both directions.
   */
  readonly expect?: 'pass' | 'fail';
};

export const TOKEN_PAIRS: readonly TokenPair[] = [
  // Body copy on each of the three surfaces.
  { fg: 'ink', bg: 'bg', kind: 'body', where: 'body copy on the page ground' },
  { fg: 'ink', bg: 'panel', kind: 'body', where: 'body copy inside a card' },
  { fg: 'ink', bg: 'panel2', kind: 'body', where: 'body copy on a sunken panel' },
  { fg: 'ink2', bg: 'bg', kind: 'body', where: 'secondary prose on the page ground' },
  { fg: 'ink2', bg: 'panel', kind: 'body', where: 'secondary prose inside a card' },
  { fg: 'ink2', bg: 'panel2', kind: 'body', where: 'secondary prose on a sunken panel' },
  { fg: 'ink3', bg: 'bg', kind: 'body', where: 'eyebrow and meta labels on the page ground' },
  { fg: 'ink3', bg: 'panel', kind: 'body', where: 'eyebrow and meta labels inside a card' },
  { fg: 'ink3', bg: 'panel2', kind: 'body', where: 'eyebrow and meta labels on a sunken panel' },

  // Links.
  { fg: 'link', bg: 'bg', kind: 'body', where: 'links in prose' },
  { fg: 'link', bg: 'panel', kind: 'body', where: 'links inside a card' },
  { fg: 'link-hover', bg: 'bg', kind: 'body', where: 'hovered links in prose' },
  { fg: 'link-hover', bg: 'panel', kind: 'body', where: 'hovered links inside a card' },

  // Fail/pass frames: label text sits on its own wash, borders against the page.
  { fg: 'fail', bg: 'fail-bg', kind: 'body', where: 'FAIL label on its wash' },
  { fg: 'pass', bg: 'pass-bg', kind: 'body', where: 'PASS label on its wash' },
  { fg: 'fail', bg: 'panel', kind: 'ui', where: 'FAIL frame border against a card' },
  { fg: 'pass', bg: 'panel', kind: 'ui', where: 'PASS frame border against a card' },
  { fg: 'ink', bg: 'fail-bg', kind: 'body', where: 'caption text on the FAIL wash' },
  { fg: 'ink', bg: 'pass-bg', kind: 'body', where: 'caption text on the PASS wash' },

  // Principle accents: used for headings (large) and for rail labels (body).
  { fg: 'p1', bg: 'bg', kind: 'body', where: 'Perceivable accent on the page ground' },
  { fg: 'p2', bg: 'bg', kind: 'body', where: 'Operable accent on the page ground' },
  { fg: 'p3', bg: 'bg', kind: 'body', where: 'Understandable accent on the page ground' },
  { fg: 'p4', bg: 'bg', kind: 'body', where: 'Robust accent on the page ground' },
  { fg: 'p1', bg: 'p1-wash', kind: 'large', where: 'Perceivable opener on its wash' },
  { fg: 'p2', bg: 'p2-wash', kind: 'large', where: 'Operable opener on its wash' },
  { fg: 'p3', bg: 'p3-wash', kind: 'large', where: 'Understandable opener on its wash' },
  { fg: 'p4', bg: 'p4-wash', kind: 'large', where: 'Robust opener on its wash' },
  { fg: 'ink', bg: 'p1-wash', kind: 'body', where: 'opener prose on the Perceivable wash' },
  { fg: 'ink', bg: 'p2-wash', kind: 'body', where: 'opener prose on the Operable wash' },
  { fg: 'ink', bg: 'p3-wash', kind: 'body', where: 'opener prose on the Understandable wash' },
  { fg: 'ink', bg: 'p4-wash', kind: 'body', where: 'opener prose on the Robust wash' },
  { fg: 'ink2', bg: 'p1-wash', kind: 'body', where: 'opener secondary prose, Perceivable' },
  { fg: 'ink2', bg: 'p2-wash', kind: 'body', where: 'opener secondary prose, Operable' },
  { fg: 'ink2', bg: 'p3-wash', kind: 'body', where: 'opener secondary prose, Understandable' },
  { fg: 'ink2', bg: 'p4-wash', kind: 'body', where: 'opener secondary prose, Robust' },

  // Non-text: control edges, dividers, and the focus ring must clear 3:1.
  { fg: 'rule2', bg: 'bg', kind: 'ui', where: 'control borders against the page ground' },
  { fg: 'rule2', bg: 'panel', kind: 'ui', where: 'control borders inside a card' },
  { fg: 'rule2', bg: 'panel2', kind: 'ui', where: 'control borders on a sunken panel' },
  { fg: 'focus', bg: 'bg', kind: 'ui', where: 'focus ring against the page ground' },
  { fg: 'focus', bg: 'panel', kind: 'ui', where: 'focus ring inside a card' },
  { fg: 'focus', bg: 'panel2', kind: 'ui', where: 'focus ring on a sunken panel' },

  // Inverted: the Level A badge and pressed segmented buttons are ink-filled.
  { fg: 'panel', bg: 'ink', kind: 'body', where: 'text on an ink-filled badge or button' },

  // Colours used inside examples are audited too — a fail example must break exactly the
  // criterion it illustrates, never a second one by accident.
  { fg: 'swatch-link', bg: 'panel', kind: 'body', where: 'depicted link inside an example' },
  {
    fg: 'swatch-border-strong',
    bg: 'panel',
    kind: 'ui',
    where: 'depicted control edge in a passing example (1.4.11)',
  },
  {
    fg: 'swatch-border-weak',
    bg: 'panel',
    kind: 'ui',
    expect: 'fail',
    where: 'depicted control edge in a failing example (1.4.11) — must stay under 3:1',
  },
];
