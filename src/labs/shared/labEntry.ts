import type { ReactNode } from 'react';

/** The shape of a lab's registration: what each `src/labs/<lab>/lab.ts` default-exports. */

export type LabProps = {
  /** The number of the criterion page showing the lab, e.g. "1.4.11". */
  readonly criterion: string;
};

/**
 * "How to use this lab": the four steps the lab shell shows above every lab on a criterion page,
 * as an ordered list. Plain sentences in the site's voice, naming each control by its visible
 * label, so a reader knows what to do before they touch anything.
 */
export type LabSteps = {
  /** 1. What the reader is trying to do: "Reach the VAT invoices page from Home." */
  readonly goal: string;
  /** 2. What each control changes, by its visible label. */
  readonly controls: string;
  /** 3. What to try: the changes that cross the line between pass and fail. */
  readonly tryThis: string;
  /** 4. What to look for, and what it means: when the criterion passes, when it fails, and why. */
  readonly result: string;
};

export type LabEntry = {
  readonly id: string;
  /** The section heading the lab is shown under, e.g. "Try it: fade the text". */
  readonly title: string;
  /** How to use the lab, shown by the lab shell above it. Every lab has them. */
  readonly steps: LabSteps;
  /**
   * The criteria whose pages show the lab: exactly the records whose `labs` name this id. The
   * record's list sets the order on its page; the data-integrity test holds the two equal.
   */
  readonly criteria: readonly string[];
  /**
   * Renders the lab. Must be SSR-safe and prefix its ids, since a page may show it twice.
   * `criterion` is the page it is on, for a lab shown on more than one criterion.
   */
  readonly Lab: (props: LabProps) => ReactNode;
  /**
   * Set on a flagship lab (CONTEXT.md): the criterion it is the flagship for. Exactly ten
   * criteria have one, and the data-integrity test holds the list.
   */
  readonly flagshipFor?: string;
};

/** A lab folder's `lab.ts` module: one lab, or the few that share one component file. */
export type LabModule = { readonly default: LabEntry | readonly LabEntry[] };
