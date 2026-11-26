/**
 * The 2.2.1 flagship lab's model (#61): a mock session with a time limit, and what the site
 * offers before it ends. Sam needs four minutes to fill in the form and ten seconds to reach a
 * button. The story is what happens to Sam on the mock clock (`src/live/clock.ts`); the verdict
 * is the criterion's, whether or not Sam happens to finish.
 *
 * 2.2.1 passes when the reader can turn the limit off, make it at least ten times longer, or is
 * warned at least 20 seconds before it ends and can extend it with a simple action.
 */

import type { Verdict } from '../shared/LabShell';
import { clockTime } from '../../live/clock';

export type Limit = 60 | 120 | 300;
export type Help = 'none' | 'late' | 'extend' | 'adjust' | 'off';
export type Timeout = { readonly limit: Limit; readonly help: Help };

export const TIMEOUT_START: Timeout = { limit: 120, help: 'none' };

export const LIMITS: readonly { readonly value: Limit; readonly label: string }[] = [
  { value: 60, label: '1 minute' },
  { value: 120, label: '2 minutes' },
  { value: 300, label: '5 minutes' },
];

export const HELPS: readonly { readonly value: Help; readonly label: string }[] = [
  { value: 'none', label: 'No warning' },
  { value: 'late', label: 'Warn 5 seconds ahead' },
  { value: 'extend', label: 'Warn 20 seconds ahead' },
  { value: 'adjust', label: 'Offer a longer limit' },
  { value: 'off', label: 'Offer to turn it off' },
];

/** How long Sam needs for the form, and to reach a button, in mock seconds. */
export const NEEDS = 240;
export const REACTS = 10;

/** How far ahead each warning comes, in seconds. */
const LEAD: Partial<Record<Help, number>> = { late: 5, extend: 20 };

export type Beat = {
  readonly at: number;
  readonly text: string;
  /** Set on the last beat: whether Sam's answers were lost or sent. */
  readonly ends?: 'lost' | 'sent';
};

/** Everything that happens to Sam, in order, until the form is sent or lost. */
export function storyOf({ limit, help }: Timeout): Beat[] {
  const beats: Beat[] = [{ at: 0, text: 'Sam starts the form' }];
  let deadline: number = limit;
  if (help === 'adjust') {
    deadline = limit * 10;
    beats.push({ at: 0, text: `Sam makes the limit ten times longer: ${deadline / 60} minutes` });
  }
  if (help === 'off') {
    deadline = Infinity;
    beats.push({ at: 0, text: 'Sam turns the time limit off' });
  }
  const lead = LEAD[help];
  while (deadline <= NEEDS) {
    if (lead !== undefined) {
      beats.push({ at: deadline - lead, text: `A warning: ${lead} seconds left, with More time` });
      if (lead >= REACTS) {
        const pressed = deadline - lead + REACTS;
        beats.push({ at: pressed, text: 'Sam presses More time' });
        deadline = pressed + limit;
        continue;
      }
    }
    beats.push({ at: deadline, text: 'The session ends. Sam’s answers are lost', ends: 'lost' });
    return beats;
  }
  beats.push({ at: NEEDS, text: 'Sam sends the form', ends: 'sent' });
  return beats;
}

/** The beats that have happened by mock second `now`. */
export function storyAt(story: readonly Beat[], now: number): Beat[] {
  return story.filter((b) => b.at <= now);
}

/** Where the clock stops: the last beat. */
export function storyEnd(story: readonly Beat[]): number {
  return story[story.length - 1]!.at;
}

/**
 * What is said when the lab's clock moves from `before` to `now`: what happened in between, the
 * ending again if it is over, or that Sam is still at it. A tick (`quiet`) says only what happened.
 */
export function storySaid(
  story: readonly Beat[],
  before: number,
  now: number,
  quiet = false,
): string | null {
  const t = clockTime(now);
  const happened = story.filter((b) => b.at > before && b.at <= now);
  const last = story[story.length - 1]!;
  if (happened.length > 0) return `${t}. ${happened.map((b) => b.text).join('. ')}.`;
  if (quiet) return null;
  if (now >= last.at) return `${t}. ${last.text}.`;
  return `${t}. Sam is still filling in the form.`;
}

export function timeoutVerdict({ help }: Timeout): Verdict {
  return { criterion: '2.2.1', passes: help === 'extend' || help === 'adjust' || help === 'off' };
}

const WHY: Readonly<Record<Help, string>> = {
  none: 'there is no warning and no way to change the limit',
  late: 'a 5 second warning is less than the 20 seconds needed',
  extend: 'a 20 second warning, and one action for more time',
  adjust: 'the reader can make the limit ten times longer',
  off: 'the reader can turn the limit off',
};

export function timeoutSaid(state: Timeout): string {
  const help = HELPS.find((h) => h.value === state.help)!.label;
  const verdict = timeoutVerdict(state).passes ? 'Passes' : 'Fails';
  return `${state.limit / 60} minute limit. ${help}. ${verdict}: ${WHY[state.help]}.`;
}
