/**
 * The 1.3.2 lab's model (#49): three numbered checkout steps. The reader picks their order in the
 * source (the document) and whether CSS `order` sorts them by number on screen. A screen reader
 * and the keyboard follow the source, so the verdict passes only when the source itself is in the
 * meaningful order; CSS can make a scrambled source look right without fixing it.
 */

import type { Verdict } from '../shared/LabShell';

export type Step = 'basket' | 'address' | 'confirm';
export type SourceOrder = 'in-order' | 'confirm-first' | 'address-first';
export type Layout = 'source' | 'order';

export type Seq = { readonly source: SourceOrder; readonly layout: Layout };

/** Each step's number and visible text. The numbers are the meaningful order. */
export const STEP: Readonly<Record<Step, { readonly num: number; readonly label: string }>> = {
  basket: { num: 1, label: 'Basket' },
  address: { num: 2, label: 'Address' },
  confirm: { num: 3, label: 'Confirm' },
};

const ORDERS: Readonly<Record<SourceOrder, readonly Step[]>> = {
  'in-order': ['basket', 'address', 'confirm'],
  'confirm-first': ['confirm', 'basket', 'address'],
  'address-first': ['address', 'confirm', 'basket'],
};

type Option<T> = { readonly value: T; readonly label: string };

export const SOURCES: readonly Option<SourceOrder>[] = (
  ['in-order', 'confirm-first', 'address-first'] as const
).map((value) => ({ value, label: ORDERS[value].map((s) => STEP[s].label).join(', ') }));

export const LAYOUTS: readonly Option<Layout>[] = [
  { value: 'source', label: 'None: boxes sit in source order' },
  { value: 'order', label: 'order: sorts the boxes by number' },
];

/** The CSS fixes the screen, the source stays scrambled: it looks right and reads wrong. */
export const SEQ_START: Seq = { source: 'confirm-first', layout: 'order' };

/** The order a screen reader reads and the keyboard follows: the source. */
export function readingOrder({ source }: Seq): readonly Step[] {
  return ORDERS[source];
}

/** The order on screen, left to right. */
export function screenOrder(seq: Seq): readonly Step[] {
  const order = readingOrder(seq);
  return seq.layout === 'order' ? [...order].sort((a, b) => STEP[a].num - STEP[b].num) : order;
}

const inOrder = (steps: readonly Step[]) => steps.every((s, i) => STEP[s].num === i + 1);

export function seqVerdict(seq: Seq): Verdict {
  return { criterion: '1.3.2', passes: inOrder(readingOrder(seq)) };
}

/** The live region's sentence after a change. */
export function seqSaid(seq: Seq): string {
  const read = readingOrder(seq)
    .map((s) => `${STEP[s].num}. ${STEP[s].label}`)
    .join('; ');
  const verdict = inOrder(readingOrder(seq))
    ? 'In order.'
    : inOrder(screenOrder(seq))
      ? 'Out of order, though the screen looks right.'
      : 'Out of order, on screen too.';
  return `Screen reader reads: ${read}. ${verdict}`;
}
