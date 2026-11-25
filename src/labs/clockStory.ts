/**
 * A lab's story on the mock clock (#62): what happens to the lab's person, beat by beat, as the
 * reader waits or runs the clock (`src/live/clock.ts`). The 2.2.2 and 1.4.2 labs use it; the
 * 2.2.1 lab keeps its own (`timeout.ts`), which this generalises.
 */

import { clockTime } from '../live/clock';

export type StoryBeat = {
  readonly at: number;
  readonly text: string;
  /** Set on the last beat: whether it ended badly or well for the lab's person. */
  readonly ends?: 'bad' | 'ok';
};

/** The beats that have happened by mock second `now`. */
export function storyAt(story: readonly StoryBeat[], now: number): StoryBeat[] {
  return story.filter((b) => b.at <= now);
}

/** Where the clock stops: the last beat. */
export function storyEnd(story: readonly StoryBeat[]): number {
  return story[story.length - 1]!.at;
}

/**
 * What is said when the clock moves from `before` to `now`: what happened in between, the ending
 * again if it is over, or `still`. A tick (`quiet`) says only what happened.
 */
export function storySaid(
  story: readonly StoryBeat[],
  before: number,
  now: number,
  still: string,
  quiet = false,
): string | null {
  const t = clockTime(now);
  const happened = story.filter((b) => b.at > before && b.at <= now);
  const last = story[story.length - 1]!;
  if (happened.length > 0) return `${t}. ${happened.map((b) => b.text).join('. ')}.`;
  if (quiet) return null;
  if (now >= last.at) return `${t}. ${last.text}.`;
  return `${t}. ${still}.`;
}
