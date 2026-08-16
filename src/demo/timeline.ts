/**
 * The demo runtime.
 *
 * A demo is authored as a declarative timeline: an ordered list of keyframes, each carrying a
 * timestamp, a visual state, and a caption. `frameAt` is a **pure function of time** — the same
 * timeline and the same `t` always yield the same frame, with no reads of the clock, the DOM,
 * or anything else.
 *
 * That purity is the whole design, not a stylistic preference. Everything playback needs
 * reduces to changing `t`:
 *
 *   pause          → stop advancing `t`
 *   scrub          → set `t` directly
 *   loop           → `t` modulo duration
 *   reduced motion → never advance `t`; the scrub bar still works
 *
 * There is therefore exactly one path to the screen: render the frame at `t`. If you find
 * yourself adding a second one — a special case for pausing, an imperative animation, a
 * caption updated separately from the visuals — the abstraction has been broken, and eight
 * other demos are about to inherit the damage. Stop and reconsider instead.
 *
 * Captions live *on* keyframes rather than in a parallel list, so a caption cannot
 * desynchronise from the visual state it describes.
 */

export type Keyframe<S> = {
  /** Seconds from the start. Keyframes are authored in ascending order; the first is at 0. */
  readonly t: number;
  readonly state: S;
  /** What is happening at this moment, in one line. Shown under the demo, always on. */
  readonly caption: string;
};

export type Timeline<S> = {
  readonly id: string;
  /** Human-readable title, used as the player's accessible name. */
  readonly title: string;
  readonly duration: number;
  readonly keyframes: readonly Keyframe<S>[];
};

export type Frame<S> = {
  readonly state: S;
  readonly caption: string;
  /** Index of the keyframe in effect. */
  readonly index: number;
  /**
   * How far `t` has travelled from this keyframe toward the next, 0..1. Lets a demo
   * interpolate smoothly between authored states while the caption still steps. Always 0 on
   * the final keyframe.
   */
  readonly progress: number;
};

/** Wrap a time into [0, duration), for looping. Handles negatives. */
export function wrap(t: number, duration: number): number {
  if (!(duration > 0)) return 0;
  return ((t % duration) + duration) % duration;
}

/** Clamp a time into [0, duration]. */
export function clamp(t: number, duration: number): number {
  if (Number.isNaN(t)) return 0;
  return Math.min(Math.max(t, 0), Math.max(duration, 0));
}

/**
 * The frame in effect at time `t`: the last keyframe whose timestamp has been reached.
 *
 * `t` is clamped, so times outside the timeline resolve to its ends rather than throwing.
 * Callers that want looping wrap first.
 */
export function frameAt<S>(timeline: Timeline<S>, t: number): Frame<S> {
  const { keyframes, duration } = timeline;
  if (keyframes.length === 0) {
    throw new Error(`timeline "${timeline.id}" has no keyframes`);
  }

  const time = clamp(t, duration);

  let index = 0;
  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i]!.t <= time) index = i;
    else break;
  }

  const current = keyframes[index]!;
  const next = keyframes[index + 1];
  const span = next ? next.t - current.t : 0;
  const progress = span > 0 ? Math.min(1, (time - current.t) / span) : 0;

  return { state: current.state, caption: current.caption, index, progress };
}

/** Linear interpolation, for demos that move smoothly between authored states. */
export function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

/** `0:07` — the elapsed/total readout, in tabular figures. */
export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Authoring-time sanity: keyframes ascend, start at zero, and fit inside the duration. */
export function validateTimeline<S>(timeline: Timeline<S>): string[] {
  const problems: string[] = [];
  const { keyframes, duration, id } = timeline;

  if (keyframes.length === 0) problems.push(`${id}: has no keyframes`);
  if (!(duration > 0)) problems.push(`${id}: duration must be positive`);
  if (keyframes[0] && keyframes[0].t !== 0) problems.push(`${id}: first keyframe must be at t=0`);

  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i]!;
    if (kf.caption.trim() === '') problems.push(`${id}: keyframe ${i} has no caption`);
    if (kf.t > duration) problems.push(`${id}: keyframe ${i} at ${kf.t}s exceeds duration`);
    const prev = keyframes[i - 1];
    if (prev && kf.t <= prev.t) {
      problems.push(`${id}: keyframe ${i} at ${kf.t}s does not follow ${prev.t}s`);
    }
  }
  return problems;
}
