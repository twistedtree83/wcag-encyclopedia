/**
 * Colour pairs the colour check can load: the quick-start chips above it on its own page, and
 * the "Done well, done badly" pairs (design guide §8.4, §8.5). Hex codes only; every ratio
 * shown for them is measured by the contrast engine when it renders.
 */

export type ColourPair = { readonly fg: string; readonly bg: string };

/** What the colour check shows before anyone touches it: ink on sun. */
export const DEFAULT_PAIR: ColourPair = { fg: '#1A1C1C', bg: '#F8D17D' };

export type Preset = ColourPair & { readonly name: string };

export const PRESETS: readonly Preset[] = [
  { name: 'Ink on paper', fg: '#1A1C1C', bg: '#F4F3EF' },
  { name: 'White on night', fg: '#FFFFFF', bg: '#1A1C1C' },
  { name: 'Ink on sun', fg: '#1A1C1C', bg: '#F8D17D' },
  { name: 'White on sky', fg: '#FFFFFF', bg: '#9CCADE' },
  { name: 'Grey on white', fg: '#999999', bg: '#FFFFFF' },
  { name: 'Teal on white', fg: '#1F5E7A', bg: '#FFFFFF' },
];

export type MistakePair = {
  /** Names the mistake. */
  readonly title: string;
  /** One sentence of advice. */
  readonly why: string;
  readonly bad: ColourPair;
  readonly good: ColourPair;
};

export const PAIRS: readonly MistakePair[] = [
  {
    title: 'Pale grey on white',
    why: 'Looks refined on a bright monitor and disappears on a phone in sunlight.',
    bad: { fg: '#B5B5B5', bg: '#FFFFFF' },
    good: { fg: '#5E5E5E', bg: '#FFFFFF' },
  },
  {
    title: 'White on yellow',
    why: 'Yellows are light colours. Dark text works on them; white text never does.',
    bad: { fg: '#FFFFFF', bg: '#F8D17D' },
    good: { fg: '#1A1C1C', bg: '#F8D17D' },
  },
  {
    title: 'Pastel link on white',
    why: 'Keep the hue, drop the lightness. The link stays on brand and becomes readable.',
    bad: { fg: '#9CCADE', bg: '#FFFFFF' },
    good: { fg: '#1F5E7A', bg: '#FFFFFF' },
  },
  {
    title: 'Red on green',
    why: 'Similar lightness, different hue. For many colour-blind readers the two become one.',
    bad: { fg: '#D0312D', bg: '#3A9A3A' },
    good: { fg: '#FFFFFF', bg: '#245A24' },
  },
  {
    title: 'Muted text in dark mode',
    why: 'Secondary text drifts towards the background. Lift it until it reads.',
    bad: { fg: '#5A5B5F', bg: '#2A2B2D' },
    good: { fg: '#C3C3BE', bg: '#2A2B2D' },
  },
  {
    title: 'Soft red error message',
    why: 'A friendly coral feels gentle and fails as text. Errors must be the easiest thing to read.',
    bad: { fg: '#FF8A80', bg: '#FFFFFF' },
    good: { fg: '#A83226', bg: '#FFFFFF' },
  },
];
