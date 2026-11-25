import { useId, useMemo, useState } from 'react';
import { CLOCK_START, clockTime, ticked, toggled, useTicker, waited, type Clock } from '../live/clock';
import { LabChoice } from './LabChoice';
import { LabShell, type Said } from './LabShell';
import { storyAt, storyEnd, storySaid, type StoryBeat } from './clockStory';
import {
  CAROUSEL_CONTROLS,
  CAROUSEL_MOVES,
  CAROUSEL_START,
  carouselAt,
  carouselSaid,
  carouselStory,
  carouselVerdict,
  type Carousel,
} from './carousel';
import {
  AUDIO_CONTROLS,
  AUDIO_TRACKS,
  AUTOPLAY_START,
  audioSaid,
  audioStory,
  audioVerdict,
  levelsAt,
  playingAt,
  type Autoplay,
} from './autoplay';
import { FLASH_START, RATE_OPTIONS, flashSaid, flashVerdict, type FlashRate } from './flashRate';
import { FlashMeter, FlashStrip, LevelMeter, Slides } from './timingParts';

/**
 * The timing labs (#62), on the mock clock (`src/live/clock.ts`), which never runs on load:
 *
 *   2.2.2  "Try it: stop the carousel"     what the carousel offers, and how long it moves
 *   1.4.2  "Try it: quiet the autoplay"    what the page offers, and how long the track plays
 *   2.3.1  "Try it: raise the flash rate"  the banner's flash rate against the meter's limit
 *
 * The first two run a story on the clock (`clockStory.ts`), as the 2.2.1 lab does: "Wait 2
 * seconds" or "Run the clock", and a change of choice sets the clock back to 0:00. The 2.3.1 lab
 * has no clock: the page never flashes, so the rate is drawn, never played.
 */

/** How far a timing lab's "Wait" moves its clock: these stories play out in seconds. */
const STEP = 2;

type Model<S> = { readonly state: S; readonly clock: Clock; readonly said: Said | null };

/** A lab's state, its clock and what it says, with the clock's moves and a change of choice. */
function useClockStory<S>(
  start: S,
  storyOf: (s: S) => StoryBeat[],
  stateSaid: (s: S) => string,
  still: string,
) {
  const first: Model<S> = { state: start, clock: CLOCK_START, said: null };
  const [model, setModel] = useState<Model<S>>(first);
  const story = useMemo(() => storyOf(model.state), [model.state, storyOf]);
  const end = storyEnd(story);

  useTicker(model.clock.running, () =>
    setModel((m) => {
      const s = storyOf(m.state);
      const next = ticked(m.clock, storyEnd(s));
      const text = storySaid(s, m.clock.now, next.now, still, true);
      return { ...m, clock: next, said: text ? { text } : m.said };
    }),
  );

  return {
    ...model,
    story,
    end,
    beats: storyAt(story, model.clock.now),
    change: (patch: Partial<S>) =>
      setModel((m) => {
        const next = { ...m.state, ...patch };
        return { state: next, clock: CLOCK_START, said: { text: stateSaid(next) } };
      }),
    wait: () =>
      setModel((m) => {
        const next = waited(m.clock, end, STEP);
        return { ...m, clock: next, said: { text: storySaid(story, m.clock.now, next.now, still)! } };
      }),
    run: () =>
      setModel((m) => {
        const next = toggled(m.clock, end);
        const text = next.running
          ? 'The clock is running.'
          : m.clock.running
            ? `The clock is paused at ${clockTime(next.now)}.`
            : storySaid(story, next.now, next.now, still)!;
        return { ...m, clock: next, said: { text } };
      }),
    reset: () => setModel(first),
  };
}

/** The clock's buttons and the mock time. Never disabled, so focus isn't dropped at the end. */
function ClockBar({
  clock,
  end,
  wait,
  run,
}: {
  readonly clock: Clock;
  readonly end: number;
  readonly wait: () => void;
  readonly run: () => void;
}) {
  return (
    <div className="sess-clock">
      <button type="button" className="btn o sm" onClick={wait}>
        Wait {STEP} seconds
      </button>
      <button type="button" className="btn o sm" onClick={run}>
        {clock.running ? 'Pause the clock' : 'Run the clock'}
      </button>
      <output className="sess-clock__now" aria-live="off">
        Mock time {clockTime(clock.now)}
        {clock.now >= end ? ', stopped' : clock.running ? ', running' : ''}
      </output>
    </div>
  );
}

