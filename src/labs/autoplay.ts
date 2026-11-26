/**
 * The 1.4.2 lab's model (#62): a track that plays as the page loads, and what the page offers
 * to quiet it. The site is silent: the track is a drawn level meter. Jo uses a screen reader,
 * which the track drowns out. 1.4.2 passes when the sound stops within 3 seconds, or a control
 * on the page pauses it or sets its volume apart from the system's.
 */

import type { Verdict } from './LabShell';
import type { StoryBeat } from './clockStory';

export type AudioControl = 'none' | 'pause' | 'volume';
export type AudioTrack = 'short' | 'loop';
export type Autoplay = { readonly control: AudioControl; readonly track: AudioTrack };

export const AUTOPLAY_START: Autoplay = { control: 'none', track: 'loop' };

export const AUDIO_CONTROLS: readonly { readonly value: AudioControl; readonly label: string }[] = [
  { value: 'none', label: 'No control' },
  { value: 'pause', label: 'Pause at the top' },
  { value: 'volume', label: 'Volume at the top' },
];

export const AUDIO_TRACKS: readonly { readonly value: AudioTrack; readonly label: string }[] = [
  { value: 'short', label: 'Plays for 2 seconds' },
  { value: 'loop', label: 'Plays on a loop' },
];

/** When Jo silences it with a control, or the short track ends: mock seconds. */
const QUIET = 2;

export function audioStory({ control, track }: Autoplay): StoryBeat[] {
  const beats: StoryBeat[] = [{ at: 0, text: 'The track starts playing as the page loads' }];
  if (control === 'pause') {
    beats.push({ at: 1, text: 'Jo’s first Tab lands on Pause audio, at the top' });
    beats.push({ at: QUIET, text: 'Jo pauses the track. The screen reader is clear again', ends: 'ok' });
  } else if (control === 'volume') {
    beats.push({ at: 1, text: 'Jo’s first Tab lands on the volume control, at the top' });
    beats.push({
      at: QUIET,
      text: 'Jo turns the track down to nothing. The screen reader is clear again',
      ends: 'ok',
    });
  } else if (track === 'short') {
    beats.push({
      at: QUIET,
      text: 'The track ends by itself, inside 3 seconds. Jo hears the screen reader again',
      ends: 'ok',
    });
  } else {
    beats.push({ at: 3, text: 'Three seconds in, the track is still playing over Jo’s screen reader' });
    beats.push({ at: 20, text: 'Jo cannot hear the page and leaves it', ends: 'bad' });
  }
  return beats;
}

/** Whether the track is still sounding at mock second `now`. */
export function playingAt({ control, track }: Autoplay, now: number): boolean {
  return control === 'none' && track === 'loop' ? true : now < QUIET;
}

export function audioVerdict({ control, track }: Autoplay): Verdict {
  return { criterion: '1.4.2', passes: control !== 'none' || track === 'short' };
}

export function audioSaid(state: Autoplay): string {
  const control = AUDIO_CONTROLS.find((o) => o.value === state.control)!.label;
  const track = AUDIO_TRACKS.find((o) => o.value === state.track)!.label;
  const why =
    state.control === 'pause'
      ? 'Passes: the reader can pause it'
      : state.control === 'volume'
        ? 'Passes: the reader can turn it down without the system volume'
        : state.track === 'short'
          ? 'Passes: it stops by itself inside 3 seconds'
          : 'Fails: it plays for more than 3 seconds and nothing on the page stops it';
  return `${control}. ${track}. ${why}.`;
}

/** The drawn level meter's bar heights at mock second `now`, in percent; flat when silent. */
const LEVELS: readonly (readonly number[])[] = [
  [60, 85, 40, 70, 55],
  [75, 50, 90, 45, 65],
  [50, 70, 60, 85, 40],
];
const SILENT: readonly number[] = [4, 4, 4, 4, 4];

export function levelsAt(playing: boolean, now: number): readonly number[] {
  return playing ? LEVELS[now % LEVELS.length]! : SILENT;
}
