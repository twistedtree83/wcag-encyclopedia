import { describe, it, expect } from 'vitest';
import { validateTimeline } from '../src/demo/timeline';
import {
  captionAt,
  heardAt,
  playerLines,
  playerNow,
  type Clip,
  type PlayerSeen,
} from '../src/live/mockPlayer';
import type { StageEvent } from '../src/live/events';
import {
  BRIEFING,
  ALL_HANDS,
  LAG_S,
  liveCaptionVerdict,
  liveTrack,
  trackVerdict,
} from '../src/labs/captions';

/**
 * The mock player's pure parts (#65): which line the clip plays and which caption shows at a
 * time, by frame lookup on the timeline runtime. Expected values are written out from the clip
 * scripts, never recomputed.
 */

const clip: Clip = {
  id: 'test-clip',
  title: 'Test clip',
  duration: 10,
  live: false,
  keyframes: [
    { t: 0, caption: 'A desk.', state: { heard: 'A chime.', captions: { accurate: '[Chime]', auto: null } } },
    {
      t: 4,
      caption: 'Ada looks up.',
      state: { heard: 'Ada: “Ship it Friday.”', captions: { accurate: '[Ada] Ship it Friday.', auto: 'ship it fry day' } },
    },
  ],
};

describe('captionAt', () => {
  it('shows the accurate caption of the line in effect', () => {
    expect(captionAt(clip, 0, 'accurate')).toBe('[Chime]');
    expect(captionAt(clip, 5.5, 'accurate')).toBe('[Ada] Ship it Friday.');
  });

  it('shows the automatic caption, which may drop a sound altogether', () => {
    expect(captionAt(clip, 1, 'auto')).toBeNull();
    expect(captionAt(clip, 4, 'auto')).toBe('ship it fry day');
  });

  it('shows nothing for a clip with no captions', () => {
    expect(captionAt(clip, 5, 'none')).toBeNull();
  });

  it('lags: shows the line from `lag` seconds ago, and nothing before it arrives', () => {
    expect(captionAt(clip, 3, 'accurate', 4)).toBeNull();
    expect(captionAt(clip, 6, 'accurate', 4)).toBe('[Chime]');
    expect(captionAt(clip, 8, 'accurate', 4)).toBe('[Ada] Ship it Friday.');
  });
});

describe('heardAt', () => {
  it('is what a hearing viewer hears at a time', () => {
    expect(heardAt(clip, 3.9)).toBe('A chime.');
    expect(heardAt(clip, 4)).toBe('Ada: “Ship it Friday.”');
  });
});

const seen = (p: Partial<PlayerSeen>): StageEvent => ({
  kind: 'player',
  simulated: true,
  seen: { at: 0, playing: false, heard: 'A chime.', caption: null, live: false, ...p },
});

describe('the mock player instrument', () => {
  it('says the clip waits for the reader before anything has played', () => {
    expect(playerNow([])).toBe('Paused at 0:00. The clip plays only when you start it.');
    expect(playerNow([seen({})])).toBe('Paused at 0:00. The clip plays only when you start it.');
  });

  it('says where the clip is and whether it is playing', () => {
    expect(playerNow([seen({}), seen({ playing: true, at: 3 })])).toBe('Playing at 0:03.');
    expect(playerNow([seen({ playing: true, at: 3 }), seen({ at: 7 })])).toBe('Paused at 0:07.');
  });

  it('a live stream is live, not at a position', () => {
    expect(playerNow([seen({ playing: true, at: 9, live: true })])).toBe('Live, 0:09 in.');
  });

  it('lists each line heard with the caption shown, once per change, latest four', () => {
    const events = [
      seen({}),
      seen({ playing: true, at: 0, caption: '[Chime]' }),
      seen({ playing: true, at: 1, caption: '[Chime]' }),
      seen({ playing: true, at: 4, heard: 'Ada: “Ship it Friday.”', caption: 'ship it fry day' }),
      seen({ playing: true, at: 5, heard: 'Ada: “Ship it Friday.”', caption: null }),
    ];
    expect(playerLines(events)).toEqual([
      '0:00 Heard: A chime. Captions: none.',
      '0:00 Heard: A chime. Captions: “[Chime]”.',
      '0:04 Heard: Ada: “Ship it Friday.” Captions: “ship it fry day”.',
      '0:05 Heard: Ada: “Ship it Friday.” Captions: none.',
    ]);
  });
});

describe('the caption clips', () => {
  it.each([BRIEFING, ALL_HANDS])('$id is a valid timeline', (c) => {
    expect(validateTimeline(c)).toEqual([]);
  });

  it('the briefing’s automatic captions garble the words that matter', () => {
    expect(captionAt(BRIEFING, 3, 'auto')).toBe('were going to deploy the pack age on fry day');
    expect(captionAt(BRIEFING, 3, 'accurate')).toBe('[Priya] We’re going to deploy the package on Friday.');
  });
});

describe('the 1.2.2 lab', () => {
  it('passes only with accurate captions', () => {
    expect(trackVerdict('accurate')).toEqual({ criterion: '1.2.2', passes: true });
    expect(trackVerdict('auto')).toEqual({ criterion: '1.2.2', passes: false });
    expect(trackVerdict('none')).toEqual({ criterion: '1.2.2', passes: false });
  });
});

describe('the 1.2.4 lab', () => {
  it('passes only with captions in step', () => {
    expect(liveCaptionVerdict('in-step').passes).toBe(true);
    expect(liveCaptionVerdict('lagging').passes).toBe(false);
    expect(liveCaptionVerdict('missing').passes).toBe(false);
  });

  it('lagging captions are a whole line behind the speaker', () => {
    expect(LAG_S).toBe(6);
    const { track, lag } = liveTrack('lagging');
    expect(heardAt(ALL_HANDS, 12)).toBe('CEO: “Questions go in the chat now.”');
    expect(captionAt(ALL_HANDS, 12, track, lag)).toBe('[CEO] The hiring freeze lifts in March.');
    const inStep = liveTrack('in-step');
    expect(captionAt(ALL_HANDS, 12, inStep.track, inStep.lag)).toBe('[CEO] Questions go in the chat now.');
    expect(captionAt(ALL_HANDS, 12, liveTrack('missing').track)).toBeNull();
  });
});
