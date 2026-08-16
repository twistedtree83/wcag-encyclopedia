/**
 * The corpus — every criterion record the site documents, assembled from the per-guideline
 * modules. Content tasks add a module here; nothing else changes.
 */

import type { CriterionRecord } from './types';
import { G1_1 } from './g1-1';
import { G1_2 } from './g1-2';
import { G1_3 } from './g1-3';
import { G1_4 } from './g1-4';
import { G2_1 } from './g2-1';
import { G2_2 } from './g2-2';
import { G2_3 } from './g2-3';
import { G2_4 } from './g2-4';

const AUTHORED = [...G1_1, ...G1_2, ...G1_3, ...G1_4, ...G2_1, ...G2_2, ...G2_3, ...G2_4];

/** Criterion numbers sort numerically, not lexically — 1.4.10 comes after 1.4.9, not after 1.4.1. */
function byNumber(a: CriterionRecord, b: CriterionRecord): number {
  const pa = a.num.split('.').map(Number);
  const pb = b.num.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  }
  return 0;
}

export const CORPUS: readonly CriterionRecord[] = [...AUTHORED].sort(byNumber);

export function criterion(num: string): CriterionRecord | undefined {
  return CORPUS.find((c) => c.num === num);
}

export function criteriaFor(guideline: string): readonly CriterionRecord[] {
  return CORPUS.filter((c) => c.guideline === guideline);
}

/** Guidelines that have at least one authored criterion, in standard order. */
export function populatedGuidelines(): readonly string[] {
  return [...new Set(CORPUS.map((c) => c.guideline))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
}
