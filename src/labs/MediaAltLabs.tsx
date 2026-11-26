import { useId, useState } from 'react';
import { LabChoice } from './LabChoice';
import { LabShell, type Said } from './LabShell';
import { Transport, playSaid } from './CaptionLabs';
import { PlayerScreen, Transcript, usePlayer } from '../live/PlayerWindow';
import { captionAt, describedAt, heardAt, pictureAt, type Clip } from '../live/mockPlayer';
import {
  ALT_OPTIONS,
  ALT_START,
  BUDGET,
  DESC_OPTIONS,
  DESC_START,
  EPISODE,
  FOLD,
  ONLY_START,
  SILENT_CLIP,
  altSaid,
  altVerdict,
  descSaid,
  descVerdict,
  onlySaid,
  onlyVerdict,
  type Alternative,
  type Description,
  type OnlyAlternatives,
} from './mediaAlternatives';

/**
 * The media alternative labs (#66), on the mock player. The reader plays the clip and adds or
 * removes its alternatives; the readouts put what is shown beside what is heard and described,
 * so a gap the soundtrack leaves is plain to see. Transcripts appear as real text under the
 * player. Description cues appear on the screen: the site is silent.
 *
 *   1.2.1  a transcript for an audio-only episode, a text description for a silent clip.
 *   1.2.3  captions only, a transcript of the dialogue, a described transcript, or description.
 *   1.2.5  no description, a described transcript only, or description cues in the gaps.
 *
 * The screens are the lab mock, inert and hidden from assistive technology; the readouts carry
 * the same text. The transport (Play, position) is the lab's own controls.
 */

/** What the clip shows, says and describes now, as text. Not live: the reader looks. */
function Readouts({ rows }: { readonly rows: readonly (readonly [string, string | null, string])[] }) {
  return (
    <dl className={`mplayer-out${rows.length > 2 ? ' mplayer-out--3' : ''}`}>
      {rows.map(([term, value, blank]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>
            <output aria-live="off" className={value === null ? 'alog__blank' : undefined}>
              {value ?? blank}
            </output>
          </dd>
        </div>
      ))}
    </dl>
  );
}

type Model<C> = { readonly choice: C; readonly said: Said | null };

/** The shared Play handler: say what happens, then play or pause. */
function useToggle<C>(clip: Clip, player: ReturnType<typeof usePlayer>, set: (f: (m: Model<C>) => Model<C>) => void) {
  return () => {
    set((m) => ({ ...m, said: { text: playSaid(clip, player.playing, player.t) } }));
    player.toggle();
  };
}

export function MediaOnlyLab() {
  const id = useId();
  // The two clips run the same length, so one transport plays both.
  const player = usePlayer(EPISODE);
  const [{ choice, said }, setModel] = useState<Model<OnlyAlternatives>>({ choice: ONLY_START, said: null });
  const onToggle = useToggle(EPISODE, player, setModel);
  const flip = (which: keyof OnlyAlternatives, on: boolean) =>
    setModel((m) => ({ choice: { ...m.choice, [which]: on }, said: { text: onlySaid(which, on) } }));

  return (
    <LabShell
      className="lab media-alt-lab media-only-lab"
      verdict={onlyVerdict(choice)}
      said={said}
      onReset={() => {
        player.reset();
        setModel({ choice: ONLY_START, said: null });
      }}
    >
      <div className="lab__mock mplayer-pair" data-lab-mock aria-hidden="true" inert>
        <div className="mplayer mplayer--lab">
          <PlayerScreen clip={EPISODE} t={player.t} caption={null} />
        </div>
        <div className="mplayer mplayer--lab">
          <PlayerScreen clip={SILENT_CLIP} t={player.t} caption={null} />
        </div>
      </div>
      <Transport id={id} clip={EPISODE} player={player} onToggle={onToggle} label="Position in both clips" />
      <fieldset className="sem-choice">
        <legend>Alternatives</legend>
        <label>
          <input type="checkbox" checked={choice.transcript} onChange={(e) => flip('transcript', e.target.checked)} />
          A transcript for the episode
        </label>
        <label>
          <input
            type="checkbox"
            checked={choice.description}
            onChange={(e) => flip('description', e.target.checked)}
          />
          A text description for the silent clip
        </label>
      </fieldset>
      <Readouts
        rows={[
          ['Episode, heard now', heardAt(EPISODE, player.t), ''],
          ['Silent clip, shown now', pictureAt(SILENT_CLIP, player.t), ''],
        ]}
      />
      {choice.transcript ? <Transcript clip={EPISODE} kind="heard" label="Episode transcript" /> : null}
      {choice.description ? <Transcript clip={SILENT_CLIP} kind="shown" label="Text description" /> : null}
    </LabShell>
  );
}

