/**
 * The pointer labs' models (#58): 2.5.1, 2.5.2, 2.5.4 and 2.5.7. Each is a mock the reader
 * switches between a failing and a passing design; 2.5.2 and 2.5.4 also let the reader make the
 * gesture (slide off the button, shake the phone) with a single-press button. The shake is
 * simulated: no device motion sensor is ever read.
 */

import type { Verdict } from '../shared/LabShell';

const end = (passes: boolean) => (passes ? 'Passes.' : 'Fails.');

/* 2.5.1 Pointer Gestures: a map that zooms by pinch only, or by + and − buttons too. */

export type MapLab = { readonly zoom: 'pinch' | 'buttons' };

export const MAP_START: MapLab = { zoom: 'pinch' };

export const MAP_ZOOMS: readonly { readonly value: MapLab['zoom']; readonly label: string }[] = [
  { value: 'pinch', label: 'Pinch only' },
  { value: 'buttons', label: 'Pinch, or the + and − buttons' },
];

export function mapVerdict(s: MapLab): Verdict {
  return { criterion: '2.5.1', passes: s.zoom === 'buttons' };
}

export function mapSaid(s: MapLab): string {
  return s.zoom === 'pinch'
    ? `Pinch only. One finger has no way to zoom. ${end(false)}`
    : `Pinch, or the + and − buttons. One finger can zoom. ${end(true)}`;
}

/* 2.5.2 Pointer Cancellation: Delete draft acts on pointer down, or on pointer up. */

export type CancelLab = {
  readonly fires: 'down' | 'up';
  /** What the last "Press and slide off" did, or null since the setting changed. */
  readonly last: 'deleted' | 'cancelled' | null;
};

export const CANCEL_START: CancelLab = { fires: 'down', last: null };

export const CANCEL_FIRES: readonly { readonly value: CancelLab['fires']; readonly label: string }[] = [
  { value: 'down', label: 'Pointer down' },
  { value: 'up', label: 'Pointer up' },
];

export function cancelVerdict(s: CancelLab): Verdict {
  return { criterion: '2.5.2', passes: s.fires === 'up' };
}

/** Press on Delete draft, slide off it, let go: a down-press has already deleted it. */
export function slideOff(s: CancelLab): CancelLab {
  return { ...s, last: s.fires === 'down' ? 'deleted' : 'cancelled' };
}

export function cancelSaid(s: CancelLab): string {
  if (s.last === 'deleted') {
    return 'Pressed Delete draft and slid off. It was deleted the moment the pointer went down.';
  }
  if (s.last === 'cancelled') return 'Pressed Delete draft and slid off. Nothing was deleted.';
  return `Acts on pointer ${s.fires}. ${end(cancelVerdict(s).passes)}`;
}

/* 2.5.4 Motion Actuation: shake to undo, with or without an Undo button and an off switch. */

export type MotionLab = {
  readonly button: boolean;
  /** Shake to undo: always on (no setting), on (with a setting), or turned off by it. */
  readonly shaking: 'always' | 'on' | 'off';
  /** What the last simulated shake did, or null since a setting changed. */
  readonly last: 'undid' | 'ignored' | null;
};

export const MOTION_START: MotionLab = { button: false, shaking: 'always', last: null };

export const MOTION_BUTTONS: readonly { readonly value: 'none' | 'shown'; readonly label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'shown', label: 'An Undo button' },
];

export const MOTION_SHAKING: readonly { readonly value: MotionLab['shaking']; readonly label: string }[] = [
  { value: 'always', label: 'Always on' },
  { value: 'on', label: 'On, with a setting to turn it off' },
  { value: 'off', label: 'Turned off in settings' },
];

export function motionVerdict(s: MotionLab): Verdict {
  return { criterion: '2.5.4', passes: s.button && s.shaking !== 'always' };
}

export function shake(s: MotionLab): MotionLab {
  return { ...s, last: s.shaking === 'off' ? 'ignored' : 'undid' };
}

export function motionSaid(s: MotionLab): string {
  if (s.last === 'undid') return 'Shook the phone. Undid the archive.';
  if (s.last === 'ignored') return 'Shook the phone. Shake to undo is off, so nothing happened.';
  const button = s.button ? 'An Undo button.' : 'No Undo button.';
  const shaking =
    s.shaking === 'always'
      ? 'Shake to undo is always on.'
      : s.shaking === 'on'
        ? 'Shake to undo is on, and can be turned off.'
        : 'Shake to undo is turned off.';
  return `${button} ${shaking} ${end(motionVerdict(s).passes)}`;
}

/* 2.5.7 Dragging Movements: a sortable list by drag only, or with move up and move down. */

export type DragLab = { readonly reorder: 'drag' | 'buttons' };

export const DRAG_START: DragLab = { reorder: 'drag' };

export const DRAG_REORDERS: readonly { readonly value: DragLab['reorder']; readonly label: string }[] = [
  { value: 'drag', label: 'Dragging only' },
  { value: 'buttons', label: 'Dragging, or move up and move down buttons' },
];

export function dragVerdict(s: DragLab): Verdict {
  return { criterion: '2.5.7', passes: s.reorder === 'buttons' };
}

export function dragSaid(s: DragLab): string {
  return s.reorder === 'drag'
    ? `Dragging only. Without a drag, nothing can be moved. ${end(false)}`
    : `Dragging, or the move up and move down buttons. Each row can be moved with a single tap. ${end(true)}`;
}
