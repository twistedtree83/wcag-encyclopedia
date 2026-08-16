/**
 * The shape of the corpus.
 *
 * A criterion record is the unit of authoring: one success criterion, its plain-English
 * restatement, and a rendered failing and passing example. Vocabulary follows CONTEXT.md —
 * `criterion`, `restatement`, `example`, `caption`, `diff`, `demo`.
 */

import type { ReactNode } from 'react';

export type Level = 'A' | 'AA' | 'AAA';

/** A rendered piece of interface, plus the one line naming what is wrong or what changed. */
export type Example = {
  /** Real interface, not a description of one. */
  readonly render: () => ReactNode;
  readonly caption: string;
};

export type DiffLine = {
  readonly kind: 'context' | 'del' | 'add';
  readonly text: string;
};

/**
 * A markup or CSS diff, for criteria whose point is code-level. Rendered with `-`/`+` glyphs
 * as well as tint so it reads in greyscale. Owned by T-07.
 */
export type Diff = {
  /** What file or context this diff is in, e.g. 'styles.css, one declaration'. */
  readonly title: string;
  readonly lines: readonly DiffLine[];
  readonly note: string;
};

export type CriterionRecord = {
  /** Dotted triple, e.g. '1.4.3'. Also the URL fragment and the React key. */
  readonly num: string;
  readonly name: string;
  readonly level: Level;
  /** Dotted pair, e.g. '1.4'. Must be `num` minus its last segment. */
  readonly guideline: string;
  /** Plain English. Original prose — never W3C normative text. */
  readonly plain: string;
  readonly fail: Example;
  readonly pass: Example;
  readonly diff?: Diff;
  /**
   * Ids of the demos illustrating this criterion, in the order they should be read. Usually
   * one; 2.4.7 carries two, because seeing the focus ring and its absence back to back is the
   * lesson and neither half teaches it alone.
   */
  readonly demos?: readonly string[];
};

export type Guideline = {
  readonly num: string;
  readonly name: string;
  readonly principle: 1 | 2 | 3 | 4;
};

export type Principle = {
  readonly num: 1 | 2 | 3 | 4;
  readonly name: string;
  /** The one-sentence definition shown on the chapter opener. */
  readonly tagline: string;
  readonly blurb: string;
};
