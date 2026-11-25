/**
 * The caption criteria's clips and lab models (#65): 1.2.2 (prerecorded) and 1.2.4 (live).
 *
 *   1.2.2  a recorded briefing, with no captions, automatic ones nobody checked, or accurate
 *          ones. Only accurate captions pass: automatic captions count once someone corrects them.
 *   1.2.4  a live all-hands, with captions in step with the speaker, far behind, or missing. Only
 *          captions in step pass: someone a whole line behind can't take part as it happens.
 *
 * Clips are timelines for the mock player (`src/live/mockPlayer.ts`). Each keyframe's caption
 * is what the picture shows.
 */

import type { Verdict } from './LabShell';
import type { Clip, Track } from '../live/mockPlayer';

export const BRIEFING: Clip = {
  id: 'release-briefing',
  title: 'Release briefing',
  duration: 15,
  live: false,
  keyframes: [
    {
      t: 0,
      caption: 'Priya at her desk, a laptop open in front of her.',
      state: { heard: 'A notification chimes.', captions: { accurate: '[Notification chime]', auto: null } },
    },
    {
      t: 2,
      caption: 'Priya looks up at the camera.',
      state: {
        heard: 'Priya: “We’re going to deploy the package on Friday.”',
        captions: {
          accurate: '[Priya] We’re going to deploy the package on Friday.',
          auto: 'were going to deploy the pack age on fry day',
        },
      },
    },
    {
      t: 6,
      caption: 'She points at a chart behind her.',
      state: {
        heard: 'Priya: “It goes to five per cent of users first.”',
        captions: {
          accurate: '[Priya] It goes to 5% of users first.',
          auto: 'it goes to five purse ant of users fast',
        },
      },
    },
    {
      t: 10,
      caption: 'A red banner appears on the chart.',
      state: { heard: 'An alarm sounds.', captions: { accurate: '[Alarm]', auto: null } },
    },
    {
      t: 12,
      caption: 'Priya smiles and waves it away.',
      state: {
        heard: 'Priya: “That’s the test alarm. Ignore it.”',
        captions: {
          accurate: '[Priya] That’s the test alarm. Ignore it.',
          auto: "that's the test a lamb ignore it",
        },
      },
    },
  ],
};

export const ALL_HANDS: Clip = {
  id: 'all-hands-live',
  title: 'All-hands, live',
  duration: 18,
  live: true,
  keyframes: [
    {
      t: 0,
      caption: 'The CEO walks to a lectern.',
      state: { heard: 'Applause.', captions: { accurate: '[Applause]', auto: null } },
    },
    {
      t: 3,
      caption: 'The CEO at the lectern.',
      state: {
        heard: 'CEO: “Thanks for joining, everyone.”',
        captions: { accurate: '[CEO] Thanks for joining, everyone.', auto: null },
      },
    },
    {
      t: 6,
      caption: 'A slide reads “Hiring”.',
      state: {
        heard: 'CEO: “The hiring freeze lifts in March.”',
        captions: { accurate: '[CEO] The hiring freeze lifts in March.', auto: null },
      },
    },
    {
      t: 10,
      caption: 'The CEO gestures at the chat panel.',
      state: {
        heard: 'CEO: “Questions go in the chat now.”',
        captions: { accurate: '[CEO] Questions go in the chat now.', auto: null },
      },
    },
    {
      t: 15,
      caption: 'The audience applauds.',
      state: { heard: 'Applause.', captions: { accurate: '[Applause]', auto: null } },
    },
  ],
};

/* --- 1.2.2 --------------------------------------------------------------------------------- */

export const TRACKS: readonly { readonly value: Track; readonly label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'auto', label: 'Automatic, never checked' },
  { value: 'accurate', label: 'Accurate, checked' },
];

export const TRACK_START: Track = 'accurate';

export function trackVerdict(track: Track): Verdict {
  return { criterion: '1.2.2', passes: track === 'accurate' };
}

/** What is said when the reader changes the clip's captions. */
export function trackSaid(track: Track): string {
  if (track === 'none') return 'The clip has no captions now.';
  if (track === 'auto') return 'The clip has automatic captions now, never checked.';
  return 'The clip has accurate captions now.';
}

/* --- 1.2.4 --------------------------------------------------------------------------------- */

export type LiveCaptions = 'in-step' | 'lagging' | 'missing';

/** How far behind the speaker lagging captions are, in seconds: a whole line. */
export const LAG_S = 6;

export const LIVE_CAPTIONS: readonly { readonly value: LiveCaptions; readonly label: string }[] = [
  { value: 'in-step', label: 'In step with the speaker' },
  { value: 'lagging', label: `Lagging ${LAG_S} seconds behind` },
  { value: 'missing', label: 'Missing' },
];

export const LIVE_START: LiveCaptions = 'in-step';

/** The caption track and lag for a choice. */
export function liveTrack(c: LiveCaptions): { readonly track: Track; readonly lag: number } {
  if (c === 'missing') return { track: 'none', lag: 0 };
  return { track: 'accurate', lag: c === 'lagging' ? LAG_S : 0 };
}

export function liveCaptionVerdict(c: LiveCaptions): Verdict {
  return { criterion: '1.2.4', passes: c === 'in-step' };
}

export function liveSaid(c: LiveCaptions): string {
  if (c === 'missing') return 'The stream has no captions now.';
  if (c === 'lagging') return `The stream’s captions now arrive ${LAG_S} seconds after the speaker.`;
  return 'The stream’s captions now arrive as the speaker talks.';
}
