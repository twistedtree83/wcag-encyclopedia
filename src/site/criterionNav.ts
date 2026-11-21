/**
 * How a criterion page links onward: the pager and the "Also in" index cards.
 * Both read the corpus, which is already in number order (1.4.10 after 1.4.5, not after 1.4.1).
 */

import { CORPUS } from '../criteria/corpus';
import { principleFor } from '../criteria/structure';
import type { CriterionRecord } from '../criteria/types';

/** The most "Also in" cards a page shows. */
const MAX_RELATED = 6;

/** The previous and next criterion in number order. The first has no prev, the last no next. */
export function neighbours(num: string): { prev?: CriterionRecord; next?: CriterionRecord } {
  const i = CORPUS.findIndex((c) => c.num === num);
  if (i === -1) throw new Error(`neighbours: no criterion ${num}`);
  const prev = CORPUS[i - 1];
  const next = CORPUS[i + 1];
  return { ...(prev ? { prev } : {}), ...(next ? { next } : {}) };
}

/**
 * Up to six other criteria from the same guideline, with the section heading that names them.
 * When the guideline has no others (1.1, 2.3), they come from the same principle instead.
 */
export function related(record: CriterionRecord): {
  heading: string;
  /** False when the cards fell back to the same principle. */
  byGuideline: boolean;
  records: readonly CriterionRecord[];
} {
  const others = CORPUS.filter((c) => c.num !== record.num);
  const siblings = others.filter((c) => c.guideline === record.guideline);
  if (siblings.length > 0) {
    return {
      heading: `Also in guideline ${record.guideline}`,
      byGuideline: true,
      records: siblings.slice(0, MAX_RELATED),
    };
  }
  const principle = principleFor(record.guideline);
  if (!principle) throw new Error(`related: no principle for ${record.num}`);
  return {
    heading: `More from ${principle.name}`,
    byGuideline: false,
    records: others
      .filter((c) => principleFor(c.guideline)?.num === principle.num)
      .slice(0, MAX_RELATED),
  };
}
