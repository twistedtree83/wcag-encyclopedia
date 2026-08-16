import { describe, it, expect } from 'vitest';
import {
  frameAt,
  wrap,
  clamp,
  lerp,
  formatTime,
  validateTimeline,
  type Timeline,
} from '../src/demo/timeline';
import { DEMOS } from '../src/demo/registry';
import { reflowTimeline } from '../src/demo/demos/reflow';
import { CORPUS } from '../src/criteria/corpus';

/**
 * The timeline runtime.
 *
 * These tests pin the *interface contract*, not just behaviour. Eight demos will be authored
 * against this, so the properties that matter are purity and single-path rendering: if
 * `frameAt` ever reads a clock, or if a caption can be produced by any route other than the
 * keyframe in effect, the abstraction is broken and every later demo inherits the damage.
 */

type Beat = { label: string };

const demo: Timeline<Beat> = {
  id: 'test',
  title: 'Test timeline',
  duration: 10,
  keyframes: [
    { t: 0, state: { label: 'a' }, caption: 'first' },
    { t: 4, state: { label: 'b' }, caption: 'second' },
    { t: 8, state: { label: 'c' }, caption: 'third' },
  ],
};

describe('frameAt', () => {
  it('is pure — the same timeline and time always give the same frame', () => {
    const a = frameAt(demo, 5);
    const b = frameAt(demo, 5);
    expect(a).toEqual(b);
  });

  it('returns the keyframe in effect, not the nearest one', () => {
    // 7s is closer to the 8s keyframe, but the 4s one is still in effect.
    expect(frameAt(demo, 7).caption).toBe('second');
    expect(frameAt(demo, 7).state.label).toBe('b');
  });

  it('switches exactly on a keyframe boundary', () => {
    expect(frameAt(demo, 3.999).caption).toBe('first');
    expect(frameAt(demo, 4).caption).toBe('second');
  });

  it('takes the caption from the same keyframe as the visual state', () => {
    // Captions cannot desynchronise, because there is only one place they come from.
    for (const t of [0, 2, 4, 6, 8, 10]) {
      const frame = frameAt(demo, t);
      const source = demo.keyframes[frame.index]!;
      expect(frame.caption).toBe(source.caption);
      expect(frame.state).toBe(source.state);
    }
  });

  it('clamps at both ends rather than throwing', () => {
    expect(frameAt(demo, -100).caption).toBe('first');
    expect(frameAt(demo, 999).caption).toBe('third');
  });

  it('reports progress toward the next keyframe, and zero on the last', () => {
    expect(frameAt(demo, 4).progress).toBeCloseTo(0);
    expect(frameAt(demo, 6).progress).toBeCloseTo(0.5);
    expect(frameAt(demo, 9).progress).toBe(0);
  });

  it('throws on a timeline with no keyframes rather than rendering nothing', () => {
    expect(() => frameAt({ ...demo, keyframes: [] }, 0)).toThrow(/no keyframes/);
  });
});

describe('wrap — looping is modulo, not a restart branch', () => {
  it('wraps past the end back to the start', () => {
    expect(wrap(12, 10)).toBeCloseTo(2);
    expect(wrap(20, 10)).toBeCloseTo(0);
  });

  it('handles negative time', () => {
    expect(wrap(-1, 10)).toBeCloseTo(9);
  });

  it('survives a zero duration instead of dividing by it', () => {
    expect(wrap(5, 0)).toBe(0);
  });

  it('makes a looped demo periodic — t and t + duration render identically', () => {
    for (const t of [0, 1.5, 3, 7.25]) {
      expect(frameAt(demo, wrap(t, demo.duration))).toEqual(
        frameAt(demo, wrap(t + demo.duration, demo.duration)),
      );
    }
  });
});

describe('clamp', () => {
  it('bounds into the timeline and treats NaN as the start', () => {
    expect(clamp(-5, 10)).toBe(0);
    expect(clamp(15, 10)).toBe(10);
    expect(clamp(Number.NaN, 10)).toBe(0);
  });
});

describe('lerp and formatTime', () => {
  it('interpolates between authored states', () => {
    expect(lerp(1280, 320, 0)).toBe(1280);
    expect(lerp(1280, 320, 1)).toBe(320);
    expect(lerp(1280, 320, 0.5)).toBe(800);
  });

  it('formats elapsed time in minutes and padded seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(7.9)).toBe('0:07');
    expect(formatTime(65)).toBe('1:05');
  });
});

describe('validateTimeline', () => {
  it('accepts a well-formed timeline', () => {
    expect(validateTimeline(demo)).toEqual([]);
  });

  it('rejects keyframes that do not ascend', () => {
    const bad = { ...demo, keyframes: [demo.keyframes[0]!, demo.keyframes[2]!, demo.keyframes[1]!] };
    expect(validateTimeline(bad).join(' ')).toMatch(/does not follow/);
  });

  it('rejects a timeline that does not start at zero', () => {
    const bad = { ...demo, keyframes: [{ t: 1, state: { label: 'a' }, caption: 'x' }] };
    expect(validateTimeline(bad).join(' ')).toMatch(/must be at t=0/);
  });

  it('rejects a keyframe past the duration', () => {
    const bad = { ...demo, duration: 5 };
    expect(validateTimeline(bad).join(' ')).toMatch(/exceeds duration/);
  });

  it('rejects an empty caption — every keyframe is captioned', () => {
    const bad = { ...demo, keyframes: [{ t: 0, state: { label: 'a' }, caption: '  ' }] };
    expect(validateTimeline(bad).join(' ')).toMatch(/no caption/);
  });
});

describe('the registered demos', () => {
  it('registers at least one demo', () => {
    expect(DEMOS.length).toBeGreaterThan(0);
  });

  it('gives every demo a unique id', () => {
    const ids = DEMOS.map((d) => d.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('points every demo at a criterion the corpus documents', () => {
    for (const entry of DEMOS) {
      const record = CORPUS.find((c) => c.num === entry.criterion);
      expect(record, `demo ${entry.id} names criterion ${entry.criterion}`).toBeDefined();
    }
  });

  it('links every criterion that names a demo to one that is registered', () => {
    for (const record of CORPUS.filter((c) => c.demo)) {
      const entry = DEMOS.find((d) => d.id === record.demo);
      expect(entry, `${record.num} names demo "${record.demo}"`).toBeDefined();
    }
  });
});

describe('the reflow demo', () => {
  it('is a well-formed timeline', () => {
    expect(validateTimeline(reflowTimeline)).toEqual([]);
  });

  it('narrows monotonically — a reflow demo that widens teaches nothing', () => {
    const widths = reflowTimeline.keyframes.map((k) => k.state.width);
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]!, `keyframe ${i}`).toBeLessThan(widths[i - 1]!);
    }
  });

  it('ends at 320px, the width 1.4.10 actually names', () => {
    expect(widthAt(reflowTimeline.duration)).toBe(320);
  });

  it('states breakpoints its captions can honour at every moment they are shown', () => {
    // The caption steps while the width interpolates, so a caption naming one exact width
    // would contradict the ruler moments later. Assert none of them do.
    for (const kf of reflowTimeline.keyframes.slice(0, -1)) {
      expect(kf.caption, `"${kf.caption}"`).not.toMatch(/\bAt \d{3,4}px\b/);
    }
  });
});

function widthAt(t: number): number {
  return frameAt(reflowTimeline, t).state.width;
}
