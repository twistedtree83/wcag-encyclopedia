import { describe, expect, it } from 'vitest';
import { storyAt, storyEnd, storySaid } from '../src/labs/timing/clockStory';
import {
  carouselAt,
  carouselSaid,
  carouselStory,
  carouselVerdict,
} from '../src/labs/timing/carousel';
import { audioSaid, audioStory, audioVerdict, playingAt } from '../src/labs/timing/autoplay';
import { flashFrames, flashSaid, flashVerdict, RATES } from '../src/labs/timing/flashRate';

/*
 * The timing labs (#62). Expected beats and verdicts are worked by hand from the criteria:
 *   2.2.2  moving content that lasts more than 5 seconds needs a pause, stop or hide control
 *   1.4.2  sound that plays for more than 3 seconds needs a pause or volume control
 *   2.3.1  no more than 3 flashes in any one second
 */

const at = (beats: readonly { at: number; text: string }[]) => beats.map((b) => [b.at, b.text]);

describe('a story on the mock clock', () => {
  const story = [
    { at: 0, text: 'It starts' },
    { at: 4, text: 'It moves' },
    { at: 12, text: 'It is over', ends: 'bad' as const },
  ];
  it('shows the beats that have happened, and stops at the last', () => {
    expect(at(storyAt(story, 5))).toEqual([
      [0, 'It starts'],
      [4, 'It moves'],
    ]);
    expect(storyEnd(story)).toBe(12);
  });
  it('says what happened since the last move, or that it is still going', () => {
    expect(storySaid(story, 0, 6, 'Still going')).toBe('0:06. It moves.');
    expect(storySaid(story, 6, 8, 'Still going')).toBe('0:08. Still going.');
    expect(storySaid(story, 6, 8, 'Still going', true)).toBeNull();
    expect(storySaid(story, 12, 12, 'Still going')).toBe('0:12. It is over.');
  });
});

describe('2.2.2: the carousel', () => {
  it('with no control it keeps moving, and Ana never finishes a slide', () => {
    expect(at(carouselStory({ control: 'none', moves: 'loop' }))).toEqual([
      [0, 'The carousel starts moving on its own'],
      [4, 'Slide 2, before Ana has finished slide 1'],
      [5, 'Five seconds have passed, and nothing on the page stops it'],
      [8, 'Slide 3'],
      [12, 'Slide 1 again. Ana never finishes a slide'],
    ]);
    expect(carouselVerdict({ control: 'none', moves: 'loop' })).toEqual({
      criterion: '2.2.2',
      passes: false,
    });
  });

  it('a Pause button first in the page holds it still', () => {
    expect(at(carouselStory({ control: 'pause', moves: 'loop' }))).toEqual([
      [0, 'The carousel starts moving on its own'],
      [2, 'Ana presses Pause, the first thing in the carousel. The slides hold still'],
      [12, 'Ana reads at her own pace'],
    ]);
    expect(carouselVerdict({ control: 'pause', moves: 'loop' }).passes).toBe(true);
    expect(carouselVerdict({ control: 'stop', moves: 'loop' }).passes).toBe(true);
    expect(carouselVerdict({ control: 'hide', moves: 'loop' }).passes).toBe(true);
  });

  it('moving for under 5 seconds passes with no control', () => {
    expect(at(carouselStory({ control: 'none', moves: 'short' }))).toEqual([
      [0, 'The carousel starts moving on its own'],
      [4, 'Slide 2. The carousel stops by itself, inside 5 seconds'],
      [14, 'Ana reads at her own pace'],
    ]);
    expect(carouselVerdict({ control: 'none', moves: 'short' }).passes).toBe(true);
  });

  it('shows the slide the story is on, or nothing once hidden', () => {
    const loop = { control: 'none', moves: 'loop' } as const;
    expect([0, 4, 8, 12].map((t) => carouselAt(loop, t))).toEqual([0, 1, 2, 0]);
    expect(carouselAt({ control: 'pause', moves: 'loop' }, 10)).toBe(0);
    expect(carouselAt({ control: 'none', moves: 'short' }, 10)).toBe(1);
    expect(carouselAt({ control: 'hide', moves: 'loop' }, 1)).toBe(0);
    expect(carouselAt({ control: 'hide', moves: 'loop' }, 2)).toBeNull();
  });

  it('says the choice and why it passes or fails', () => {
    expect(carouselSaid({ control: 'none', moves: 'loop' })).toBe(
      'No control. Keeps moving. Fails: it moves for more than 5 seconds and nothing stops it.',
    );
    expect(carouselSaid({ control: 'stop', moves: 'loop' })).toBe(
      'A Stop button. Keeps moving. Passes: the reader can stop it.',
    );
  });
});

