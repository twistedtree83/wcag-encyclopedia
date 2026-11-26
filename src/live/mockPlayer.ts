/**
 * The mock player's pure model (#65, CONTEXT.md "Mock player"): a stand-in for a video, drawn
 * from a demo timeline (`src/demo/timeline.ts`) by frame lookup alone. A clip is a `Timeline` of
 * cues; the keyframe's `caption` is what the picture shows (said as text, since the player is
 * silent), and its state is what a hearing viewer hears and what each caption track shows.
 *
 * Everything the player shows is a function of `t`, exactly as for a demo: playing advances `t`,
 * pausing stops it, scrubbing sets it. Lagging captions are the same lookup at `t - lag`. No
 * `<video>`, no `<audio>`, no media file.
 */

import { formatTime, frameAt, type Timeline } from '../demo/timeline';
import type { StageEvent } from './events';

/** Which caption track a clip carries: none, automatic and unchecked, or accurate. */
export type Track = 'none' | 'auto' | 'accurate';

/** One moment of a clip: what is heard, and what each caption track shows for it. */
export type Cue = {
  /** What a hearing viewer hears: speech with its speaker, or a sound. */
  readonly heard: string;
  /** Each track's caption for it. `null` when the track shows nothing (auto drops sounds). */
  readonly captions: { readonly accurate: string | null; readonly auto: string | null };
  /**
   * The description cue for this moment (#66): the visual information the soundtrack leaves
   * out, written into a gap in the dialogue. The player is silent, so a description track shows
   * it on screen. Absent when nothing needs describing.
   */
  readonly described?: string;
};

/**
 * A clip: a timeline of cues. `live` streams can't be scrubbed. An `audioOnly` clip has no
 * picture (a podcast); its keyframe captions say so.
 */
export type Clip = Timeline<Cue> & { readonly live: boolean; readonly audioOnly?: boolean };

/** What a hearing viewer hears at `t`. */
export function heardAt(clip: Clip, t: number): string {
  return frameAt(clip, t).state.heard;
}

/** What the picture shows at `t` (the keyframe's caption). */
export function pictureAt(clip: Clip, t: number): string {
  return frameAt(clip, t).caption;
}

/**
 * The caption on screen at `t`: the track's caption for the cue in effect `lag` seconds ago, or
 * null when the track shows nothing, or the lagging caption hasn't arrived yet.
 */
export function captionAt(clip: Clip, t: number, track: Track, lag = 0): string | null {
  if (track === 'none') return null;
  const at = t - lag;
  if (at < 0) return null;
  return frameAt(clip, at).state.captions[track];
}

/** The description cue at `t`, or null when nothing is described at this moment. */
export function describedAt(clip: Clip, t: number): string | null {
  return frameAt(clip, t).state.described ?? null;
}

/** Whether the clip shows anything the soundtrack doesn't say: anything a description adds. */
export function hasDescription(clip: Clip): boolean {
  return clip.keyframes.some((k) => k.state.described !== undefined);
}

/**
 * A clip as text, one entry per moment, in order (#66): `heard` is a transcript, `shown` is a
 * text description of the picture, and `described` is both, what is shown before what is heard
 * (a described transcript: a full media alternative).
 */
export function transcriptOf(clip: Clip, kind: 'heard' | 'shown' | 'described'): string[] {
  return clip.keyframes.map((k) =>
    kind === 'heard' ? k.state.heard : kind === 'shown' ? k.caption : `[${k.caption}] ${k.state.heard}`,
  );
}

/**
 * What the player shows now, as read from its DOM (`playerSeenIn`), for the stage's events.
 * `at` is whole seconds, so a playing clip changes it once a second, not once a frame.
 */
export type PlayerSeen = {
  readonly at: number;
  readonly playing: boolean;
  readonly heard: string;
  readonly caption: string | null;
  readonly live: boolean;
  /**
   * The description cue on screen (#66): absent when the clip has nothing to describe, null
   * when it has but no cue shows (no description track, or switched off).
   */
  readonly described?: string | null;
};

type PlayerEvent = Extract<StageEvent, { kind: 'player' }>;
const seenOf = (events: readonly StageEvent[]): PlayerSeen[] =>
  events.filter((e): e is PlayerEvent => e.kind === 'player').map((e) => e.seen);

/** The instrument's first line: where the clip is, and whether it plays. */
export function playerNow(events: readonly StageEvent[]): string {
  const all = seenOf(events);
  const now = all[all.length - 1];
  if (!now || (!now.playing && now.at === 0 && !all.some((s) => s.playing))) {
    return 'Paused at 0:00. The clip plays only when you start it.';
  }
  if (now.live && now.playing) return `Live, ${formatTime(now.at)} in.`;
  return `${now.playing ? 'Playing' : 'Paused'} at ${formatTime(now.at)}.`;
}

/** One line of the instrument: the time, what was heard, and the caption shown with it. */
export function playerLine({ at, heard, caption, described }: PlayerSeen): string {
  const quote = (s: string | null) => (s === null ? 'none' : `“${s}”`);
  const line = `${formatTime(at)} Heard: ${heard} Captions: ${quote(caption)}.`;
  return described === undefined ? line : `${line} Described: ${quote(described)}.`;
}

/**
 * The instrument's list: a line each time what is heard or the caption on screen changes,
 * the latest `max`, oldest first. The first is what the paused clip shows before it starts.
 */
export function playerLines(events: readonly StageEvent[], max = 4): string[] {
  const lines: string[] = [];
  let last = '';
  for (const s of seenOf(events)) {
    const key = `${s.heard}\n${s.caption ?? ''}\n${s.described ?? ''}`;
    if (key === last) continue;
    last = key;
    lines.push(playerLine(s));
  }
  return lines.slice(-max);
}
