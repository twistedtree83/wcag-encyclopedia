import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp, frameAt, wrap, type Frame, type Timeline } from './timeline';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Playback: the thin shell around `frameAt`.
 *
 * This hook owns exactly one piece of state that matters — `t` — and every control simply
 * changes it. It never renders anything and never touches a frame directly; callers read
 * `frame` and draw it. That is what keeps a single path to the screen.
 *
 * Under `prefers-reduced-motion` the demo does not auto-play and the clock never advances on
 * its own, but scrubbing still works: the reader can step through the whole demo by hand.
 */
export function useTimeline<S>(timeline: Timeline<S>): {
  t: number;
  frame: Frame<S>;
  playing: boolean;
  reducedMotion: boolean;
  toggle: () => void;
  seek: (to: number) => void;
} {
  const reducedMotion = prefersReducedMotion();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const raf = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - last) / 1000;
      last = now;
      // Loop is just modulo — no restart branch, no separate code path.
      setT((prev) => wrap(prev + elapsed, timeline.duration));
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, timeline.duration]);

  const toggle = useCallback(() => setPlaying((p) => !p), []);

  const seek = useCallback(
    (to: number) => {
      // Scrubbing means taking manual control; keeping the clock running would fight the
      // reader's own input.
      setPlaying(false);
      setT(clamp(to, timeline.duration));
    },
    [timeline.duration],
  );

  return { t, frame: frameAt(timeline, t), playing, reducedMotion, toggle, seek };
}
