/**
 * The lab registry: id → an interactive exhibit the reader controls directly.
 *
 * A criterion record points at labs by id in its `labs` field; when it has any, the criterion
 * page shows a "Try it yourself" section. Adding a lab is adding an entry here and an id on a
 * record: data, not layout. Labs add to a record's fail and pass examples, never replace them.
 *
 * Every lab renders inside the lab shell (`LabShell.tsx`): mock, controls, one verdict, Reset,
 * and one polite live region. `docs/CONVENTIONS.md` ("Labs") says how to add one.
 */

import type { ReactNode } from 'react';
import type { CriterionRecord } from '../criteria/types';
import { ColourCheckLab } from './ColourCheck';
import { FadeLab } from './FadeLab';
import { FocusRingLab } from './FocusRingLab';
import { HeadingsLab } from './HeadingsLab';
import { InputPurposeLab } from './InputPurposeLab';
import { LabelInNameLab } from './LabelInNameLab';
import { LinkPurposeLab } from './LinkPurposeLab';
import { NameRoleValueLab } from './NameRoleValueLab';
import { PageTitleLab } from './PageTitleLab';
import { SequenceLab } from './SequenceLab';

export type LabProps = {
  /** The number of the criterion page showing the lab, e.g. "1.4.11". */
  readonly criterion: string;
};

export type LabEntry = {
  readonly id: string;
  /** The section heading the lab is shown under, e.g. "Try it: fade the text". */
  readonly title: string;
  /**
   * Renders the lab. Must be SSR-safe and prefix its ids, since a page may show it twice.
   * `criterion` is the page it is on, for a lab shown on more than one criterion.
   */
  readonly Lab: (props: LabProps) => ReactNode;
  /**
   * Set on a flagship lab (CONTEXT.md): the criterion it is the flagship for. Exactly ten
   * criteria have one, and the data-integrity test holds the list.
   */
  readonly flagshipFor?: string;
};

export const LABS: readonly LabEntry[] = [
  {
    id: 'colour-check',
    title: 'Try it: check your own colours',
    Lab: ColourCheckLab,
    flagshipFor: '1.4.3',
  },
  { id: 'fade-text', title: 'Try it: fade the text', Lab: FadeLab },
  {
    id: 'name-role-value',
    title: 'Try it: build the toggle',
    Lab: NameRoleValueLab,
    flagshipFor: '4.1.2',
  },
  {
    id: 'focus-ring',
    title: 'Try it: style your own focus ring',
    Lab: FocusRingLab,
    flagshipFor: '2.4.7',
  },
  { id: 'meaningful-sequence', title: 'Try it: reorder the steps', Lab: SequenceLab },
  { id: 'input-purpose', title: 'Try it: tag the fields', Lab: InputPurposeLab },
  { id: 'label-in-name', title: 'Try it: say what you see', Lab: LabelInNameLab },
  { id: 'page-title', title: 'Try it: title the page', Lab: PageTitleLab },
  { id: 'link-purpose', title: 'Try it: name the links', Lab: LinkPurposeLab },
  { id: 'headings-labels', title: 'Try it: write the headings', Lab: HeadingsLab },
];

export function labById(id: string): LabEntry | undefined {
  return LABS.find((l) => l.id === id);
}

/** The ids on a record that no registered lab answers to. Empty when every reference resolves. */
export function unresolvedLabs(record: Pick<CriterionRecord, 'labs'>): readonly string[] {
  return (record.labs ?? []).filter((id) => labById(id) === undefined);
}

/** The criteria with no lab that are not on the `toCome` list. Empty when coverage is complete. */
export function uncoveredCriteria(
  records: readonly Pick<CriterionRecord, 'num' | 'labs'>[],
  toCome: readonly string[],
): readonly string[] {
  return records
    .filter((r) => (r.labs ?? []).length === 0 && !toCome.includes(r.num))
    .map((r) => r.num);
}

/** The criteria that have a flagship lab built. */
export function flagshipCriteria(): readonly string[] {
  return LABS.flatMap((l) => (l.flagshipFor ? [l.flagshipFor] : []));
}
