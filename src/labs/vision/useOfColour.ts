/**
 * The 1.4.1 lab's model (#56): a sentence with two links and a form with a field in error, both
 * told apart from their neighbours by hue alone until the reader adds an underline or an icon.
 * The vision filter shows what is left without full colour.
 *
 * The mock is drawn in these fixed colours (the same in both themes), so what the model measures
 * is what is on screen. Ratios come from the contrast engine through `vision.ts`.
 */

import { filterName, seeCue, type CueSeen, type VisionFilter } from '../../live/vision';
import type { Verdict } from '../shared/LabShell';

export const UC_COLOURS = {
  bg: '#FFFFFF',
  text: '#4A4B4F',
  link: '#1668C4',
  edge: '#767676',
  error: '#C01C28',
} as const;

export type UseOfColour = {
  readonly filter: VisionFilter;
  readonly underline: boolean;
  readonly icon: boolean;
};

export const UC_START: UseOfColour = { filter: 'none', underline: false, icon: false };

export type UseOfColourState = {
  readonly cues: readonly [CueSeen, CueSeen];
  readonly verdict: Verdict;
  readonly said: string;
};

export function ucState({ filter, underline, icon }: UseOfColour): UseOfColourState {
  const cues = (f: VisionFilter) =>
    [
      seeCue(
        {
          label: 'The links',
          colour: UC_COLOURS.link,
          against: UC_COLOURS.text,
          vs: 'the text around them',
          need: 3,
          also: underline ? 'underlined' : null,
        },
        f,
      ),
      seeCue(
        {
          label: 'The field in error',
          colour: UC_COLOURS.error,
          against: UC_COLOURS.edge,
          vs: 'the field beside it',
          need: 3,
          also: icon ? 'marked with an icon' : null,
        },
        f,
      ),
    ] as const;
  const shown = cues(filter);
  // Judged without hue: what still stands out in greyscale is not carried by colour alone.
  const passes = cues('greyscale').every((c) => c.found);
  return {
    cues: shown,
    verdict: { criterion: '1.4.1', passes },
    said: [`${filterName(filter)}.`, ...shown.map((c) => c.line)].join(' '),
  };
}
