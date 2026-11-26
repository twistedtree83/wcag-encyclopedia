import type { ReactNode } from 'react';

/** The shape of a lab's registration: what each `src/labs/<lab>/lab.ts` default-exports. */

export type LabProps = {
  /** The number of the criterion page showing the lab, e.g. "1.4.11". */
  readonly criterion: string;
};

export type LabEntry = {
  readonly id: string;
  /** The section heading the lab is shown under, e.g. "Try it: fade the text". */
  readonly title: string;
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
