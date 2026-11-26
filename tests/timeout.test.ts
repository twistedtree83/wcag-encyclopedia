import { describe, expect, it } from 'vitest';
import {
  storyOf,
  storyAt,
  storyEnd,
  storySaid,
  timeoutSaid,
  timeoutVerdict,
} from '../src/labs/session-timeout/timeout';
import { searchFromTimeout, timeoutFromSearch } from '../src/labs/session-timeout/timeoutQuery';

/*
 * The 2.2.1 lab's story (#61). Sam needs four minutes to fill in the form and ten seconds to
 * reach a button. Expected beats are worked by hand from the criterion: a warning at least 20
 * seconds before the limit with a simple action to extend, or a limit the reader can turn off or
 * make at least ten times longer.
 */

const at = (beats: readonly { at: number; text: string }[]) => beats.map((b) => [b.at, b.text]);

describe('the 2.2.1 story', () => {
  it('with no warning, the session ends at the limit and the answers are lost', () => {
    expect(at(storyOf({ limit: 120, help: 'none' }))).toEqual([
      [0, 'Sam starts the form'],
      [120, 'The session ends. Sam’s answers are lost'],
    ]);
  });

  it('with a 20 second warning, Sam presses More time each time and sends the form', () => {
    expect(at(storyOf({ limit: 120, help: 'extend' }))).toEqual([
      [0, 'Sam starts the form'],
      [100, 'A warning: 20 seconds left, with More time'],
      [110, 'Sam presses More time'],
      [210, 'A warning: 20 seconds left, with More time'],
      [220, 'Sam presses More time'],
      [240, 'Sam sends the form'],
    ]);
  });

  it('with a 5 second warning, Sam cannot reach the button in time', () => {
    expect(at(storyOf({ limit: 120, help: 'late' }))).toEqual([
      [0, 'Sam starts the form'],
      [115, 'A warning: 5 seconds left, with More time'],
      [120, 'The session ends. Sam’s answers are lost'],
    ]);
  });

  it('a longer limit or no limit lets Sam finish', () => {
    expect(at(storyOf({ limit: 60, help: 'adjust' }))).toEqual([
      [0, 'Sam starts the form'],
      [0, 'Sam makes the limit ten times longer: 10 minutes'],
      [240, 'Sam sends the form'],
    ]);
    expect(at(storyOf({ limit: 60, help: 'off' }))).toEqual([
      [0, 'Sam starts the form'],
      [0, 'Sam turns the time limit off'],
      [240, 'Sam sends the form'],
    ]);
  });

  it('a 5 minute limit with no warning still lets Sam finish, but still fails', () => {
    const state = { limit: 300, help: 'none' } as const;
    expect(at(storyOf(state))).toEqual([
      [0, 'Sam starts the form'],
      [240, 'Sam sends the form'],
    ]);
    expect(timeoutVerdict(state)).toEqual({ criterion: '2.2.1', passes: false });
  });

  it('shows the beats up to the clock, and ends where the last beat is', () => {
    const story = storyOf({ limit: 120, help: 'extend' });
    expect(at(storyAt(story, 105))).toEqual([
      [0, 'Sam starts the form'],
      [100, 'A warning: 20 seconds left, with More time'],
    ]);
    expect(storyEnd(story)).toBe(240);
  });

  it('passes with a 20 second warning, a longer limit or none', () => {
    const passes = (help: 'none' | 'late' | 'extend' | 'adjust' | 'off') =>
      timeoutVerdict({ limit: 120, help }).passes;
    expect(['none', 'late', 'extend', 'adjust', 'off'].map((h) => passes(h as never))).toEqual([
      false,
      false,
      true,
      true,
      true,
    ]);
  });

  it('says the limit, the help and why it passes or fails', () => {
    expect(timeoutSaid({ limit: 120, help: 'none' })).toBe(
      '2 minute limit. No warning. Fails: there is no warning and no way to change the limit.',
    );
    expect(timeoutSaid({ limit: 60, help: 'extend' })).toBe(
      '1 minute limit. Warn 20 seconds ahead. Passes: a 20 second warning, and one action for more time.',
    );
  });
});

describe('what the 2.2.1 lab says as its clock moves', () => {
  const story = storyOf({ limit: 120, help: 'none' });
  it('says what happened since the last move, or that Sam is still at it', () => {
    expect(storySaid(story, 0, 20)).toBe('0:20. Sam is still filling in the form.');
    expect(storySaid(story, 100, 120)).toBe('2:00. The session ends. Sam’s answers are lost.');
    expect(storySaid(story, 120, 120)).toBe('2:00. The session ends. Sam’s answers are lost.');
  });
  it('says nothing for a tick in which nothing happened', () => {
    expect(storySaid(story, 40, 42, true)).toBeNull();
    expect(storySaid(story, 118, 120, true)).toBe('2:00. The session ends. Sam’s answers are lost.');
  });
});

describe('the 2.2.1 URL', () => {
  it('writes nothing for the start, and round-trips every other state', () => {
    expect(searchFromTimeout({ limit: 120, help: 'none' })).toBe('');
    expect(searchFromTimeout({ limit: 60, help: 'extend' })).toBe('?limit=60&help=extend');
    expect(timeoutFromSearch('?limit=60&help=extend')).toEqual({ limit: 60, help: 'extend' });
    expect(timeoutFromSearch('?help=off')).toEqual({ limit: 120, help: 'off' });
  });

  it('ignores what it does not know', () => {
    expect(timeoutFromSearch('')).toBeNull();
    expect(timeoutFromSearch('?limit=7&help=later')).toBeNull();
    expect(timeoutFromSearch('?limit=300&help=later')).toEqual({ limit: 300, help: 'none' });
  });
});
