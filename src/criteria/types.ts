/**
 * The shape of the corpus.
 *
 * A criterion record is the unit of authoring: one success criterion, its plain-English
 * restatement, and a rendered failing and passing example. Vocabulary follows CONTEXT.md —
 * `criterion`, `restatement`, `example`, `caption`, `diff`, `demo`.
 */

import type { ComponentType, ReactNode } from 'react';

export type Level = 'A' | 'AA' | 'AAA';

/** The WCAG version that introduced a criterion. */
export type Since = '2.0' | '2.1' | '2.2';

/** A rendered piece of interface, plus the one line naming what is wrong or what changed. */
export type Example = {
  /** Real interface, not a description of one. */
  readonly render: () => ReactNode;
  readonly caption: string;
  /**
   * A live version the reader can operate (#43, CONTEXT.md "Live example"). The page pre-renders
   * `render` as always and swaps this in after hydration. Give both `fail` and `pass` one, or
   * neither; the caption must be true of both versions.
   */
  readonly live?: LiveExample;
};

/** A button on a live example's input bar. Add a key on its own line, with its handler in `LiveStage`. */
export type SimKey =
  | 'tab'
  | 'shift-tab'
  | 'enter'
  | 'space'
  | 'read'
  | 'autofill'
  | 'voice';

export type LiveExample = {
  /**
   * The interface itself. On the fail stage it is rendered inert and hidden from assistive
   * technology and operated only by simulated input (ADR 0002); on the pass stage it is real.
   * It may keep its own state (a toggle that toggles). Ids from `useId`.
   */
  readonly Example: ComponentType;
  /** The input bar's buttons, in order. The same on both stages. */
  readonly keys: readonly SimKey[];
  /** Ids of the instruments under the stage (`src/live/instruments.tsx`), in order. */
  readonly instruments: readonly string[];
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
  /**
   * The WCAG version that introduced this criterion. Drives the facts card's "In WCAG since"
   * and the "new in 2.2" filter. Exactly six records are '2.2'.
   */
  readonly since: Since;
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
  /**
   * Ids of the labs (see `src/labs/registry.ts`) the reader can try on this criterion's page,
   * in reading order. A list, like `demos`, because 1.4.3 carries two. Omit rather than leave
   * empty. Labs add to `fail` and `pass`; they never replace them.
   */
  readonly labs?: readonly string[];
};

export type Guideline = {
  readonly num: string;
  readonly name: string;
  readonly principle: 1 | 2 | 3 | 4;
};

export type Principle = {
  readonly num: 1 | 2 | 3 | 4;
  readonly name: string;
  /** The one-line idea shown on the principle's card on Home. */
  readonly tagline: string;
};
