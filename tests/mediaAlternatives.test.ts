import { describe, it, expect } from 'vitest';
import { validateTimeline } from '../src/demo/timeline';
import {
  describedAt,
  hasDescription,
  playerLines,
  transcriptOf,
  type Clip,
  type PlayerSeen,
} from '../src/live/mockPlayer';
import type { StageEvent } from '../src/live/events';
import {
  EPISODE,
  SILENT_CLIP,
  FOLD,
  BUDGET,
  ALT_START,
  ALT_OPTIONS,
  altVerdict,
  altSaid,
  DESC_START,
  descVerdict,
  descSaid,
  onlyVerdict,
  onlySaid,
} from '../src/labs/mediaAlternatives';

/**
 * Media alternatives on the mock player (#66): description cues and transcripts for 1.2.1,
 * 1.2.3 and 1.2.5. Expected values are written out from the clip scripts, never recomputed.
 */

const clip: Clip = {
  id: 'test-clip',
  title: 'Test clip',
  duration: 10,
  live: false,
  keyframes: [
    { t: 0, caption: 'A desk.', state: { heard: 'Ada: “Look.”', captions: { accurate: '[Ada] Look.', auto: null } } },
    {
      t: 4,
      caption: 'Ada points at the door.',
      state: {
        heard: 'No one speaks.',
        captions: { accurate: null, auto: null },
        described: 'Ada points at the door.',
      },
    },
  ],
};

describe('description cues', () => {
  it('shows the description cue of the moment in effect, or none between them', () => {
    expect(describedAt(clip, 1)).toBeNull();
    expect(describedAt(clip, 4.5)).toBe('Ada points at the door.');
  });

  it('knows whether a clip has anything to describe', () => {
    expect(hasDescription(clip)).toBe(true);
    expect(hasDescription({ ...clip, keyframes: [clip.keyframes[0]!] })).toBe(false);
  });
});

describe('transcripts', () => {
  it('a transcript is every line heard, in order', () => {
    expect(transcriptOf(clip, 'heard')).toEqual(['Ada: “Look.”', 'No one speaks.']);
  });

  it('a text description is what the picture shows, in order', () => {
    expect(transcriptOf(clip, 'shown')).toEqual(['A desk.', 'Ada points at the door.']);
  });

  it('a described transcript puts what is shown before what is heard at each moment', () => {
    expect(transcriptOf(clip, 'described')).toEqual([
      '[A desk.] Ada: “Look.”',
      '[Ada points at the door.] No one speaks.',
    ]);
  });
});

const seen = (p: Partial<PlayerSeen>): StageEvent => ({
  kind: 'player',
  simulated: false,
  seen: { at: 0, playing: false, heard: 'Ada: “Look.”', caption: null, live: false, ...p },
});

describe('the instrument with description', () => {
  it('adds what was described when the clip has visual information to describe', () => {
    expect(
      playerLines([
        seen({ described: null }),
        seen({ at: 4, heard: 'No one speaks.', described: 'Ada points at the door.' }),
      ]),
    ).toEqual([
      '0:00 Heard: Ada: “Look.” Captions: none. Described: none.',
      '0:04 Heard: No one speaks. Captions: none. Described: “Ada points at the door.”.',
    ]);
  });

  it('adds a line when only the description changes', () => {
    expect(playerLines([seen({ described: null }), seen({ at: 1, described: 'Ada points.' })])).toHaveLength(2);
  });
});

describe('the clips', () => {
  it.each([EPISODE, SILENT_CLIP, FOLD, BUDGET])('$id is a valid timeline', (c) => {
    expect(validateTimeline(c)).toEqual([]);
  });

  it('the episode is audio only and the silent clip makes no sound', () => {
    expect(EPISODE.audioOnly).toBe(true);
    expect(transcriptOf(SILENT_CLIP, 'heard').every((h) => h === 'No sound.')).toBe(true);
  });

  it('the demonstration’s dialogue leaves out what the hands do', () => {
    expect(transcriptOf(FOLD, 'heard')).toContain('Sam: “Then you just do this, and it’s ready.”');
    expect(hasDescription(FOLD)).toBe(true);
    expect(hasDescription(BUDGET)).toBe(true);
  });
});

describe('the 1.2.1 lab', () => {
  it('passes only with both a transcript and a text description', () => {
    expect(onlyVerdict({ transcript: true, description: true })).toEqual({ criterion: '1.2.1', passes: true });
    expect(onlyVerdict({ transcript: false, description: true }).passes).toBe(false);
    expect(onlyVerdict({ transcript: true, description: false }).passes).toBe(false);
  });

  it('says what changed', () => {
    expect(onlySaid('transcript', false)).toBe('The episode has no transcript now.');
    expect(onlySaid('transcript', true)).toBe('The episode has a transcript now.');
    expect(onlySaid('description', false)).toBe('The silent clip has no text description now.');
    expect(onlySaid('description', true)).toBe('The silent clip has a text description now.');
  });
});

describe('the 1.2.3 lab', () => {
  it('passes with a described transcript or a description track, not captions or a plain transcript', () => {
    expect(ALT_START).toBe('alternative');
    expect(ALT_OPTIONS.map((o) => o.value)).toEqual(['captions', 'transcript', 'alternative', 'description']);
    expect(altVerdict('alternative')).toEqual({ criterion: '1.2.3', passes: true });
    expect(altVerdict('description').passes).toBe(true);
    expect(altVerdict('transcript').passes).toBe(false);
    expect(altVerdict('captions').passes).toBe(false);
  });

  it('says what changed', () => {
    expect(altSaid('captions')).toBe('The clip has captions only now.');
    expect(altSaid('transcript')).toBe('The clip has a transcript of the dialogue now.');
    expect(altSaid('alternative')).toBe('The clip has a described transcript now.');
    expect(altSaid('description')).toBe('The clip has an audio description track now.');
  });
});

describe('the 1.2.5 lab', () => {
  it('passes only with the description track', () => {
    expect(DESC_START).toBe('track');
    expect(descVerdict('track')).toEqual({ criterion: '1.2.5', passes: true });
    expect(descVerdict('transcript').passes).toBe(false);
    expect(descVerdict('none').passes).toBe(false);
  });

  it('says what changed', () => {
    expect(descSaid('none')).toBe('The clip has no description now.');
    expect(descSaid('transcript')).toBe('The clip has a described transcript now, but no description track.');
    expect(descSaid('track')).toBe('Description cues are on now.');
  });
});