describe('1.4.2: the autoplaying track', () => {
  it('with no control the track drowns out Jo’s screen reader', () => {
    expect(at(audioStory({ control: 'none', track: 'loop' }))).toEqual([
      [0, 'The track starts playing as the page loads'],
      [3, 'Three seconds in, the track is still playing over Jo’s screen reader'],
      [20, 'Jo cannot hear the page and leaves it'],
    ]);
    expect(audioVerdict({ control: 'none', track: 'loop' })).toEqual({
      criterion: '1.4.2',
      passes: false,
    });
  });

  it('a Pause or volume control at the top lets Jo silence it', () => {
    expect(at(audioStory({ control: 'pause', track: 'loop' }))).toEqual([
      [0, 'The track starts playing as the page loads'],
      [1, 'Jo’s first Tab lands on Pause audio, at the top'],
      [2, 'Jo pauses the track. The screen reader is clear again'],
    ]);
    expect(at(audioStory({ control: 'volume', track: 'loop' })).at(-1)).toEqual([
      2,
      'Jo turns the track down to nothing. The screen reader is clear again',
    ]);
    expect(audioVerdict({ control: 'volume', track: 'loop' }).passes).toBe(true);
  });

  it('a track under 3 seconds passes with no control', () => {
    expect(at(audioStory({ control: 'none', track: 'short' }))).toEqual([
      [0, 'The track starts playing as the page loads'],
      [2, 'The track ends by itself, inside 3 seconds. Jo hears the screen reader again'],
    ]);
    expect(audioVerdict({ control: 'none', track: 'short' }).passes).toBe(true);
  });

  it('plays until it is paused, turned down or over', () => {
    expect(playingAt({ control: 'none', track: 'loop' }, 15)).toBe(true);
    expect(playingAt({ control: 'pause', track: 'loop' }, 1)).toBe(true);
    expect(playingAt({ control: 'pause', track: 'loop' }, 2)).toBe(false);
    expect(playingAt({ control: 'none', track: 'short' }, 2)).toBe(false);
  });

  it('says the choice and why it passes or fails', () => {
    expect(audioSaid({ control: 'none', track: 'loop' })).toBe(
      'No control. Plays on a loop. Fails: it plays for more than 3 seconds and nothing on the page stops it.',
    );
    expect(audioSaid({ control: 'pause', track: 'loop' })).toBe(
      'Pause at the top. Plays on a loop. Passes: the reader can pause it.',
    );
  });
});

describe('2.3.1: the flash rate', () => {
  it('passes at up to 3 flashes a second and fails above', () => {
    expect(RATES.map((r) => [r, flashVerdict(r).passes])).toEqual([
      [1, true],
      [2, true],
      [3, true],
      [4, false],
      [8, false],
    ]);
    expect(flashVerdict(4).criterion).toBe('2.3.1');
  });

  it('draws one second as 16 frames, one dark frame per flash', () => {
    expect(flashFrames(1)).toEqual([true, ...Array(15).fill(false)]);
    expect(flashFrames(4).filter(Boolean)).toHaveLength(4);
    expect(flashFrames(8)).toEqual(Array.from({ length: 16 }, (_, i) => i % 2 === 0));
  });

  it('says the rate and the verdict', () => {
    expect(flashSaid(4)).toBe('4 flashes a second. Fails: over the limit of 3 a second.');
    expect(flashSaid(3)).toBe('3 flashes a second. Passes: no more than 3 a second.');
    expect(flashSaid(1)).toBe('1 flash a second. Passes: no more than 3 a second.');
  });
});
