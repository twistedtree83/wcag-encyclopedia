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
  /**
   * "Read it aloud": the whole example, said from the top. Also a screen reader's own reading out
   * of context: a links or headings list, or a switch to a browser tab.
   */
  | { readonly kind: 'read'; readonly simulated: boolean; readonly lines: readonly Announcement[] }
  /** A live region's text changed and was announced, wherever focus was (4.1.3). */
  | { readonly kind: 'status'; readonly simulated: boolean; readonly line: Announcement }
  /** "Autofill": what a browser put in each field, by the field's name ('' for nothing). */
  | { readonly kind: 'autofill'; readonly simulated: boolean; readonly fields: readonly AutofilledField[] }
  /** "Say what you see": a voice command, and the control it clicked, or null for none. */
  | { readonly kind: 'voice'; readonly simulated: boolean; readonly phrase: string; readonly clicked: Announcement | null }
  /** A key ("Escape") or a dictated phrase sent to the focused control, and what it set off (#45). */
  | {
      readonly kind: 'keys';
      readonly simulated: boolean;
      /** The key's name, or the dictated words. */
      readonly keys: string;
      readonly dictated: boolean;
      /** Where focus was when the keys arrived, or null for no control. */
      readonly target: Announcement | null;
      /** What the example did in response, in order (`didAction` in `actions.ts`). */
      readonly actions: readonly string[];
    }
  /** "Hover": the pointer moved onto a `data-hover` target, named by it, or away (null) (#47). */
  | { readonly kind: 'pointer'; readonly simulated: boolean; readonly on: string | null }
  /** What the example's open tooltips (`role="tooltip"`) say now, or null for none (#47). */
  | { readonly kind: 'popup'; readonly simulated: boolean; readonly text: string | null }
  /** The example's own page (`data-context`) is now `address`, and what moved it there (#47). */
  | { readonly kind: 'context'; readonly simulated: boolean; readonly address: string; readonly cause: ContextCause | null };

/** What the reader last did before the example changed page: moved focus, acted, or hovered. */
export type ContextCause = 'focus' | 'action' | 'pointer';

export type AutofilledField = { readonly name: string; readonly value: string };

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

const keysPhrase = ({ keys, dictated }: Of<'keys'>) =>
  dictated ? `Dictated “${keys}”` : `Pressed ${keys}`;
const focusPhrase = ({ target }: Of<'keys'>) => (target ? spoken(target) || 'blank' : 'no control');

/** The key log's lines for one keys event: the keys, where focus was, then what happened. */
export function keyLines(e: Of<'keys'>): string[] {
  const did = e.actions.length > 0 ? [...e.actions] : ['Nothing happened'];
  return [keysPhrase(e), `Focus: ${focusPhrase(e)}`, ...did];
}

/** What is said after keys arrive: what they set off, each thing once, or that nothing happened. */
export function keysSaid(e: Of<'keys'>): string {
  const did = [...new Set(e.actions)];
  const where = `${e.dictated ? 'with focus on' : 'on'} ${focusPhrase(e)}`;
  return `${keysPhrase(e)} ${where}. ${did.length > 0 ? did.join('. ') : 'Nothing happened'}.`;
}

/** One line of the pointer and tooltip instrument, or null for an event that is not one. */
function pointerLine(e: StageEvent): string | null {
  if (e.kind === 'pointer') return e.on === null ? 'Pointer moves away' : `Pointer on ${e.on}`;
  if (e.kind === 'keys') return keysPhrase(e);
  if (e.kind === 'popup') return e.text === null ? 'Tooltip closes' : `Tooltip shows “${e.text}”`;
  return null;
}

/** The pointer and tooltip instrument's lines (#47): the latest `max`, oldest first. */
export function pointerLog(events: readonly StageEvent[], max = LOG_LINES): string[] {
  return events.flatMap((e) => pointerLine(e) ?? []).slice(-max);
}

/**
 * What is said on a stage with "Hover" after the pointer moves or a key is pressed (#47): that
 * move or key, then what the tooltip did after it. Null when the latest event is not about the
 * pointer. Stages without "Hover" say keys with `keysSaid`.
 */
export function pointerSaid(events: readonly StageEvent[]): string | null {
  const last = events[events.length - 1];
  if (!last || pointerLine(last) === null) return null;
  let from = events.length - 1;
  while (from > 0 && events[from]!.kind === 'popup' && pointerLine(events[from - 1]!) !== null) {
    from -= 1;
  }
  // A tooltip's own text ends in its own full stop.
  return events
    .slice(from)
    .map((e) => `${pointerLine(e)}${e.kind === 'popup' && e.text !== null ? '' : '.'}`)
    .join(' ');
}

const CAUSE: Readonly<Record<ContextCause, string>> = {
  focus: 'on focus alone',
  action: 'after an action',
  pointer: 'after a hover',
};

/** The context instrument's lines (#47): every page the example has shown, and what moved it. */
export function contextLog(events: readonly StageEvent[]): string[] {
  return events.flatMap((e) =>
    e.kind === 'context' ? [e.cause ? `${e.address}, ${CAUSE[e.cause]}` : e.address] : [],
  );
}

/** What is said when the example changes page (#47). Nothing for where it started. */
export function contextSaid({ address, cause }: Of<'context'>): string {
  return cause ? `The example moved to ${address}, ${CAUSE[cause]}.` : '';
}
