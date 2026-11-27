/**
 * The title and description a criterion page carries in its head (S-02, docs/PRD-seo.md),
 * built from its criterion record so all 55 are different without being written by hand.
 * Pure data, no JSX.
 */

import type { CriterionRecord } from '../criteria/types';

/** Search results cut a title past about this many characters. */
export const TITLE_MAX = 65;
/** Search results cut a description past about this many characters. */
export const DESCRIPTION_MAX = 160;

/**
 * "1.4.3 Contrast (Minimum) explained, with examples | WCAG 2.2 AA", or the longest shorter
 * form that fits for a criterion with a long name. The number and name are always kept.
 */
export function criterionTitle(record: CriterionRecord): string {
  const name = `${record.num} ${record.name}`;
  const version = ` | WCAG 2.2 ${record.level}`;
  const forms = [
    `${name} explained, with examples${version}`,
    `${name} explained${version}`,
    `${name}${version}`,
  ];
  return forms.find((t) => t.length <= TITLE_MAX) ?? name;
}

/**
 * The restatement in one sentence, then the way the criterion fails (the fail example's
 * caption): "Colour can carry meaning, but never on its own. Fails when: hue is the only
 * signal." The sentence is the restatement's first, or the record's `gist` where that first
 * sentence is too long to share the description with the failure.
 */
export function criterionDescription(record: CriterionRecord): string {
  return `${record.gist ?? firstSentence(record.plain)} ${failsWhen(record)}`;
}

/** The restatement's opening sentence. */
export function firstSentence(text: string): string {
  return text.split(/(?<=[.!?]["”]?)\s+/)[0]!.trim();
}

/** "Fails when: hue is the only signal.", from the fail example's caption. */
export function failsWhen(record: CriterionRecord): string {
  const caption = record.fail.caption.trim();
  const ended = /[.!?]["”]?$/.test(caption) ? caption : `${caption}.`;
  // "Hue is…" → "hue is…", but an acronym or a number stays as it is.
  const lowered = /^[A-Z](?![A-Z0-9])/.test(ended) ? ended[0]!.toLowerCase() + ended.slice(1) : ended;
  return `Fails when: ${lowered}`;
}
