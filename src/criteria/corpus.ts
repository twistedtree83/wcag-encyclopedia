/**
 * The corpus — every criterion record the site documents, assembled from the per-guideline
 * modules. Content tasks add a module here; nothing else changes.
 */

import type { CriterionRecord } from './types';
import { G1_1 } from './g1-1';
import { G1_4 } from './g1-4';

export const CORPUS: readonly CriterionRecord[] = [...G1_1, ...G1_4];

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