function Beats({ beats, label }: { readonly beats: readonly StoryBeat[]; readonly label: string }) {
  return (
    <ol className="sess-beats" aria-label={label}>
      {beats.map((b, i) => (
        <li key={i} className={b.ends}>
          <span className="sess-beats__at">{clockTime(b.at)}</span> {b.text}
        </li>
      ))}
    </ol>
  );
}

const CONTROL_PILL: Readonly<Record<Carousel['control'], string | null>> = {
  none: null,
  pause: '❚❚ Pause',
  stop: '■ Stop',
  hide: '✕ Hide',
};

export function CarouselLab() {
  const id = useId();
  const lab = useClockStory(CAROUSEL_START, carouselStory, carouselSaid, 'The carousel is still moving');
  const { state, clock } = lab;
  const slide = carouselAt(state, clock.now);
  const pill = CONTROL_PILL[state.control];
  return (
    <LabShell className="lab tim-lab carousel-lab" verdict={carouselVerdict(state)} said={lab.said} onReset={lab.reset}>
      <div className="sess-mock" data-lab-mock aria-hidden="true" inert>
        {pill ? <span className="pill">{pill}</span> : null}
        {slide === null ? <p className="sess-mock__offer">Carousel hidden</p> : <Slides slide={slide} />}
      </div>
      <div className="lab-controls">
        <LabChoice
          name={`${id}-control`}
          legend="The carousel offers"
          options={CAROUSEL_CONTROLS}
          value={state.control}
          onChange={(control) => lab.change({ control })}
        />
        <LabChoice
          name={`${id}-moves`}
          legend="It moves"
          options={CAROUSEL_MOVES}
          value={state.moves}
          onChange={(moves) => lab.change({ moves })}
        />
      </div>
      <ClockBar clock={clock} end={lab.end} wait={lab.wait} run={lab.run} />
      <Beats beats={lab.beats} label="What happens to Ana, on the mock clock" />
    </LabShell>
  );
}

const AUDIO_PILL: Readonly<Record<Autoplay['control'], string | null>> = {
  none: null,
  pause: '❚❚ Pause audio',
  volume: 'Volume ▁▃▅',
};

export function AudioLab() {
  const id = useId();
  const lab = useClockStory(AUTOPLAY_START, audioStory, audioSaid, 'The track is still playing');
  const { state, clock } = lab;
  const playing = playingAt(state, clock.now);
  const pill = AUDIO_PILL[state.control];
  return (
    <LabShell className="lab tim-lab audio-lab" verdict={audioVerdict(state)} said={lab.said} onReset={lab.reset}>
      <div className="sess-mock" data-lab-mock aria-hidden="true" inert>
        {pill ? <span className="pill">{pill}</span> : null}
        <p className="sess-mock__offer">Now playing: Summer sale jingle</p>
        <LevelMeter levels={levelsAt(playing, clock.now)} playing={playing} />
      </div>
      <div className="lab-controls">
        <LabChoice
          name={`${id}-control`}
          legend="The page offers"
          options={AUDIO_CONTROLS}
          value={state.control}
          onChange={(control) => lab.change({ control })}
        />
        <LabChoice
          name={`${id}-track`}
          legend="The track"
          options={AUDIO_TRACKS}
          value={state.track}
          onChange={(track) => lab.change({ track })}
        />
      </div>
      <ClockBar clock={clock} end={lab.end} wait={lab.wait} run={lab.run} />
      <Beats beats={lab.beats} label="What happens to Jo, on the mock clock" />
    </LabShell>
  );
}

export function FlashLab() {
  const id = useId();
  const [{ rate, said }, setModel] = useState<{ rate: FlashRate; said: Said | null }>({
    rate: FLASH_START,
    said: null,
  });
  return (
    <LabShell
      className="lab tim-lab flash-lab"
      verdict={flashVerdict(rate)}
      said={said}
      onReset={() => setModel({ rate: FLASH_START, said: null })}
    >
      <div className="sess-mock" data-lab-mock aria-hidden="true" inert>
        <p className="tbanner">Last 2 in stock</p>
        <FlashStrip rate={rate} />
      </div>
      <p className="tim-note">
        Depicted, never played: this page does not flash at any setting. The strip is one second
        of the banner, frame by frame.
      </p>
      <div className="lab-controls">
        <LabChoice
          name={`${id}-rate`}
          legend="The banner is set to flash"
          options={RATE_OPTIONS}
          value={String(rate) as `${FlashRate}`}
          onChange={(v) => {
            const next = Number(v) as FlashRate;
            setModel({ rate: next, said: { text: flashSaid(next) } });
          }}
        />
      </div>
      <FlashMeter rate={rate} />
    </LabShell>
  );
}
