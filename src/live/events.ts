import { spoken, type Announcement } from '../labs/announce';
import type { FocusMap } from './focusTrack';

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
  /** Focus landed on Tab stop `index` of `total`. New fields go one per line. */
  | {
      readonly kind: 'focus';
      readonly simulated: boolean;
      readonly line: Announcement;
      readonly index: number;
      readonly total: number;
      /** Where every Tab stop sat when focus landed, for the focus tracker (#44). */
      readonly map?: FocusMap;
    }
  /** The focused control's state changed, e.g. a switch turned off. */
  | { readonly kind: 'change'; readonly simulated: boolean; readonly line: Announcement }
  /** "Read it aloud": the whole example, said from the top. */
  | { readonly kind: 'read'; readonly simulated: boolean; readonly lines: readonly Announcement[] }
  /** "Autofill": what a browser put in each field, by the field's name ('' for nothing). */
  | { readonly kind: 'autofill'; readonly simulated: boolean; readonly fields: readonly AutofilledField[] }
  /** "Say what you see": a voice command, and the control it clicked, or null for none. */
  | { readonly kind: 'voice'; readonly simulated: boolean; readonly phrase: string; readonly clicked: Announcement | null };

export type AutofilledField = { readonly name: string; readonly value: string };

/** How many lines the announcement log keeps, so both stages' logs stay the same size. */
export const LOG_LINES = 4;

/** The announcement log's lines for a stage's events: the latest `max`, oldest first. */
export function logOf(events: readonly StageEvent[], max = LOG_LINES): Announcement[] {
  const lines = events.flatMap((e) => {
    if (e.kind === 'read') return [...e.lines];
    if (e.kind === 'focus' || e.kind === 'change') return [e.line];
    return [];
  });
  return lines.slice(-max);
}

type Of<K extends StageEvent['kind']> = Extract<StageEvent, { kind: K }>;

/** The latest event of one kind, or undefined. */
export function lastOf<K extends StageEvent['kind']>(
  events: readonly StageEvent[],
  kind: K,
): Of<K> | undefined {
  return [...events].reverse().find((e): e is Of<K> => e.kind === kind);
}

/** What is said after an autofill: how many fields it filled. */
export function autofillSaid({ fields }: Of<'autofill'>): string {
  const filled = fields.filter((f) => f.value !== '').length;
  return `Autofill filled ${filled} of ${fields.length} fields.`;
}

/** What is said after a voice command: what it clicked, or that nothing matched. */
export function voiceSaid({ phrase, clicked }: Of<'voice'>): string {
  const said = `You said “${phrase}”.`;
  return clicked ? `${said} It clicked ${spoken(clicked)}.` : `${said} Nothing matched.`;
}
