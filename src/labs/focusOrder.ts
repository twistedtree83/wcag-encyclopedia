/**
 * The 2.4.3 flagship lab's model (#46): a five-part form in a fixed grid. On screen it reads
 * Name and Email, then Phone and Postcode, then Send, whatever the markup says. The reader picks
 * the source order and whether one part gets `tabindex="1"`. Tab follows the HTML rule
 * (`tabOrder` in `src/live/focus.ts`): positive tabindex first, then source order. The verdict
 * passes when focus visits the parts in the order they are seen.
 */

import { tabOrder } from '../live/focus';
import type { Verdict } from './LabShell';

export type Part = 'name' | 'email' | 'phone' | 'postcode' | 'send';
export type Source = 'layout' | 'columns' | 'send-first';
export type Lift = 'none' | 'postcode' | 'send';

export type Order = { readonly source: Source; readonly lift: Lift };

/** The order the parts are seen in: left to right, top to bottom. */
export const VISUAL: readonly Part[] = ['name', 'email', 'phone', 'postcode', 'send'];

export const PART_LABEL: Readonly<Record<Part, string>> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  postcode: 'Postcode',
  send: 'Send',
};

const SOURCE_ORDER: Readonly<Record<Source, readonly Part[]>> = {
  layout: VISUAL,
  columns: ['name', 'phone', 'email', 'postcode', 'send'],
  'send-first': ['send', 'name', 'email', 'phone', 'postcode'],
};

type Option<T> = { readonly value: T; readonly label: string };

export const SOURCES: readonly Option<Source>[] = [
  { value: 'layout', label: 'Row by row, as laid out' },
  { value: 'columns', label: 'Column by column' },
  { value: 'send-first', label: 'Send button first' },
];

export const LIFTS: readonly Option<Lift>[] = [
  { value: 'none', label: 'None' },
  { value: 'postcode', label: 'tabindex="1" on Postcode' },
  { value: 'send', label: 'tabindex="1" on Send' },
];

export const ORDER_START: Order = { source: 'layout', lift: 'none' };

/** The parts in source order: the markup, which the grid places regardless. */
export function sourceOrder({ source }: Order): readonly Part[] {
  return SOURCE_ORDER[source];
}

/** The tabindex the markup gives each part. */
export function tabindexOf(order: Order, part: Part): number {
  return order.lift === part ? 1 : 0;
}

/** The order Tab visits the parts in. */
export function focusOrder(order: Order): Part[] {
  const stops = sourceOrder(order).map((part) => ({ part, tabindex: tabindexOf(order, part) }));
  return tabOrder(stops).map((s) => s.part);
}

/** The first stop (1-based) where focus leaves the visual order, or null when it never does. */
export function firstWrong(order: Order): number | null {
  const at = focusOrder(order).findIndex((p, i) => p !== VISUAL[i]);
  return at < 0 ? null : at + 1;
}

export function orderVerdict(order: Order): Verdict {
  return { criterion: '2.4.3', passes: firstWrong(order) === null };
}

/** The live region's sentence after a change. */
export function orderSaid(order: Order): string {
  const goes = focusOrder(order)
    .map((p) => PART_LABEL[p])
    .join(', ');
  const wrong = firstWrong(order);
  return `Focus goes ${goes}. ${wrong === null ? 'It follows the layout.' : `It leaves the layout at stop ${wrong}.`}`;
}
