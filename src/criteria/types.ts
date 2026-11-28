/**
 * The shape of the corpus.
 *
 * A criterion record is the unit of authoring: one success criterion, its plain-English
 * restatement, and a rendered failing and passing example. Vocabulary follows CONTEXT.md —
 * `criterion`, `restatement`, `example`, `caption`, `diff`, `demo`.
 */

import type { ComponentType, ReactNode } from 'react';
import type { InstrumentId } from '../live/instruments';

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
  | 'voice'
  | 'hover'
  | 'escape'
  | 'dictate'
  | 'switch-tab'
  | 'links'
  | 'headings'
  | 'zoom'
  | 'text-size'
  | 'spacing'
  | 'rotate'
  | 'restyle'
  | 'tap'
  | 'pinch'
  | 'slide-off'
  | 'drag'
  | 'shake'
  | 'vision'
  | 'wait'
  | 'run';

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
  readonly instruments: readonly InstrumentId[];
  /**
   * Fail stage only: draw no ring where simulated focus is. The stage still moves focus and
   * feeds the instruments. For a failure that is the missing ring itself (2.4.7, #44), so the
   * example shows nothing and only the focus tracker knows where focus went.
   */
  readonly hideRing?: boolean;
  /**
   * Draw the example in a zoom frame (#53) with this window at 100%, and let the bar's "Zoom in"
   * key step it through 100%, 200% and 400%. The `zoom-meter` instrument shows what scrolls.
   * "Enlarge text" and "Toggle text spacing" change the text in it instead (#54), and the
   * `text-fit` instrument shows whether any box cuts its text off.
   */
  readonly zoomFrame?: { readonly width: number; readonly height: number };
  /**
   * The stage's mock clock (#61), for the bar's "Wait 20 seconds" and "Run the clock": where it
   * stops, in mock seconds. The example reads the time with `useClockNow()` (`src/live/clock.ts`)
   * and names what it shows in a `data-timer` attribute, for the `clock` instrument.
   */
  readonly clock?: { readonly end: number };
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

/**
 * A common question (CONTEXT.md): one a reader would type into a search box, and a short
 * answer that starts with the answer ("Yes, …", "No, …", "Only when …") before the reason.
 * Plain text, held to docs/WRITING.md by the writing test.
 */
export type CommonQuestion = {
  readonly question: string;
  readonly answer: string;
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
  /**
   * The restatement cut to one short sentence, for the page's description in search results
   * (`src/site/meta.ts`). Only on records whose restatement opens with a sentence too long to
   * share the description with the fail caption; otherwise that first sentence is used.
   * Original prose, like `plain`.
   */
  readonly gist?: string;
  readonly fail: Example;
  readonly pass: Example;
  readonly diff?: Diff;
  /**
   * The test procedure (CONTEXT.md), headed "How to test": the steps a reader follows, in
   * order, to check their own interface against this criterion. Each step is one action and
   * what to look for, as plain text. Three steps at least, each unique in the record
   * (`tests/criteria.test.ts`).
   */
  readonly procedure: readonly string[];
  /**
   * The common questions, headed "Common questions", in reading order. One at least, each
   * question unique in the record.
   */
  readonly questions: readonly CommonQuestion[];
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
