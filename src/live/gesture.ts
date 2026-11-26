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
  | 'pointer'
  | 'slide'
  | 'drag'
  | 'pinch'
  | 'shake';

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
  /** A two-finger gesture's second finger, from down to up (a pinch, #58). */
  readonly path2?: readonly Point[];
  /** The target under the pointer when it went down and when it came up, or null for none. */
  readonly downOn: number | null;
  readonly upOn: number | null;
  /** Degrees the device was tilted, right positive; null when it wasn't. */
  readonly tilt: number | null;
  /** What the example did in response (`didAction`), in order. */
  readonly actions: readonly string[];
  /** How many of `actions` fired on the way down, before the pointer came up (2.5.2, #58). */
  readonly early?: number;
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

/** A simulated pointer's path from `a` to `b` in `steps` even moves, both ends included (#58). */
export function between(a: Point, b: Point, steps: number): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => ({
    x: a.x + ((b.x - a.x) * i) / steps,
    y: a.y + ((b.y - a.y) * i) / steps,
  }));
}

const on = (map: FocusMap, i: number | null) => (i === null ? 'nothing' : (map.stops[i]?.label ?? 'nothing'));

export function tiltLine(degrees: number): string {
  return `Tilted ${Math.abs(degrees)}° ${degrees < 0 ? 'left' : 'right'}`;
}

const apart = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Whether a two-finger gesture spread its fingers apart (true) or pinched them together. */
function spreads(e: GestureEvent): boolean {
  const one = e.path;
  const two = e.path2 ?? [];
  if (one.length === 0 || two.length === 0) return false;
  return apart(one[one.length - 1]!, two[two.length - 1]!) > apart(one[0]!, two[0]!);
}

/** The motion of the device or the fingers, for gestures that are not a pointer down and up. */
function motionLine(e: GestureEvent): string | null {
  if (e.gesture === 'shake') return 'Shook the phone';
  if (e.gesture === 'pinch') return spreads(e) ? 'Two fingers spread apart' : 'Two fingers pinched together';
  if (e.tilt !== null) return tiltLine(e.tilt);
  return null;
}

/**
 * The pad's lines for one gesture: the aim, pointer down, what fired on the way down (2.5.2),
 * pointer up, then what the rest set off. A pinch, a shake or a tilt is said as a motion instead.
 */
export function gestureLines(e: GestureEvent): string[] {
  const lines: string[] = [];
  if (e.aimAt !== null) lines.push(`Aimed at ${on(e.map, e.aimAt)}`);
  const pressed = e.gesture !== 'pinch' && e.path.length > 0;
  const early = pressed ? Math.min(e.early ?? 0, e.actions.length) : 0;
  if (pressed) {
    lines.push(`Pointer down on ${on(e.map, e.downOn)}`, ...e.actions.slice(0, early));
    lines.push(`Pointer up on ${on(e.map, e.upOn)}`);
  }
  const motion = motionLine(e);
  if (motion) lines.push(motion);
  if (e.actions.length === 0) lines.push('Nothing happened');
  else lines.push(...e.actions.slice(early));
  return lines;
}

/** What is said after the bar makes a gesture: what the bar did, and the outcome. */
export function gestureSaid(e: GestureEvent): string {
  const did = e.actions.length > 0 ? [...new Set(e.actions)].join('. ') : 'Nothing happened';
  const motion = motionLine(e);
  let what: string;
  if (motion !== null) what = motion;
  else if (e.gesture === 'slide') what = `Pressed ${on(e.map, e.downOn)} and slid off onto ${on(e.map, e.upOn)}`;
  else if (e.gesture === 'drag') what = `Dragged ${on(e.map, e.downOn)} onto ${on(e.map, e.upOn)}`;
  else if (e.aimAt === null) what = `Tap landed on ${on(e.map, e.downOn)}`;
  else what = `Tap aimed at ${on(e.map, e.aimAt)}, landed on ${on(e.map, e.downOn)}`;
  return `${what}. ${did}.`;
}
