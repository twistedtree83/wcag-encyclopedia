import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { clamp, formatTime } from '../demo/timeline';
import {
  captionAt,
  heardAt,
  pictureAt,
  playerLines,
  playerNow,
  type Clip,
  type PlayerSeen,
  type Track,
} from './mockPlayer';
import type { InstrumentProps } from './instruments';

/**
 * The mock player (#65): the drawing, its playback hook, the live-example player and its
 * instrument. Named PlayerWindow, not MockPlayer, because macOS's case-insensitive disk would
 * clash it with `mockPlayer.ts`.
 *
 * Playback is the demo runtime's: one number, `t`, and the frame looked up at it. Unlike a demo
 * it never starts on its own, in any motion mode: the reader presses Play. It stops at the end.
 */

/** Playback for a clip: `t` in seconds, advanced only while the reader has it playing. */
export function usePlayer(clip: Clip) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const at = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const next = clamp(at.current + (now - last) / 1000, clip.duration);
      last = now;
      at.current = next;
      setT(next);
      if (next >= clip.duration) setPlaying(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, clip.duration]);

  const seek = useCallback(
    (to: number) => {
      at.current = clamp(to, clip.duration);
      setT(at.current);
    },
    [clip.duration],
  );
  /** Play from where it is, or from the start once it has ended; or pause. */
  const toggle = useCallback(() => {
    if (!playing && at.current >= clip.duration) seek(0);
    setPlaying(!playing);
  }, [playing, clip.duration, seek]);
  const reset = useCallback(() => {
    setPlaying(false);
    seek(0);
  }, [seek]);

  return { t, playing, toggle, seek, reset };
}

/**
 * The player's screen: a badge, the picture (said in words, since the player is silent) and the
 * caption, if one shows. Drawn the same in a lab's inert mock and in a live example.
 */
export function PlayerScreen({
  clip,
  t,
  caption,
}: {
  readonly clip: Clip;
  readonly t: number;
  readonly caption: string | null;
}) {
  return (
    <div className="mplayer__screen">
      <span className="mplayer__badge">{clip.live ? 'Live' : 'Video'}</span>
      <p className="mplayer__picture">{pictureAt(clip, t)}</p>
      {caption !== null ? (
        <p className="mplayer__cc" data-player-cc>
          {caption}
        </p>
      ) : null}
    </div>
  );
}

/** The time readout: "0:03 / 0:15", or "0:03 in" for a live stream. */
export function playerTime(clip: Clip, t: number): string {
  return clip.live ? `${formatTime(t)} in` : `${formatTime(t)} / ${formatTime(clip.duration)}`;
}

/**
 * A live example's player: the screen and real controls. Play/Pause, a Captions button when the
 * clip has a track (on to start), and a position slider unless it is live. On the fail stage it
 * sits inert and the input bar's Tab and Enter press its buttons.
 *
 * DOM contract read by `playerSeenIn`: `[data-player]` with `data-player-at` (whole seconds),
 * `-state` (playing|paused), `-heard`, `-live`; the caption on screen is `[data-player-cc]`.
 */
export function MockPlayer({
  clip,
  track,
  lag = 0,
}: {
  readonly clip: Clip;
  readonly track: Track;
  readonly lag?: number;
}) {
  const id = useId();
  const { t, playing, toggle, seek } = usePlayer(clip);
  const [ccOn, setCcOn] = useState(true);
  const caption = ccOn ? captionAt(clip, t, track, lag) : null;
  const whole = Math.floor(t);

  return (
    <div
      className="mplayer"
      data-player=""
      data-player-at={whole}
      data-player-state={playing ? 'playing' : 'paused'}
      data-player-heard={heardAt(clip, t)}
      data-player-live={clip.live ? 'true' : 'false'}
    >
      <PlayerScreen clip={clip} t={t} caption={caption} />
      <div className="mplayer__bar">
        <button type="button" className="btn o sm" onClick={toggle}>
          {playing ? 'Pause' : 'Play'}
        </button>
        {track !== 'none' ? (
          <button type="button" className="btn o sm" aria-pressed={ccOn} onClick={() => setCcOn(!ccOn)}>
            Captions
          </button>
        ) : null}
        {clip.live ? null : (
          <>
            <label className="sr" htmlFor={`${id}-pos`}>
              Position in {clip.title}
            </label>
            <input
              id={`${id}-pos`}
              className="mplayer__scrub"
              type="range"
              min={0}
              max={clip.duration}
              step={1}
              value={whole}
              aria-valuetext={playerTime(clip, whole)}
              onChange={(e) => seek(Number(e.target.value))}
            />
          </>
        )}
        <span className="mplayer__time">{playerTime(clip, whole)}</span>
      </div>
    </div>
  );
}

/** What the example's player shows now, read from its DOM contract, or null for no player. */
export function playerSeenIn(root: Element): PlayerSeen | null {
  const el = root.querySelector<HTMLElement>('[data-player]');
  if (!el) return null;
  return {
    at: Number(el.dataset.playerAt ?? 0),
    playing: el.dataset.playerState === 'playing',
    heard: el.dataset.playerHeard ?? '',
    caption: el.querySelector('[data-player-cc]')?.textContent ?? null,
    live: el.dataset.playerLive === 'true',
  };
}

/**
 * The mock player instrument: where the clip is, then each line a hearing viewer heard with the
 * caption on screen at the time. Under both stages, so the broken and fixed captions line up.
 */
export function PlayerLog({ id, events }: InstrumentProps) {
  const lines = playerLines(events);
  return (
    <div className="alog mplog">
      <p className="alog__h" id={`${id}-h`}>
        Heard and captioned
      </p>
      <p className="mplog__now">{playerNow(events)}</p>
      {lines.length > 0 ? (
        <ol aria-labelledby={`${id}-h`}>
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
