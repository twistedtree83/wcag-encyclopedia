/**
 * The media alternative criteria's clips and lab models (#66): 1.2.1, 1.2.3 and 1.2.5.
 *
 *   1.2.1  an audio-only episode needs a transcript; a silent clip needs a text description.
 *          Only both pass.
 *   1.2.3  a demonstration whose dialogue says "this" where the hands do the work. Captions or a
 *          transcript of the dialogue carry the same gap; a described transcript (a media
 *          alternative) or a description track passes.
 *   1.2.5  at AA only the description track passes: description cues written into the gaps in
 *          the dialogue. The player is silent, so the cues are shown on screen.
 *
 * Clips are timelines for the mock player (`src/live/mockPlayer.ts`). Each keyframe's caption is
 * what the picture shows; `described` is the description cue where the picture says more than
 * the soundtrack.
 */

import type { Verdict } from '../shared/LabShell';
import type { Clip } from '../../live/mockPlayer';

const NONE = { accurate: null, auto: null } as const;
const NO_PICTURE = 'No picture: audio only.';

/** 1.2.1: a podcast episode, sound and nothing else. */
export const EPISODE: Clip = {
  id: 'episode-14',
  title: 'Episode 14 — Supply chains',
  duration: 12,
  live: false,
  audioOnly: true,
  keyframes: [
    { t: 0, caption: NO_PICTURE, state: { heard: 'Theme music plays.', captions: NONE } },
    {
      t: 2,
      caption: NO_PICTURE,
      state: { heard: 'Ama: “So the bottleneck was never the factory.”', captions: NONE },
    },
    { t: 5, caption: NO_PICTURE, state: { heard: 'Ama: “It was the paperwork at the port.”', captions: NONE } },
    {
      t: 8,
      caption: NO_PICTURE,
      state: { heard: 'Dele: “And that is where the three weeks went.”', captions: NONE },
    },
  ],
};

/** 1.2.1: a silent clip, pictures and nothing else. The same length as the episode. */
export const SILENT_CLIP: Clip = {
  id: 'silent-assembly',
  title: 'Assembling the shelf, no sound',
  duration: 12,
  live: false,
  keyframes: [
    { t: 0, caption: 'Flat-pack panels laid out on a rug.', state: { heard: 'No sound.', captions: NONE } },
    { t: 3, caption: 'Two hands slot the side panels into the base.', state: { heard: 'No sound.', captions: NONE } },
    { t: 7, caption: 'The shelves click in, top one last.', state: { heard: 'No sound.', captions: NONE } },
    { t: 10, caption: 'The finished shelf stands against the wall.', state: { heard: 'No sound.', captions: NONE } },
  ],
};

/** 1.2.3: a sewing demonstration. Its dialogue says "this"; the hands carry the instruction. */
export const FOLD: Clip = {
  id: 'fold-the-corner',
  title: 'Finishing a corner',
  duration: 12,
  live: false,
  keyframes: [
    {
      t: 0,
      caption: 'Sam holds up a square of fabric with a pinned seam.',
      state: {
        heard: 'Sam: “Here’s the corner we pinned earlier.”',
        captions: { accurate: '[Sam] Here’s the corner we pinned earlier.', auto: null },
      },
    },
    {
      t: 3,
      caption: 'Sam folds the near corner under the seam allowance and presses it flat with a thumb.',
      state: {
        heard: 'Sam: “Then you just do this, and it’s ready.”',
        captions: { accurate: '[Sam] Then you just do this, and it’s ready.', auto: null },
        described: 'Sam folds the near corner under the seam allowance and presses it flat.',
      },
    },
    {
      t: 8,
      caption: 'The finished corner, crisp and square.',
      state: {
        heard: 'Sam: “Easy.”',
        captions: { accurate: '[Sam] Easy.', auto: null },
        described: 'The finished corner lies crisp and square.',
      },
    },
  ],
};

/** 1.2.5: a budget review. The decisions are made with a marker, in silence. */
export const BUDGET: Clip = {
  id: 'budget-review',
  title: 'Budget review',
  duration: 14,
  live: false,
  keyframes: [
    {
      t: 0,
      caption: 'Lena at a whiteboard: a table with three columns, Travel, Events and Training.',
      state: {
        heard: 'Lena: “Here’s where the budget stands.”',
        captions: { accurate: '[Lena] Here’s where the budget stands.', auto: null },
      },
    },
    {
      t: 3,
      caption: 'She crosses out the second column, Events.',
      state: {
        heard: 'A marker squeaks. No one speaks.',
        captions: { accurate: '[Marker squeaks]', auto: null },
        described: 'She crosses out the second column, Events.',
      },
    },
    {
      t: 7,
      caption: 'She circles the Training total: £12,000.',
      state: {
        heard: 'Lena: “So that’s the one we take forward.”',
        captions: { accurate: '[Lena] So that’s the one we take forward.', auto: null },
      },
    },
    {
      t: 10,
      caption: 'Lena caps the marker and steps aside.',
      state: {
        heard: 'No one speaks.',
        captions: NONE,
        described: 'The circled Training total reads £12,000.',
      },
    },
  ],
};

/* --- 1.2.1 --------------------------------------------------------------------------------- */

export type OnlyAlternatives = { readonly transcript: boolean; readonly description: boolean };

export const ONLY_START: OnlyAlternatives = { transcript: true, description: true };

export function onlyVerdict(a: OnlyAlternatives): Verdict {
  return { criterion: '1.2.1', passes: a.transcript && a.description };
}

/** What is said when the reader adds or removes one of the alternatives. */
export function onlySaid(which: keyof OnlyAlternatives, on: boolean): string {
  if (which === 'transcript') return `The episode has ${on ? 'a' : 'no'} transcript now.`;
  return `The silent clip has ${on ? 'a' : 'no'} text description now.`;
}

/* --- 1.2.3 --------------------------------------------------------------------------------- */

export type Alternative = 'captions' | 'transcript' | 'alternative' | 'description';

export const ALT_OPTIONS: readonly { readonly value: Alternative; readonly label: string }[] = [
  { value: 'captions', label: 'Captions only' },
  { value: 'transcript', label: 'Captions and a transcript of the dialogue' },
  { value: 'alternative', label: 'Captions and a described transcript' },
  { value: 'description', label: 'Captions and an audio description track' },
];

export const ALT_START: Alternative = 'alternative';

export function altVerdict(a: Alternative): Verdict {
  return { criterion: '1.2.3', passes: a === 'alternative' || a === 'description' };
}

export function altSaid(a: Alternative): string {
  if (a === 'captions') return 'The clip has captions only now.';
  if (a === 'transcript') return 'The clip has a transcript of the dialogue now.';
  if (a === 'alternative') return 'The clip has a described transcript now.';
  return 'The clip has an audio description track now.';
}

/* --- 1.2.5 --------------------------------------------------------------------------------- */

export type Description = 'none' | 'transcript' | 'track';

export const DESC_OPTIONS: readonly { readonly value: Description; readonly label: string }[] = [
  { value: 'none', label: 'No description' },
  { value: 'transcript', label: 'A described transcript only' },
  { value: 'track', label: 'Description cues, in the gaps' },
];

export const DESC_START: Description = 'track';

export function descVerdict(d: Description): Verdict {
  return { criterion: '1.2.5', passes: d === 'track' };
}

export function descSaid(d: Description): string {
  if (d === 'none') return 'The clip has no description now.';
  if (d === 'transcript') return 'The clip has a described transcript now, but no description track.';
  return 'Description cues are on now.';
}
