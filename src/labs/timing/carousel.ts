/**
 * The 2.2.2 lab's model (#62): a carousel that starts moving on its own, and what it offers to
 * stop it. Ana reads at 200% zoom and needs ten seconds a slide. 2.2.2 passes when the motion
 * stops by itself within 5 seconds, or the reader can pause, stop or hide it.
 */

import type { Verdict } from '../shared/LabShell';
import type { StoryBeat } from './clockStory';

export type CarouselControl = 'none' | 'pause' | 'stop' | 'hide';
export type CarouselMoves = 'short' | 'loop';
export type Carousel = { readonly control: CarouselControl; readonly moves: CarouselMoves };

export const CAROUSEL_START: Carousel = { control: 'none', moves: 'loop' };

export const CAROUSEL_CONTROLS: readonly { readonly value: CarouselControl; readonly label: string }[] = [
  { value: 'none', label: 'No control' },
  { value: 'pause', label: 'A Pause button' },
  { value: 'stop', label: 'A Stop button' },
  { value: 'hide', label: 'A Hide button' },
];

export const CAROUSEL_MOVES: readonly { readonly value: CarouselMoves; readonly label: string }[] = [
  { value: 'short', label: 'For 4 seconds, then stops' },
  { value: 'loop', label: 'Keeps moving' },
];

/** A new slide every SLIDE mock seconds; Ana reaches a control PRESS seconds in. */
export const SLIDE = 4;
const PRESS = 2;
export const SLIDES: readonly string[] = [
  'Autumn sale: 20% off coats',
  'Free returns until January',
  'New in: rain jackets',
];

const PRESSED: Readonly<Record<Exclude<CarouselControl, 'none'>, string>> = {
  pause: 'Ana presses Pause, the first thing in the carousel. The slides hold still',
  stop: 'Ana presses Stop, the first thing in the carousel. The slides stop for good',
  hide: 'Ana presses Hide, the first thing in the carousel. The carousel is gone',
};

export function carouselStory({ control, moves }: Carousel): StoryBeat[] {
  const beats: StoryBeat[] = [{ at: 0, text: 'The carousel starts moving on its own' }];
  if (control !== 'none') {
    beats.push({ at: PRESS, text: PRESSED[control] });
    beats.push({ at: 12, text: 'Ana reads at her own pace', ends: 'ok' });
  } else if (moves === 'short') {
    beats.push({ at: SLIDE, text: 'Slide 2. The carousel stops by itself, inside 5 seconds' });
    beats.push({ at: 14, text: 'Ana reads at her own pace', ends: 'ok' });
  } else {
    beats.push({ at: SLIDE, text: 'Slide 2, before Ana has finished slide 1' });
    beats.push({ at: 5, text: 'Five seconds have passed, and nothing on the page stops it' });
    beats.push({ at: 2 * SLIDE, text: 'Slide 3' });
    beats.push({ at: 3 * SLIDE, text: 'Slide 1 again. Ana never finishes a slide', ends: 'bad' });
  }
  return beats;
}

/** The slide shown at mock second `now` (from 0), or null once the carousel is hidden. */
export function carouselAt({ control, moves }: Carousel, now: number): number | null {
  if (control !== 'none' && now >= PRESS) return control === 'hide' ? null : slideAt(PRESS);
  if (moves === 'short') return Math.min(1, slideAt(now));
  return slideAt(now);
}

/** The slide an endlessly moving carousel shows at mock second `now`. */
export function slideAt(now: number): number {
  return Math.floor(now / SLIDE) % SLIDES.length;
}

export function carouselVerdict({ control, moves }: Carousel): Verdict {
  return { criterion: '2.2.2', passes: control !== 'none' || moves === 'short' };
}

const WHY: Readonly<Record<Exclude<CarouselControl, 'none'>, string>> = {
  pause: 'the reader can pause it',
  stop: 'the reader can stop it',
  hide: 'the reader can hide it',
};

export function carouselSaid(state: Carousel): string {
  const control = CAROUSEL_CONTROLS.find((o) => o.value === state.control)!.label;
  const moves = CAROUSEL_MOVES.find((o) => o.value === state.moves)!.label;
  const why =
    state.control !== 'none'
      ? `Passes: ${WHY[state.control]}`
      : state.moves === 'short'
        ? 'Passes: it stops by itself inside 5 seconds'
        : 'Fails: it moves for more than 5 seconds and nothing stops it';
  return `${control}. ${moves}. ${why}.`;
}