export function MediaAlternativeLab() {
  const id = useId();
  const player = usePlayer(FOLD);
  const [{ choice, said }, setModel] = useState<Model<Alternative>>({ choice: ALT_START, said: null });
  const onToggle = useToggle(FOLD, player, setModel);
  const described = choice === 'description' ? describedAt(FOLD, player.t) : null;

  return (
    <LabShell
      className="lab media-alt-lab"
      verdict={altVerdict(choice)}
      said={said}
      onReset={() => {
        player.reset();
        setModel({ choice: ALT_START, said: null });
      }}
    >
      <div className="lab__mock mplayer mplayer--lab" data-lab-mock aria-hidden="true" inert>
        <PlayerScreen clip={FOLD} t={player.t} caption={captionAt(FOLD, player.t, 'accurate')} described={described} />
      </div>
      <Transport id={id} clip={FOLD} player={player} onToggle={onToggle} />
      <LabChoice
        name={`${id}-alt`}
        legend="Alongside the clip"
        options={ALT_OPTIONS}
        value={choice}
        onChange={(v) => setModel({ choice: v, said: { text: altSaid(v) } })}
      />
      <Readouts
        rows={[
          ['Shown now', pictureAt(FOLD, player.t), ''],
          ['Heard now', heardAt(FOLD, player.t), ''],
          ['Described now', described, 'No description on screen'],
        ]}
      />
      {choice === 'transcript' ? <Transcript clip={FOLD} kind="heard" label="Transcript" /> : null}
      {choice === 'alternative' ? <Transcript clip={FOLD} kind="described" label="Described transcript" /> : null}
    </LabShell>
  );
}

export function DescriptionLab() {
  const id = useId();
  const player = usePlayer(BUDGET);
  const [{ choice, said }, setModel] = useState<Model<Description>>({ choice: DESC_START, said: null });
  const onToggle = useToggle(BUDGET, player, setModel);
  const described = choice === 'track' ? describedAt(BUDGET, player.t) : null;

  return (
    <LabShell
      className="lab media-alt-lab"
      verdict={descVerdict(choice)}
      said={said}
      onReset={() => {
        player.reset();
        setModel({ choice: DESC_START, said: null });
      }}
    >
      <div className="lab__mock mplayer mplayer--lab" data-lab-mock aria-hidden="true" inert>
        <PlayerScreen
          clip={BUDGET}
          t={player.t}
          caption={captionAt(BUDGET, player.t, 'accurate')}
          described={described}
        />
      </div>
      <Transport id={id} clip={BUDGET} player={player} onToggle={onToggle} />
      <LabChoice
        name={`${id}-desc`}
        legend="Description"
        options={DESC_OPTIONS}
        value={choice}
        onChange={(v) => setModel({ choice: v, said: { text: descSaid(v) } })}
      />
      <Readouts
        rows={[
          ['Shown now', pictureAt(BUDGET, player.t), ''],
          ['Heard now', heardAt(BUDGET, player.t), ''],
          ['Described now', described, 'No description on screen'],
        ]}
      />
      {choice === 'transcript' ? <Transcript clip={BUDGET} kind="described" label="Described transcript" /> : null}
    </LabShell>
  );
}
