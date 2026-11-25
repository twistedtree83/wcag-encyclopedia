import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  CLOCK_START,
  CLOCK_STEP,
  clockTime,
  ticked,
  toggled,
  useTicker,
  waited,
  type Clock,
} from '../live/clock';
import { LabChoice } from './LabChoice';
import { LabShell, type Said } from './LabShell';
import {
  HELPS,
  LIMITS,
  TIMEOUT_START,
  storyAt,
  storyEnd,
  storyOf,
  storySaid,
  timeoutSaid,
  timeoutVerdict,
  type Beat,
  type Help,
  type Limit,
  type Timeout,
} from './timeout';
import { searchFromTimeout, timeoutFromSearch } from './timeoutQuery';

/**
 * The 2.2.1 flagship lab (#61): the reader sets a mock session's time limit and what the site
 * offers before it ends, then runs the clock to watch Sam, who needs four minutes, finish the
 * form or lose it. The verdict is the criterion's, whatever happens to Sam.
 *
 * The clock (`src/live/clock.ts`) never runs on load; it moves on "Wait 20 seconds" or while
 * "Run the clock" is on, and stops where Sam's story ends. Changing a choice puts it back to
 * 0:00. The mock is Sam's screen, depicted: inert and hidden from assistive technology; the
 * beats list beneath it says the same in text.
 *
 * State is in the URL (`timeoutQuery.ts`), the clock never is: the page pre-renders the start,
 * applies the query after mount without announcing it, and writes changes back with
 * `history.replaceState`.
 */

type Model = { readonly state: Timeout; readonly clock: Clock; readonly said: Said | null };

const START: Model = { state: TIMEOUT_START, clock: CLOCK_START, said: null };

const LIMIT_OPTIONS = LIMITS.map((o) => ({ value: String(o.value) as `${Limit}`, label: o.label }));

/** Sam's screen at the latest beat. */
function SamScreen({ beat, help }: { readonly beat: Beat; readonly help: Help }) {
  if (beat.ends === 'lost') {
    return (
      <div className="notice notice--bad">
        <span className="notice__title">Session expired</span>
        <span>Please sign in again. Your answers have been cleared.</span>
      </div>
    );
  }
  if (beat.ends === 'sent') {
    return (
      <div className="notice">
        <span className="notice__title">Application sent</span>
        <span>Thank you, Sam. We will reply within five working days.</span>
      </div>
    );
  }
  const warning = beat.text.startsWith('A warning');
  return (
    <>
      {warning ? (
        <div className="notice">
          <span className="notice__title">Still there?</span>
          <span>Your session ends soon.</span>
          <span className="notice__actions">
            <span className="pill">More time</span>
          </span>
        </div>
      ) : null}
      {help === 'adjust' || help === 'off' ? (
        <p className="sess-mock__offer">
          {help === 'adjust' ? 'Session length: ten times longer' : 'Time limit: off'}
        </p>
      ) : null}
      <span className="lform__label">Full name</span>
      <span className="swatch-field border--strong">Sam Okaf</span>
    </>
  );
}

export function SessionLab() {
  const id = useId();
  const [{ state, clock, said }, setModel] = useState<Model>(START);
  const story = useMemo(() => storyOf(state), [state]);
  const end = storyEnd(story);
  const beats = storyAt(story, clock.now);
  const latest = beats[beats.length - 1]!;

  useEffect(() => {
    const preload = timeoutFromSearch(window.location.search);
    if (preload) setModel({ state: preload, clock: CLOCK_START, said: null });
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', pathname + searchFromTimeout(state) + hash);
  }, [state]);

  useTicker(clock.running, () =>
    setModel((m) => {
      const next = ticked(m.clock, storyEnd(storyOf(m.state)));
      const text = storySaid(storyOf(m.state), m.clock.now, next.now, true);
      return { ...m, clock: next, said: text ? { text } : m.said };
    }),
  );

  const change = (patch: Partial<Timeout>) =>
    setModel((m) => {
      const next = { ...m.state, ...patch };
      return { state: next, clock: CLOCK_START, said: { text: timeoutSaid(next) } };
    });

  const wait = () =>
    setModel((m) => {
      const next = waited(m.clock, end);
      return { ...m, clock: next, said: { text: storySaid(story, m.clock.now, next.now)! } };
    });

  const run = () =>
    setModel((m) => {
      const next = toggled(m.clock, end);
      const text = next.running
        ? 'The clock is running.'
        : m.clock.running
          ? `The clock is paused at ${clockTime(next.now)}.`
          : storySaid(story, next.now, next.now)!;
      return { ...m, clock: next, said: { text } };
    });

  return (
    <LabShell
      className="lab sess-lab"
      verdict={timeoutVerdict(state)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="sess-mock" data-lab-mock aria-hidden="true" inert>
        <SamScreen beat={latest} help={state.help} />
      </div>

      <div className="lab-controls">
        <LabChoice
          name={`${id}-limit`}
          legend="Session time limit"
          options={LIMIT_OPTIONS}
          value={String(state.limit) as `${Limit}`}
          onChange={(v) => change({ limit: Number(v) as Limit })}
        />
        <LabChoice
          name={`${id}-help`}
          legend="Before it ends"
          options={HELPS}
          value={state.help}
          onChange={(help) => change({ help })}
        />
      </div>

      <div className="sess-clock">
        <button type="button" className="btn o sm" onClick={wait}>
          Wait {CLOCK_STEP} seconds
        </button>
        <button type="button" className="btn o sm" onClick={run}>
          {clock.running ? 'Pause the clock' : 'Run the clock'}
        </button>
        <output className="sess-clock__now" aria-live="off">
          Mock time {clockTime(clock.now)}
          {clock.now >= end ? ', stopped' : clock.running ? ', running' : ''}
        </output>
      </div>

      <ol className="sess-beats" aria-label="What happens to Sam, on the mock clock">
        {beats.map((b, i) => (
          <li key={i} className={b.ends === 'lost' ? 'bad' : b.ends === 'sent' ? 'ok' : undefined}>
            <span className="sess-beats__at">{clockTime(b.at)}</span> {b.text}
          </li>
        ))}
      </ol>
    </LabShell>
  );
}
