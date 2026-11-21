/**
 * The lab registry: id → an interactive exhibit the reader controls directly.
 *
 * A criterion record points at labs by id in its `labs` field; when it has any, the criterion
 * page shows a "Try it yourself" section. Adding a lab is adding an entry here and an id on a
 * record: data, not layout. Labs add to a record's fail and pass examples, never replace them.
 */

import type { ReactNode } from 'react';
import type { CriterionRecord } from '../criteria/types';
import { ColourCheckLab } from './ColourCheck';
import { FadeLab } from './FadeLab';

export type LabEntry = {
  readonly id: string;
  /** The section heading the lab is shown under, e.g. "Try it: fade the text". */
  readonly title: string;
  /** Renders the lab. Must be SSR-safe and prefix its ids, since a page may show it twice. */
  readonly Lab: () => ReactNode;
};

export const LABS: readonly LabEntry[] = [
  { id: 'colour-check', title: 'Try it: check your own colours', Lab: ColourCheckLab },
  { id: 'fade-text', title: 'Try it: fade the text', Lab: FadeLab },
];

export function labById(id: string): LabEntry | undefined {
  return LABS.find((l) => l.id === id);
}

/** The ids on a record that no registered lab answers to. Empty when every reference resolves. */
export function unresolvedLabs(record: Pick<CriterionRecord, 'labs'>): readonly string[] {
  return (record.labs ?? []).filter((id) => labById(id) === undefined);
}
