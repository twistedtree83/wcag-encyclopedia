import { describe, it, expect } from 'vitest';
import type { StageEvent } from '../src/live/events';
import type { FocusMap } from '../src/live/focusTrack';
import { SLIP_PX, between, gestureLines, gestureSaid, hitAt, tapPlan, tiltLine } from '../src/live/gesture';

/**
 * The gesture pad (#57): where a tap aimed, where the pointer went down and came up, and what that
 * set off. Positions are written out by hand for a row of three 16px targets packed edge to edge
 * (the 2.5.8 Broken toolbar) and three 24px targets 4px apart (the Fixed one).
 */

const row = (size: number, gap: number): FocusMap => ({
  width: 3 * size + 2 * gap,
  height: size,
  stops: ['Like', 'Retweet', 'Delete'].map((label, i) => ({
    x: i * (size + gap),
    y: 0,
    w: size,
    h: size,
    label,
  })),
});
const small = row(16, 0);
const big = row(24, 4);

describe('hit testing', () => {
  it('finds the target under a point, and nothing between or beyond targets', () => {
    expect(hitAt(small, { x: 18, y: 8 })).toBe(1);
    expect(hitAt(small, { x: 50, y: 8 })).toBeNull();
    expect(hitAt(big, { x: 26, y: 12 })).toBeNull();
    expect(hitAt(big, { x: 28, y: 12 })).toBe(1);
  });
});

describe('a simulated tap', () => {
  it('aims at each target in turn and slips 10px, right then left', () => {
    expect(SLIP_PX).toBe(10);
    expect(tapPlan(small, 0)).toEqual({ aimAt: 0, aim: { x: 8, y: 8 }, at: { x: 18, y: 8 } });
    expect(tapPlan(small, 1)).toEqual({ aimAt: 1, aim: { x: 24, y: 8 }, at: { x: 14, y: 8 } });
    expect(tapPlan(small, 3)?.aimAt).toBe(0);
  });

  it('lands on the wrong target, or none, when targets are 16px and packed', () => {
    const hits = [0, 1, 2].map((n) => hitAt(small, tapPlan(small, n)!.at));
    expect(hits).toEqual([1, 0, null]);
  });

  it('lands on the target it aimed at when targets are 24px', () => {
    const hits = [0, 1, 2].map((n) => hitAt(big, tapPlan(big, n)!.at));
    expect(hits).toEqual([0, 1, 2]);
  });

  it('has nothing to aim at in an example without targets', () => {
    expect(tapPlan({ width: 10, height: 10, stops: [] }, 0)).toBeNull();
  });
});

const tap = (over: Partial<Extract<StageEvent, { kind: 'gesture' }>> = {}) =>
  ({
    kind: 'gesture',
    simulated: true,
    gesture: 'tap',
    map: small,
    aim: { x: 24, y: 8 },
    aimAt: 1,
    path: [{ x: 34, y: 8 }],
    downOn: 2,
    upOn: 2,
    tilt: null,
    actions: ['Deleted the post'],
    ...over,
  }) as Extract<StageEvent, { kind: 'gesture' }>;

describe('the pad in words', () => {
  it('lists the aim, pointer down and up, and what it set off', () => {
    expect(gestureLines(tap())).toEqual([
      'Aimed at Retweet',
      'Pointer down on Delete',
      'Pointer up on Delete',
      'Deleted the post',
    ]);
  });

  it('says when a tap landed on nothing and did nothing', () => {
    expect(gestureLines(tap({ downOn: null, upOn: null, actions: [] }))).toEqual([
      'Aimed at Retweet',
      'Pointer down on nothing',
      'Pointer up on nothing',
      'Nothing happened',
    ]);
  });

  it('leaves out the aim for a real pointer, which only the reader knows', () => {
    expect(gestureLines(tap({ gesture: 'pointer', aim: null, aimAt: null }))[0]).toBe(
      'Pointer down on Delete',
    );
  });

  it('describes a tilt', () => {
    expect(tiltLine(20)).toBe('Tilted 20° right');
    expect(tiltLine(-15)).toBe('Tilted 15° left');
    expect(gestureLines(tap({ tilt: 20, aim: null, aimAt: null, path: [], downOn: null, upOn: null }))).toEqual([
      'Tilted 20° right',
      'Deleted the post',
    ]);
  });

  it('says a tap that found no target to aim at', () => {
    const none = tap({ map: { width: 80, height: 40, stops: [] }, aim: { x: 40, y: 20 }, aimAt: null, path: [{ x: 40, y: 20 }], downOn: null, upOn: null, actions: [] });
    expect(gestureLines(none)).toEqual(['Pointer down on nothing', 'Pointer up on nothing', 'Nothing happened']);
    expect(gestureSaid(none)).toBe('Tap landed on nothing. Nothing happened.');
  });

  it('speaks a tap the bar made', () => {
    expect(gestureSaid(tap())).toBe('Tap aimed at Retweet, landed on Delete. Deleted the post.');
    expect(gestureSaid(tap({ aimAt: 0, downOn: 0, actions: ['Liked the post'] }))).toBe(
      'Tap aimed at Like, landed on Like. Liked the post.',
    );
    expect(gestureSaid(tap({ downOn: null, actions: [] }))).toBe(
      'Tap aimed at Retweet, landed on nothing. Nothing happened.',
    );
  });
});

