import { describe, expect, it } from 'vitest';
import {
  CLOCK_START,
  clockLines,
  clockNowLine,
  clockSaid,
  clockTime,
  ticked,
  toggled,
  waited,
  withClock,
} from '../src/live/clock';
import type { StageEvent } from '../src/live/events';

describe('the clock (#61)', () => {
  it('starts stopped at 0:00', () => {
    expect(CLOCK_START).toEqual({ now: 0, running: false });
    expect(clockTime(CLOCK_START.now)).toBe('0:00');
  });

  it('writes mock time as minutes and seconds', () => {
    expect(clockTime(5)).toBe('0:05');
    expect(clockTime(100)).toBe('1:40');
    expect(clockTime(240)).toBe('4:00');
  });

  it('waits 20 seconds at a time, and stops at the end', () => {
    expect(waited({ now: 0, running: false }, 180)).toEqual({ now: 20, running: false });
    expect(waited({ now: 170, running: false }, 180)).toEqual({ now: 180, running: false });
    expect(waited({ now: 180, running: false }, 180)).toEqual({ now: 180, running: false });
  });

  it('runs only once started, two mock seconds a tick, and stops itself at the end', () => {
    expect(ticked({ now: 0, running: false }, 180)).toEqual({ now: 0, running: false });
    const on = toggled({ now: 0, running: false }, 180);
    expect(on).toEqual({ now: 0, running: true });
    expect(ticked(on, 180)).toEqual({ now: 2, running: true });
    expect(ticked({ now: 178, running: true }, 180)).toEqual({ now: 180, running: false });
    expect(toggled({ now: 40, running: true }, 180)).toEqual({ now: 40, running: false });
  });

  it('cannot be started again once it has reached the end', () => {
    expect(toggled({ now: 180, running: false }, 180)).toEqual({ now: 180, running: false });
  });
});

type ClockEvent = Extract<StageEvent, { kind: 'clock' }>;
const tick = (now: number, shows: string, from = shows): ClockEvent => ({
  kind: 'clock',
  simulated: true,
  cause: 'tick',
  now,
  running: true,
  shows,
  from,
});

describe('the clock instrument (#61)', () => {
  it('says it has not started until the reader starts it', () => {
    expect(clockNowLine([])).toBe('Not started. The clock runs only when you start it.');
    expect(clockLines([])).toEqual([]);
  });

  it('lists what the example showed, and when, each time it changed', () => {
    const events: StageEvent[] = [
      { kind: 'clock', simulated: true, cause: 'wait', now: 20, running: false, shows: 'Form open', from: 'Form open' },
      { kind: 'clock', simulated: true, cause: 'wait', now: 120, running: false, shows: 'Session expired', from: 'Form open' },
    ];
    expect(clockLines(events)).toEqual(['2:00 Session expired']);
    expect(clockNowLine(events)).toBe('Mock time 2:00, paused.');
    expect(clockNowLine([tick(42, 'Form open')])).toBe('Mock time 0:42, running.');
  });

  it('keeps one event for a run of ticks that change nothing', () => {
    let events: StageEvent[] = [];
    events = withClock(events, tick(2, 'Form open'));
    events = withClock(events, tick(4, 'Form open'));
    expect(events).toEqual([tick(4, 'Form open')]);
    events = withClock(events, tick(6, 'Warning', 'Form open'));
    events = withClock(events, tick(8, 'Warning'));
    expect(events).toEqual([tick(4, 'Form open'), tick(6, 'Warning', 'Form open'), tick(8, 'Warning')]);
  });

  it('says a wait, a start, a pause and the end; a tick only when the example changed', () => {
    const e = (cause: ClockEvent['cause'], now: number, shows = 'Form open', from = shows) =>
      ({ ...tick(now, shows, from), cause }) as ClockEvent;
    expect(clockSaid(e('wait', 20))).toBe('Waited 20 seconds: 0:20 has passed.');
    expect(clockSaid(e('wait', 120, 'Session expired', 'Form open'))).toBe(
      'Waited 20 seconds: 2:00 has passed. Session expired.',
    );
    expect(clockSaid(e('run', 20))).toBe('The clock is running.');
    expect(clockSaid(e('pause', 36))).toBe('The clock is paused at 0:36.');
    expect(clockSaid(e('tick', 36))).toBeNull();
    expect(clockSaid(e('tick', 100, 'Warning', 'Form open'))).toBe('1:40: Warning.');
    expect(clockSaid(e('end', 180))).toBe('The clock stopped at 3:00.');
  });

  it('lists a change the example made itself, between moves, without saying it', () => {
    const extended: ClockEvent = {
      ...tick(100, 'Form open, time extended', 'Warning'),
      cause: 'example',
      running: false,
    };
    expect(clockLines([extended])).toEqual(['1:40 Form open, time extended']);
    expect(clockSaid(extended)).toBeNull();
  });
});
