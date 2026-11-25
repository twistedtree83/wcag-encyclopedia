/**
 * The 1.4.11 lab's model (#56): the reader fades the edges of a mock field and checkbox towards
 * the white card they sit on, and looks at them through the vision filter. The edge grey runs
 * from #6A6A6A at 0% faded (the passing edge token in light) to the card's own white at 100%.
 *
 * The threshold row is the colour check's "Borders and icons" (`thresholds.ts`), and the ratio is
 * the contrast engine's, measured through the filter (`vision.ts`).
 */

import { filterName, seeCue, type VisionFilter } from '../live/vision';
import type { Verdict } from './LabShell';
import { THRESHOLD_CHECKS } from './thresholds';

export const NT_BG = '#FFFFFF';
const DARKEST = 0x6a;
const LIGHTEST = 0xff;

const UI_CHECK = THRESHOLD_CHECKS.find((c) => !c.text)!;

export type NonText = { readonly faded: number; readonly filter: VisionFilter };

export const NT_START: NonText = { faded: 0, filter: 'none' };

export type NonTextState = {
  /** The edge colour, `#RRGGBB`. */
  readonly edge: string;
  readonly ratioText: string;
  readonly result: { readonly name: string; readonly level: string; readonly passes: boolean };
  readonly verdict: Verdict;
  readonly said: string;
};

export function ntState({ faded, filter }: NonText): NonTextState {
  const level = Math.round(DARKEST + ((LIGHTEST - DARKEST) * faded) / 100);
  const hex = level.toString(16).padStart(2, '0').toUpperCase();
  const edge = `#${hex}${hex}${hex}`;
  const cue = seeCue(
    {
      label: 'The edges',
      colour: edge,
      against: NT_BG,
      vs: 'the background',
      need: UI_CHECK.threshold,
      also: null,
    },
    filter,
  );
  const passes = cue.found;
  return {
    edge,
    ratioText: cue.ratioText,
    result: { name: UI_CHECK.appliesTo, level: UI_CHECK.level, passes },
    verdict: { criterion: '1.4.11', passes },
    said:
      `${faded}% faded. The edges are ${cue.ratioText} against the background, in ` +
      `${filterName(filter).toLowerCase()}. ${passes ? 'Passes' : 'Fails'} ${UI_CHECK.spoken}.`,
  };
}
