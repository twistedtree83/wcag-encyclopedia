/**
 * The gesture pad's model (#57, CONTEXT.md "Instrument"): what a pointer did on a live example.
 * Where a tap aimed, the path the pointer took while down, where it went down and came up, any
 * simulated tilt, and what the example did in response. Pure: the stage takes the snapshot
 * (`GestureEvent`), the pad (`GesturePad` in `instruments.tsx`) draws it.
 *
 * Gestures are made by single-press buttons on the input bar ("Tap"), so the pad itself needs no
 * drag and no path-based gesture (2.5.1, 2.5.7). On the pass stage a real pointer feeds it too.
 * How to reuse it: the L-17 ledger and the gesture-pad note.
 */

import type { FocusMap } from './focusTrack';

export type Point = { readonly x: number; readonly y: number };

/**
 * Which gesture made the event. Add one per line for a new key (a swipe, a press-and-slide).
 */
export type GestureName =
  | 'tap'
  | 'tilt'
  | 'pointer';

export type GestureEvent = {
  readonly kind: 'gesture';
  readonly simulated: boolean;
  readonly gesture: GestureName;
  /** The example's targets (its Tab stops) when it happened, labelled by name. */
  readonly map: FocusMap;
  /** Where a simulated tap aimed, and the target it aimed at; null for a real pointer. */
  readonly aim: Point | null;
  readonly aimAt: number | null;
  /** The pointer's positions from down to up, relative to the example. Empty for a tilt. */
  readonly path: readonly Point[];
  /** The target under the pointer when it went down and when it came up, or null for none. */
  readonly downOn: number | null;
  readonly upOn: number | null;
  /** Degrees the device was tilted, right positive; null when it wasn't. */
  readonly tilt: number | null;
  /** What the example did in response (`didAction`), in order. */
  readonly actions: readonly string[];
};

/** How far a simulated fingertip lands from where it aimed, in CSS pixels. */
export const SLIP_PX = 10;

/** The target under `p`, by index, or null. Boxes include their top and left edges only. */
export function hitAt(map: FocusMap, p: Point): number | null {
  const i = map.stops.findIndex((s) => p.x >= s.x && p.x < s.x + s.w && p.y >= s.y && p.y < s.y + s.h);
  return i < 0 ? null : i;
}

export type TapPlan = { readonly aimAt: number; readonly aim: Point; readonly at: Point };

/**
 * The `n`th simulated tap (from 0): it aims at the centre of each target in turn and lands
 * `SLIP_PX` to the right, then the left, then the right, as a fingertip does. Null with no targets.
 */
export function tapPlan(map: FocusMap, n: number): TapPlan | null {
  if (map.stops.length === 0) return null;
  const aimAt = n % map.stops.length;
  const s = map.stops[aimAt]!;
  const aim = { x: s.x + s.w / 2, y: s.y + s.h / 2 };
  const slip = n % 2 === 0 ? SLIP_PX : -SLIP_PX;
  return { aimAt, aim, at: { x: aim.x + slip, y: aim.y } };
}

const on = (map: FocusMap, i: number | null) => (i === null ? 'nothing' : (map.stops[i]?.label ?? 'nothing'));

export function tiltLine(degrees: number): string {
  return `Tilted ${Math.abs(degrees)}° ${degrees < 0 ? 'left' : 'right'}`;
}

/** The pad's lines for one gesture: the aim, down and up, any tilt, then what it set off. */
export function gestureLines(e: GestureEvent): string[] {
  const lines: string[] = [];
  if (e.aimAt !== null) lines.push(`Aimed at ${on(e.map, e.aimAt)}`);
  if (e.path.length > 0) {
    lines.push(`Pointer down on ${on(e.map, e.downOn)}`, `Pointer up on ${on(e.map, e.upOn)}`);
  }
  if (e.tilt !== null) lines.push(tiltLine(e.tilt));
  lines.push(...(e.actions.length > 0 ? e.actions : ['Nothing happened']));
  return lines;
}

/** What is said after the bar makes a gesture: where the tap aimed and landed, and the outcome. */
export function gestureSaid(e: GestureEvent): string {
  const did = e.actions.length > 0 ? [...new Set(e.actions)].join('. ') : 'Nothing happened';
  const what =
    e.tilt !== null
      ? tiltLine(e.tilt)
      : `Tap aimed at ${on(e.map, e.aimAt)}, landed on ${on(e.map, e.downOn)}`;
  return `${what}. ${did}.`;
}
