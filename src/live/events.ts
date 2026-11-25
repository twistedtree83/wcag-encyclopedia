import type { Announcement } from '../labs/announce';

/**
 * What happens on a live example's stage (#43), as a list of events every instrument under the
 * stage reads. Simulated input (the fail stage's input bar) and real input (keys, pointer and the
 * bar on the pass stage) produce the same events, so one instrument sits under both stages; only
 * `simulated` tells them apart.
 *
 * Events carry snapshots taken when they happened (the line said, the stop's position), never DOM
 * elements, so an instrument's display is a pure function of the list.
 *
 * Adding an event kind for a new instrument: add one member below, on its own line.
 */
export type StageEvent =
  /** Focus landed on Tab stop `index` of `total`. */
  | { readonly kind: 'focus'; readonly simulated: boolean; readonly line: Announcement; readonly index: number; readonly total: number }
  /** The focused control's state changed, e.g. a switch turned off. */
  | { readonly kind: 'change'; readonly simulated: boolean; readonly line: Announcement }
  /** "Read it aloud": the whole example, said from the top. */
  | { readonly kind: 'read'; readonly simulated: boolean; readonly lines: readonly Announcement[] }
  /** A live region's text changed and was announced, wherever focus was (4.1.3). */
  | { readonly kind: 'status'; readonly simulated: boolean; readonly line: Announcement };

/** How many lines the announcement log keeps, so both stages' logs stay the same size. */
export const LOG_LINES = 4;

/** The announcement log's lines for a stage's events: the latest `max`, oldest first. */
export function logOf(events: readonly StageEvent[], max = LOG_LINES): Announcement[] {
  const lines = events.flatMap((e) => {
    if (e.kind === 'read') return [...e.lines];
    if (e.kind === 'focus' || e.kind === 'change' || e.kind === 'status') return [e.line];
    return [];
  });
  return lines.slice(-max);
}
