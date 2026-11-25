import { createContext, useContext, useEffect, useRef } from 'react';
import type { StageEvent } from './events';

/**
 * The clock (#61, CONTEXT.md "Instrument"): mock time for a lab or a live example, never the
 * reader's real session. It never runs on page load. It advances only when the reader presses
 * "Wait 20 seconds", or while they have started it with "Run the clock"; it stops itself at
 * `end`. Reduced motion changes nothing here: it is paused until started either way, and the
 * global motion rules make every state change it causes instant.
 *
 *   Clock          `{ now, running }`, mock seconds since the start
 *   waited/ticked  pure steps; `useTicker` calls `onTick` every TICK_MS while running
 *   ClockNow       context: a live example reads the stage's mock time with `useClockNow()`
 */

export type Clock = { readonly now: number; readonly running: boolean };

export const CLOCK_START: Clock = { now: 0, running: false };

/** How far "Wait 20 seconds" moves the clock, in mock seconds. */
export const CLOCK_STEP = 20;

/** A running clock ticks every TICK_MS real milliseconds, by TICK_S mock seconds: ten times real speed. */
export const TICK_MS = 200;
export const TICK_S = 2;

/** Mock seconds as "m:ss". */
export function clockTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const at = (now: number, end: number) => Math.min(end, Math.max(0, now));

/** The clock after "Wait": `by` mock seconds later, never past `end`. A running clock stops at the end. */
export function waited(c: Clock, end: number, by = CLOCK_STEP): Clock {
  const now = at(c.now + by, end);
  return { now, running: c.running && now < end };
}

/** The clock after one tick: unchanged unless it is running. */
export function ticked(c: Clock, end: number): Clock {
  return c.running ? waited(c, end, TICK_S) : c;
}

/** "Run the clock" / "Pause the clock". A clock at its end stays stopped. */
export function toggled(c: Clock, end: number): Clock {
  return { now: c.now, running: !c.running && c.now < end };
}

/** Calls `onTick` every TICK_MS while `running`, and never otherwise. */
export function useTicker(running: boolean, onTick: () => void): void {
  const tick = useRef(onTick);
  tick.current = onTick;
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => tick.current(), TICK_MS);
    return () => window.clearInterval(t);
  }, [running]);
}

/**
 * The stage event for the clock (`StageEvent`): mock time moved, by what, and what the example
 * shows now (its `[data-timer]` text, or null), with what it showed before (`from`).
 */
export type ClockEvent = {
  readonly kind: 'clock';
  readonly simulated: boolean;
  /** What moved it: the bar, a tick, the end, or the example itself changing between moves. */
  readonly cause: 'wait' | 'run' | 'pause' | 'tick' | 'end' | 'example';
  readonly now: number;
  readonly running: boolean;
  readonly shows: string | null;
  readonly from: string | null;
};

const changed = (e: ClockEvent) => e.shows !== e.from;

/**
 * The events with `e` added. A tick that changed nothing replaces the tick before it when that
 * one changed nothing either, so a running clock doesn't crowd out the stage's other events.
 */
export function withClock(events: readonly StageEvent[], e: ClockEvent): StageEvent[] {
  const last = events[events.length - 1];
  const quiet = (x: StageEvent | undefined) => x?.kind === 'clock' && x.cause === 'tick' && !changed(x);
  return quiet(last) && quiet(e) ? [...events.slice(0, -1), e] : [...events, e];
}

const clocks = (events: readonly StageEvent[]) =>
  events.filter((e): e is ClockEvent => e.kind === 'clock');

/** The instrument's sentence: the mock time now, and whether it is running. */
export function clockNowLine(events: readonly StageEvent[]): string {
  const last = clocks(events).pop();
  if (!last) return 'Not started. The clock runs only when you start it.';
  return `Mock time ${clockTime(last.now)}, ${last.running ? 'running' : 'paused'}.`;
}

/** The instrument's list: each time the example changed on the clock, when, and to what. */
export function clockLines(events: readonly StageEvent[]): string[] {
  return clocks(events).flatMap((e) => (changed(e) && e.shows ? [`${clockTime(e.now)} ${e.shows}`] : []));
}

/** What is said when the clock moves: always for the bar's presses, a tick only on a change. */
export function clockSaid(e: ClockEvent): string | null {
  const t = clockTime(e.now);
  const shows = changed(e) && e.shows ? ` ${e.shows}.` : '';
  if (e.cause === 'wait') return `Waited ${CLOCK_STEP} seconds: ${t} has passed.${shows}`;
  if (e.cause === 'run') return 'The clock is running.';
  if (e.cause === 'pause') return `The clock is paused at ${t}.`;
  if (e.cause === 'end') return `The clock stopped at ${t}.${shows}`;
  // The reader's own press in the example: their screen reader says what came of it.
  if (e.cause === 'example') return null;
  return shows ? `${t}:${shows}` : null;
}

/** The mock time on a live example's stage. 0 outside a stage with a clock. */
export const ClockNow = createContext(0);

export function useClockNow(): number {
  return useContext(ClockNow);
}
