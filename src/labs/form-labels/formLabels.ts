/**
 * The 3.3.2 lab's model (#52): a date-of-birth field labelled either by a placeholder alone or
 * by a persistent visible label with its format stated. The reader switches between them and
 * types into the field; the log says what a screen reader hears, and `onScreen` what a sighted
 * reader can still see.
 */

import { spoken, type Announcement } from '../shared/announce';
import type { Verdict } from '../shared/LabShell';

export type LabelShown = 'placeholder' | 'label';

export type FormLabels = {
  readonly shown: LabelShown;
  /** What the reader has typed into the field. */
  readonly typed: string;
};

export const FL_START: FormLabels = { shown: 'placeholder', typed: '' };

export const FL_LABEL = 'Date of birth';
export const FL_HINT = 'For example, 27 3 1995';

export const LABEL_SHOWN: readonly { readonly value: LabelShown; readonly label: string }[] = [
  { value: 'placeholder', label: 'A placeholder only' },
  { value: 'label', label: 'A visible label and the format' },
];

export function flVerdict({ shown }: FormLabels): Verdict {
  return { criterion: '3.3.2', passes: shown === 'label' };
}

/** What a sighted reader can see labelling the field. */
export function onScreen({ shown, typed }: FormLabels): string {
  if (shown === 'label') return `On screen: “${FL_LABEL}” and “${FL_HINT}”, above the field.`;
  return typed
    ? 'On screen: no label. The placeholder went when typing started.'
    : `On screen: “${FL_LABEL}”, as a placeholder in the field.`;
}

/** The live region's sentence after a change: the log, then what is on screen. */
export function flSaid(f: FormLabels, lines: readonly Announcement[]): string {
  return `Screen reader says: ${lines.map(spoken).join('; ')}. ${onScreen(f)}`;
}
