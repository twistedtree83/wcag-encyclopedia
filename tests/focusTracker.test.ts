import { describe, it, expect } from 'vitest';
import type { StageEvent } from '../src/live/events';
import { TRAIL_STEPS, trackOf, type FocusMap } from '../src/live/focusTrack';

/**
 * The focus tracker (#44): numbered order, the current ring and a trail, read from a stage's
 * events. Simulated and real focus feed it the same way. Expected values are written out by hand.
 */

const line = (name: string) => ({ name, role: 'edit text', states: [], description: '' });
const map: FocusMap = {
  width: 300,
  height: 60,
  stops: [
    { x: 0, y: 10, w: 80, h: 40, label: 'Name, edit text' },
    { x: 100, y: 10, w: 80, h: 40, label: 'Email, edit text' },
    { x: 200, y: 10, w: 80, h: 40, label: 'Card, edit text' },
  ],
};
const focus = (index: number, simulated = true): StageEvent => ({
  kind: 'focus',
  simulated,
  line: line(['Name', 'Email', 'Card'][index]!),
  index,
  total: 3,
  map,
});

describe('the focus tracker', () => {
  it('shows nothing current and no trail before focus enters', () => {
    const t = trackOf([]);
    expect(t.current).toBeNull();
    expect(t.trail).toEqual([]);
    expect(t.map).toBeNull();
  });

  it('follows focus stop by stop, numbering from 1, and keeps the latest map', () => {
    const t = trackOf([focus(0), focus(1), focus(2), focus(0)]);
    expect(t.current).toBe(0);
    expect(t.total).toBe(3);
    expect(t.trail).toEqual([0, 1, 2, 0]);
    expect(t.map?.stops.map((s) => s.label)).toEqual([
      'Name, edit text',
      'Email, edit text',
      'Card, edit text',
    ]);
  });

  it('treats real focus exactly as simulated focus, and ignores other events', () => {
    const events: StageEvent[] = [
      focus(1, false),
      { kind: 'change', simulated: false, line: line('Email') },
      { kind: 'read', simulated: false, lines: [] },
      focus(2, false),
    ];
    expect(trackOf(events).trail).toEqual([1, 2]);
    expect(trackOf(events).current).toBe(2);
  });

  it('does not repeat a stop focus landed on twice in a row', () => {
    expect(trackOf([focus(1), focus(1), focus(2)]).trail).toEqual([1, 2]);
  });

  it('keeps only the latest steps of the trail', () => {
    const many = Array.from({ length: 20 }, (_, i) => focus(i % 3));
    const trail = trackOf(many).trail;
    expect(trail).toHaveLength(TRAIL_STEPS);
    expect(trail[trail.length - 1]).toBe(19 % 3);
  });

  it('starts a new trail when the example’s Tab stops change, as when a dialog closes (#45)', () => {
    const one: StageEvent = {
      kind: 'focus',
      simulated: false,
      line: line('Sign up'),
      index: 0,
      total: 1,
      map: {
        width: 300,
        height: 60,
        stops: [{ x: 0, y: 0, w: 80, h: 40, label: 'Sign up, button' }],
      },
    };
    const t = trackOf([focus(0), focus(1), focus(2), one]);
    expect(t.trail).toEqual([0]);
    expect(t.current).toBe(0);
    expect(t.total).toBe(1);
  });
});
