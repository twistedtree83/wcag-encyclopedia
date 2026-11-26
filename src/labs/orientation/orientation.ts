/**
 * 1.3.4 Orientation (#55): a phone drawn in the zoom frame, held upright or on its side, showing
 * a page that either adapts to both or is locked to one. A page locked to one way up hides its
 * content and asks to be turned back when it is held the other way.
 *
 * The verdict fails whenever the page is locked, even while it is held the way it allows: the
 * reader who cannot turn their phone is locked out either way. What the frame shows follows the
 * way up (`hides`), and e2e checks the frame's own CSS agrees.
 */

import type { Verdict } from '../shared/LabShell';
import { viewportAt, type Viewport } from '../shared/zoom';

/** A phone held upright, in CSS pixels. The zoom frame's `turned` puts it on its side. */
export const PHONE: Viewport = { width: 360, height: 640 };

export type Turn = 'portrait' | 'landscape';
export type Lock = 'adapts' | 'portrait' | 'landscape';

export const TURNS: readonly { readonly value: Turn; readonly label: string }[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
];

export const LOCKS: readonly { readonly value: Lock; readonly label: string }[] = [
  { value: 'adapts', label: 'Adapts' },
  { value: 'portrait', label: 'Locked to portrait' },
  { value: 'landscape', label: 'Locked to landscape' },
];

export type Orientation = { readonly turn: Turn; readonly lock: Lock };

export const ORIENTATION_START: Orientation = { turn: 'portrait', lock: 'adapts' };

/** The phone's window held this way up. */
export function phoneAt(turn: Turn): Viewport {
  return viewportAt(100, PHONE, turn === 'landscape');
}

/** Whether the page hides its content: it is locked, and held the other way. */
export function hides({ turn, lock }: Orientation): boolean {
  return lock !== 'adapts' && lock !== turn;
}

export function orientationVerdict({ lock }: Orientation): Verdict {
  return { criterion: '1.3.4', passes: lock === 'adapts' };
}

const label = <T extends string>(list: readonly { value: T; label: string }[], v: T) =>
  list.find((o) => o.value === v)!.label;

/** The window, said: "Landscape: 640 by 360 CSS pixels". */
export function windowLine(turn: Turn): string {
  const { width, height } = phoneAt(turn);
  return `${label(TURNS, turn)}: ${width} by ${height} CSS pixels`;
}

/** What the page does held this way up. */
export function contentLine(state: Orientation): string {
  if (hides(state)) return 'Content hidden: the page asks to be turned back';
  if (state.lock !== 'adapts') return 'Content shown, but only this way up';
  return 'Content shown';
}

export function orientationSaid(state: Orientation): string {
  const { width, height } = phoneAt(state.turn);
  const shown = hides(state)
    ? 'hidden'
    : state.lock === 'adapts'
      ? 'shown'
      : 'shown only this way up';
  return `${label(TURNS, state.turn)}, ${width} by ${height} CSS pixels. ${label(LOCKS, state.lock)}: the content is ${shown}.`;
}
