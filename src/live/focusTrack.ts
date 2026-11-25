/**
 * The focus tracker's model (#44, CONTEXT.md "Instrument"): numbered focus order, the current
 * ring and a trail of where focus has been, read from a stage's `StageEvent`s. Simulated focus
 * (the fail stage's bar) and real focus (the pass stage) feed it alike; it never reads the DOM.
 *
 * Positions come from `FocusMap`, a snapshot the stage takes each time focus lands (`mapOf` in
 * `focus.ts`): every Tab stop's box relative to the example, in Tab order. The view is
 * `FocusTracker` in `instruments.tsx`. How to reuse it: `scripts2/progress/L-04.md`.
 */

import type { StageEvent } from './events';

/** One Tab stop: its box inside the example, in CSS pixels, and what is said when it is focused. */
export type StopBox = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** The spoken line on focus, or "blank" when nothing is said. */
  readonly label: string;
};

/** Every Tab stop in the example, in Tab order, and the example's own size. */
export type FocusMap = {
  readonly width: number;
  readonly height: number;
  readonly stops: readonly StopBox[];
};

export type Track = {
  /** The Tab stop focus is on now (0-based), or null before focus has entered. */
  readonly current: number | null;
  readonly total: number;
  /** Stops focus has visited, oldest first, the latest `TRAIL_STEPS`; no stop twice in a row. */
  readonly trail: readonly number[];
  /** The latest snapshot of where the stops are, or null when no focus event carried one. */
  readonly map: FocusMap | null;
};

/** How many steps the trail keeps. */
export const TRAIL_STEPS = 6;

export function trackOf(events: readonly StageEvent[], steps = TRAIL_STEPS): Track {
  let current: number | null = null;
  let total = 0;
  let map: FocusMap | null = null;
  const trail: number[] = [];
  for (const e of events) {
    if (e.kind !== 'focus') continue;
    // The example's Tab stops changed (a dialog closed, say): the old trail is about stops that
    // are gone, so it starts again (#45).
    if (current !== null && e.total !== total) trail.length = 0;
    current = e.index;
    total = e.total;
    if (e.map) map = e.map;
    if (trail[trail.length - 1] !== e.index) trail.push(e.index);
  }
  return { current, total, trail: trail.slice(-steps), map };
}
