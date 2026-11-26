/**
 * The 1.3.1 flagship lab's model (#48): a mock form or table whose parts the reader switches
 * between styled divs and the real elements (a heading, a list, labels, table headers). The log
 * reads the mock's markup; the verdict passes once every part of the mock is real.
 *
 * `structureVerdict` works from the model so the page can pre-render it; the unit test holds it
 * equal to the log's own `structureExposure` in every combination, so the two cannot drift.
 */

import type { Announcement } from '../shared/announce';
import type { Verdict } from '../shared/LabShell';

export type Mock = 'form' | 'table';
export type Part = 'heading' | 'list' | 'labels' | 'headers';

export type Structure = {
  readonly mock: Mock;
  /** The parts built from real elements, in `PART_ORDER`. Parts the mock lacks are kept, unused. */
  readonly real: readonly Part[];
};

export const STRUCTURE_START: Structure = { mock: 'form', real: [] };

export const PART_ORDER: readonly Part[] = ['heading', 'list', 'labels', 'headers'];

/** The parts each mock has, in reading order. */
export const PARTS: Readonly<Record<Mock, readonly Part[]>> = {
  form: ['heading', 'list', 'labels'],
  table: ['heading', 'headers'],
};

type Option<T> = { readonly value: T; readonly label: string };

export const MOCKS: readonly Option<Mock>[] = [
  { value: 'form', label: 'A form' },
  { value: 'table', label: 'A table' },
];

/** The checkbox for each part: what turning it on builds. */
export const PART_LABEL: Readonly<Record<Part, string>> = {
  heading: 'The heading is an <h3>',
  list: 'The list is a <ul> of <li>',
  labels: 'Each field has a <label for>',
  headers: 'The table is a <table> with <th>',
};

/** How the live region names each part. */
const PART_WORD: Readonly<Record<Part, string>> = {
  heading: 'heading',
  list: 'list',
  labels: 'labels',
  headers: 'table headers',
};

/** The parts in their fixed order, without repeats. */
export const ordered = (parts: readonly Part[]): Part[] => PART_ORDER.filter((p) => parts.includes(p));

export function structureVerdict({ mock, real }: Structure): Verdict {
  return { criterion: '1.3.1', passes: PARTS[mock].every((p) => real.includes(p)) };
}

/** Which of the mock's parts the log exposes as structure. */
export function structureExposure(
  mock: Mock,
  lines: readonly Announcement[],
): Readonly<Partial<Record<Part, boolean>>> {
  const fields = lines.filter((l) => l.role === 'edit text');
  const found: Record<Part, boolean> = {
    heading: lines.some((l) => l.role === 'heading'),
    list: lines.some((l) => l.role === 'list'),
    labels: fields.length > 0 && fields.every((l) => l.name !== ''),
    headers: lines.some((l) => l.role === 'column header'),
  };
  return Object.fromEntries(PARTS[mock].map((p) => [p, found[p]]));
}

const and = (words: readonly string[]) =>
  words.length === 1 ? words[0]! : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;

/** The live region's sentence after a change: what the log exposes, and what is only styled. */
export function structureSaid(mock: Mock, lines: readonly Announcement[]): string {
  const e = structureExposure(mock, lines);
  const real = PARTS[mock].filter((p) => e[p]).map((p) => PART_WORD[p]);
  const styled = PARTS[mock].filter((p) => !e[p]).map((p) => PART_WORD[p]);
  const parts = [
    real.length ? `In the markup: ${and(real)}.` : '',
    styled.length ? `Only styled: ${and(styled)}.` : 'Nothing is only styled.',
  ];
  return parts.filter(Boolean).join(' ');
}
