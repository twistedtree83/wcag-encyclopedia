import { useId, useState } from 'react';
import { LabChoice } from '../shared/LabChoice';
import { LabShell, type Said } from '../shared/LabShell';
import { PlayerScreen, playerTime, usePlayer } from '../../live/PlayerWindow';
import { captionAt, heardAt, type Clip, type Track } from '../../live/mockPlayer';
import {
  ALL_HANDS,
  BRIEFING,
  LIVE_CAPTIONS,
  LIVE_START,
  TRACKS,
  TRACK_START,
  liveCaptionVerdict,
  liveSaid,
  liveTrack,
  trackSaid,
  trackVerdict,
  type LiveCaptions,
} from './captions';

/**
 * The caption labs (#65), both on the mock player. The reader plays the clip and changes its
 * captions; the readouts say what a hearing viewer hears and what the captions show at the same
 * moment, so a garbled, late or missing caption is plain to see.
 *
 *   1.2.2  the briefing's captions: none, automatic and never checked, or accurate.
 *   1.2.4  the live stream's captions: in step, lagging a whole line, or missing.
 *
 * The player's screen is the lab mock, inert and hidden from assistive technology; the readouts
 * carry the same text. The transport (Play, position) is the lab's own controls.
 */

/** A lab's transport: Play/Pause and the position. `label` names the slider (#66: two clips). */
export function Transport({
  id,
  clip,
  player,
  onToggle,
  label = `Position in ${clip.title}`,
}: {
  readonly id: string;
  readonly clip: Clip;
  readonly player: ReturnType<typeof usePlayer>;
  readonly onToggle: () => void;
  readonly label?: string;
}) {
  const whole = Math.floor(player.t);
  return (
    <div className="mplayer__bar">
      <button type="button" className="btn o sm" onClick={onToggle}>
        {player.playing ? 'Pause' : clip.live ? 'Go live' : 'Play'}
      </button>
      {clip.live ? null : (
        <>
          <label className="sr" htmlFor={`${id}-pos`}>
            {label}
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
            onChange={(e) => player.seek(Number(e.target.value))}
          />
        </>
      )}
      <span className="mplayer__time">{playerTime(clip, whole)}</span>
    </div>
  );
}

/** What is heard and what the captions show now, as text. Not live: the reader looks. */
function Readouts({ heard, caption }: { readonly heard: string; readonly caption: string | null }) {
  return (
    <dl className="mplayer-out">
      <div>
        <dt>Heard now</dt>
        <dd>
          <output aria-live="off">{heard}</output>
        </dd>
      </div>
      <div>
        <dt>Captions now</dt>
        <dd>
          <output aria-live="off" className={caption === null ? 'alog__blank' : undefined}>
            {caption ?? 'No caption on screen'}
          </output>
        </dd>
      </div>
    </dl>
  );
}

/** What is said when the reader plays or pauses. */
export const playSaid = (clip: Clip, playing: boolean, t: number) =>
  playing ? 'Paused at ' + playerTime(clip, Math.floor(t)) + '.' : clip.live ? 'Live.' : 'Playing.';

type Model<C> = { readonly choice: C; readonly said: Said | null };

export function CaptionsLab() {
  const id = useId();
  const player = usePlayer(BRIEFING);
  const [{ choice, said }, setModel] = useState<Model<Track>>({ choice: TRACK_START, said: null });
  const caption = captionAt(BRIEFING, player.t, choice);

  return (
    <LabShell
      className="lab captions-lab"
      verdict={trackVerdict(choice)}
      said={said}
      onReset={() => {
        player.reset();
        setModel({ choice: TRACK_START, said: null });
      }}
    >
      <div className="lab__mock mplayer mplayer--lab" data-lab-mock aria-hidden="true" inert>
        <PlayerScreen clip={BRIEFING} t={player.t} caption={caption} />
      </div>
      <Transport
        id={id}
        clip={BRIEFING}
        player={player}
        onToggle={() => {
          setModel((m) => ({ ...m, said: { text: playSaid(BRIEFING, player.playing, player.t) } }));
          player.toggle();
        }}
      />
      <LabChoice
        name={`${id}-track`}
        legend="Captions on this clip"
        options={TRACKS}
        value={choice}
        onChange={(v) => setModel({ choice: v, said: { text: trackSaid(v) } })}
      />
      <Readouts heard={heardAt(BRIEFING, player.t)} caption={caption} />
    </LabShell>
  );
}

export function LiveCaptionsLab() {
  const id = useId();
  const player = usePlayer(ALL_HANDS);
  const [{ choice, said }, setModel] = useState<Model<LiveCaptions>>({ choice: LIVE_START, said: null });
  const { track, lag } = liveTrack(choice);
  const caption = captionAt(ALL_HANDS, player.t, track, lag);

  return (
    <LabShell
      className="lab captions-lab"
      verdict={liveCaptionVerdict(choice)}
      said={said}
      onReset={() => {
        player.reset();
        setModel({ choice: LIVE_START, said: null });
      }}
    >
      <div className="lab__mock mplayer mplayer--lab" data-lab-mock aria-hidden="true" inert>
        <PlayerScreen clip={ALL_HANDS} t={player.t} caption={caption} />
      </div>
      <Transport
        id={id}
        clip={ALL_HANDS}
        player={player}
        onToggle={() => {
          setModel((m) => ({ ...m, said: { text: playSaid(ALL_HANDS, player.playing, player.t) } }));
          player.toggle();
        }}
      />
      <LabChoice
        name={`${id}-captions`}
        legend="Live captions"
        options={LIVE_CAPTIONS}
        value={choice}
        onChange={(v) => setModel({ choice: v, said: { text: liveSaid(v) } })}
      />
      <Readouts heard={heardAt(ALL_HANDS, player.t)} caption={caption} />
    </LabShell>
  );
}
