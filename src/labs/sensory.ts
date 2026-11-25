/**
 * The 1.3.3 lab's model (#56): the reader picks how a checkout step's instruction points at its
 * button. An instruction passes when it names the button; it may still say where the button is
 * and what colour it is, as long as that is not all it says.
 *
 * The mock's two buttons are green and red of near-equal lightness (tokens `ex-go`, `ex-stop`,
 * the same in both themes), so through the vision filter "green" points at nothing. Read aloud,
 * nothing is round or green.
 */

import { light } from '../theme/tokens';
import { seeCue, type CueSeen, type VisionFilter } from '../live/vision';
import type { Verdict } from './LabShell';

export type Instruction = 'place' | 'colour' | 'named' | 'both';

export const BUTTON_NAME = 'Continue to payment';
export const OTHER_NAME = 'Save for later';

export const INSTRUCTIONS: readonly { readonly value: Instruction; readonly label: string }[] = [
  { value: 'place', label: 'Press the round green button on the right.' },
  { value: 'colour', label: 'Press the green button.' },
  { value: 'named', label: `Press ${BUTTON_NAME}.` },
  { value: 'both', label: `Press the green ${BUTTON_NAME} button on the right.` },
];

/** Words that point by sight alone, by the sense they lean on. */
const SENSES: readonly { readonly sense: string; readonly words: readonly string[] }[] = [
  { sense: 'shape', words: ['round', 'square'] },
  { sense: 'colour', words: ['green', 'red'] },
  { sense: 'position', words: ['on the right', 'on the left', 'below', 'above'] },
];

export type Sensory = { readonly instruction: Instruction; readonly filter: VisionFilter };

export const SENSE_START: Sensory = { instruction: 'place', filter: 'none' };

export type SensoryState = {
  readonly text: string;
  readonly names: boolean;
  /** "shape (round), colour (green)", or "" when it points by nothing but the name. */
  readonly pointsBy: string;
  /** The green button against the red one, through the filter. */
  readonly cue: CueSeen;
  readonly verdict: Verdict;
  readonly said: string;
};

export function senseState({ instruction, filter }: Sensory): SensoryState {
  const text = INSTRUCTIONS.find((i) => i.value === instruction)!.label;
  const lower = text.toLowerCase();
  const names = text.includes(BUTTON_NAME);
  const pointsBy = SENSES.flatMap(({ sense, words }) =>
    words.filter((w) => lower.includes(w)).map((w) => `${sense} (${w})`),
  ).join(', ');
  const cue = seeCue(
    {
      label: 'The green button',
      colour: light['ex-go'],
      against: light['ex-stop'],
      vs: 'the red one',
      need: 3,
      also: names ? 'named in the instruction' : null,
    },
    filter,
  );
  return {
    text,
    names,
    pointsBy,
    cue,
    verdict: { criterion: '1.3.3', passes: names },
    said:
      `Read aloud: “${text}” The buttons are ${OTHER_NAME} and ${BUTTON_NAME}. ` +
      (names
        ? `The instruction names ${BUTTON_NAME}.`
        : 'Nothing read aloud says which one is round, green or on the right.'),
  };
}