/*
 * L-18 (#58): press and slide off (2.5.2), drag (2.5.7), pinch (2.5.1) and shake (2.5.4). Lines
 * written out by hand from the issue's wording.
 */
describe('press, slide, pinch and shake', () => {
  const button: FocusMap = {
    width: 200,
    height: 40,
    stops: [{ x: 0, y: 0, w: 140, h: 32, label: 'Delete draft' }],
  };

  it('puts what fired on the way down between pointer down and pointer up', () => {
    const slide = tap({
      gesture: 'slide',
      map: button,
      aim: { x: 70, y: 16 },
      aimAt: 0,
      path: [
        { x: 70, y: 16 },
        { x: 180, y: 16 },
      ],
      downOn: 0,
      upOn: null,
      early: 1,
      actions: ['Deleted the draft'],
    });
    expect(gestureLines(slide)).toEqual([
      'Aimed at Delete draft',
      'Pointer down on Delete draft',
      'Deleted the draft',
      'Pointer up on nothing',
    ]);
    expect(gestureSaid(slide)).toBe('Pressed Delete draft and slid off onto nothing. Deleted the draft.');
    expect(gestureSaid({ ...slide, early: 0, actions: [] })).toBe(
      'Pressed Delete draft and slid off onto nothing. Nothing happened.',
    );
  });

  it('says where a drag picked up and dropped', () => {
    const rows: FocusMap = {
      width: 200,
      height: 96,
      stops: ['Collect from store', 'Standard delivery', 'Next day'].map((label, i) => ({
        x: 0,
        y: i * 32,
        w: 200,
        h: 32,
        label,
      })),
    };
    const drag = tap({
      gesture: 'drag',
      map: rows,
      aim: { x: 12, y: 16 },
      aimAt: 0,
      path: [
        { x: 12, y: 16 },
        { x: 12, y: 32 },
        { x: 12, y: 50 },
      ],
      downOn: 0,
      upOn: 1,
      actions: ['Moved Collect from store down'],
    });
    expect(gestureLines(drag)).toEqual([
      'Aimed at Collect from store',
      'Pointer down on Collect from store',
      'Pointer up on Standard delivery',
      'Moved Collect from store down',
    ]);
    expect(gestureSaid(drag)).toBe(
      'Dragged Collect from store onto Standard delivery. Moved Collect from store down.',
    );
  });

  it('describes two fingers spreading or pinching, not a pointer down and up', () => {
    const spread = tap({
      gesture: 'pinch',
      aim: { x: 24, y: 8 },
      aimAt: null,
      path: [
        { x: 20, y: 8 },
        { x: 4, y: 8 },
      ],
      path2: [
        { x: 28, y: 8 },
        { x: 44, y: 8 },
      ],
      downOn: null,
      upOn: null,
      actions: ['Zoomed the map to 2×'],
    });
    expect(gestureLines(spread)).toEqual(['Two fingers spread apart', 'Zoomed the map to 2×']);
    expect(gestureSaid(spread)).toBe('Two fingers spread apart. Zoomed the map to 2×.');
    const pinch = {
      ...spread,
      path: [...spread.path].reverse(),
      path2: [...spread.path2!].reverse(),
      actions: [],
    };
    expect(gestureLines(pinch)).toEqual(['Two fingers pinched together', 'Nothing happened']);
  });

  it('moves a simulated pointer in even steps from down to up', () => {
    expect(between({ x: 0, y: 10 }, { x: 40, y: 30 }, 4)).toEqual([
      { x: 0, y: 10 },
      { x: 10, y: 15 },
      { x: 20, y: 20 },
      { x: 30, y: 25 },
      { x: 40, y: 30 },
    ]);
  });

  it('describes a shake', () => {
    const shake = tap({
      gesture: 'shake',
      tilt: 20,
      aim: null,
      aimAt: null,
      path: [],
      downOn: null,
      upOn: null,
      actions: ['Undid the archive'],
    });
    expect(gestureLines(shake)).toEqual(['Shook the phone', 'Undid the archive']);
    expect(gestureSaid(shake)).toBe('Shook the phone. Undid the archive.');
  });
});
