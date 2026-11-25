import type { ComponentType } from 'react';
import { AnnouncementLog } from '../labs/AnnouncementLog';
import { spoken } from '../labs/announce';
import { contextLog, keyLines, lastOf, logOf, pointerLog, type StageEvent } from './events';
import { trackOf } from './focusTrack';
import { withVoices } from '../labs/language';
import { scrollLine } from '../labs/zoom';

/**
 * The instruments a live example's stage can carry (#43, CONTEXT.md "Instrument"), by id. A
 * record's live example names them in `instruments`; the stage draws each one directly beneath
 * the example, in that order, and feeds it the stage's events, simulated or real alike.
 *
 * An instrument is a pure view of the events: no state of its own, no reading of the DOM.
 * Adding one: write the component, then add ONE line to INSTRUMENTS (parallel tickets each add
 * their own line, so keep one entry per line, in any order).
 */

export type InstrumentProps = {
  /** A unique prefix for ids, from the stage's `useId`. */
  readonly id: string;
  readonly events: readonly StageEvent[];
};

/** The announcement log under a stage: what a screen reader said as the reader operated it. */
function LogInstrument({ id, events }: InstrumentProps) {
  return <AnnouncementLog id={id} lines={logOf(events)} empty="Nothing said yet." />;
}

/**
 * The announcement log naming the voice each line is read in (3.1.1, 3.1.2): the language that
 * applies to it, or the reader's own default voice when the markup declares none.
 */
function VoiceLogInstrument({ id, events }: InstrumentProps) {
  return <AnnouncementLog id={id} lines={withVoices(logOf(events))} empty="Nothing said yet." />;
}

/**
 * The focus tracker under a stage (#44): a small map of the example with every Tab stop numbered
 * in Tab order, the ring on the stop focus is on, and a trail through the stops it visited. The
 * map is a picture (aria-hidden); the sentence and the trail list beneath it say the same in text.
 */
function FocusTracker({ id, events }: InstrumentProps) {
  const { current, total, trail, map } = trackOf(events);
  const label = (i: number) => map?.stops[i]?.label ?? '';
  const centre = (i: number) => {
    const s = map!.stops[i]!;
    return `${s.x + s.w / 2},${s.y + s.h / 2}`;
  };
  return (
    <div className="ftrack">
      <p className="alog__h" id={`${id}-ftrack`}>
        Focus tracker
      </p>
      {map ? (
        <svg
          className="ftrack__map"
          viewBox={`-6 -6 ${map.width + 12} ${map.height + 12}`}
          aria-hidden="true"
          focusable="false"
        >
          {map.stops.map((s, i) => (
            <rect key={i} className="ftrack__stop" x={s.x} y={s.y} width={s.w} height={s.h} rx="4" />
          ))}
          {trail.length > 1 ? (
            <polyline className="ftrack__path" points={trail.map(centre).join(' ')} />
          ) : null}
          {current !== null && map.stops[current] ? (
            <rect
              className="ftrack__ring"
              x={map.stops[current].x - 4}
              y={map.stops[current].y - 4}
              width={map.stops[current].w + 8}
              height={map.stops[current].h + 8}
              rx="6"
            />
          ) : null}
          {map.stops.map((s, i) => (
            <g key={i} className={i === current ? 'ftrack__num is-on' : 'ftrack__num'}>
              <circle cx={s.x + 2} cy={s.y + 2} r="11" />
              <text x={s.x + 2} y={s.y + 2} dy="0.35em" textAnchor="middle">
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      ) : null}
      <p className="ftrack__now">
        {current === null
          ? 'Focus is not in the example yet.'
          : `Focus is on stop ${current + 1} of ${total}: ${label(current)}.`}
      </p>
      {trail.length > 0 ? (
        <ol className="ftrack__trail" aria-label="Where focus has been, oldest first">
          {trail.map((stop, i) => (
            <li key={i} aria-current={i === trail.length - 1 ? 'step' : undefined}>
              <span className="ftrack__n">{stop + 1}</span> {label(stop)}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

/** What the last "Autofill" put in each field (#49). */
function AutofillInstrument({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'autofill');
  return (
    <div className="alog">
      <p className="alog__h" id={`${id}-h`}>
        Autofill
      </p>
      {last ? (
        <ol aria-labelledby={`${id}-h`}>
          {last.fields.map((f, i) => (
            <li key={i} className={f.value ? undefined : 'alog__blank'}>
              {f.name}: {f.value || 'left empty'}
            </li>
          ))}
        </ol>
      ) : (
        <p className="alog__empty">Not tried yet.</p>
      )}
    </div>
  );
}

/** What the last voice command was, and what it clicked (#49). */
function VoiceInstrument({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'voice');
  return (
    <div className="alog">
      <p className="alog__h" id={`${id}-h`}>
        Voice control
      </p>
      {last ? (
        <ol aria-labelledby={`${id}-h`}>
          <li>You said “{last.phrase}”</li>
          <li className={last.clicked ? undefined : 'alog__blank'}>
            {last.clicked ? `Clicked ${spoken(last.clicked)}` : 'Nothing matched'}
          </li>
        </ol>
      ) : (
        <p className="alog__empty">Nothing said yet.</p>
      )}
    </div>
  );
}

/** The zoom frame's zoom and window (#53), and what scrolls in it at that zoom. */
function ZoomMeter({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'zoom');
  return (
    <div className="alog">
      <p className="alog__h" id={`${id}-h`}>
        Zoom and scrolling
      </p>
      {last ? (
        <ol aria-labelledby={`${id}-h`}>
          <li>
            Zoom {last.zoom}%: {last.width} by {last.height} CSS pixels
          </li>
          <li className={last.sideways ? 'zmeter--two' : undefined}>
            {scrollLine({ sideways: last.sideways, down: last.down })}
          </li>
        </ol>
      ) : (
        <p className="alog__empty">At 100%: not zoomed yet.</p>
      )}
    </div>
  );
}

/** The last key or dictated phrase sent to the example, where focus was, and what it set off (#45). */
function KeyLog({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'keys');
  return (
    <div className="alog">
      <p className="alog__h" id={`${id}-h`}>
        Keys
      </p>
      {last ? (
        <ol aria-labelledby={`${id}-h`}>
          {keyLines(last).map((text, i) => (
            <li key={i} className={text === 'Nothing happened' ? 'alog__blank' : undefined}>
              {text}
            </li>
          ))}
        </ol>
      ) : (
        <p className="alog__empty">No keys sent yet.</p>
      )}
    </div>
  );
}

/**
 * The simulated pointer and the tooltip (#47): where the pointer went, keys pressed, and what the
 * tooltip did after each, then whether a tooltip is open now and what it says.
 */
function PointerInstrument({ id, events }: InstrumentProps) {
  const lines = pointerLog(events);
  const popup = lastOf(events, 'popup');
  return (
    <div className="alog plog">
      <p className="alog__h" id={`${id}-h`}>
        Pointer and tooltip
      </p>
      {lines.length > 0 ? (
        <ol aria-labelledby={`${id}-h`}>
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      ) : (
        <p className="alog__empty">The pointer has not moved yet.</p>
      )}
      <p className="plog__now">
        {popup?.text ? `Open now: “${popup.text}”` : 'No tooltip is open.'}
      </p>
    </div>
  );
}

/**
 * The example's own page (#47): every page it has shown, oldest first, and what moved it there.
 * A change on focus alone is the 3.2.1 failure; a change after an action is fine.
 */
function ContextInstrument({ id, events }: InstrumentProps) {
  const lines = contextLog(events);
  return (
    <div className="alog clog">
      <p className="alog__h" id={`${id}-h`}>
        Where the example is
      </p>
      {lines.length > 0 ? (
        <ol aria-labelledby={`${id}-h`}>
          {lines.map((line, i) => (
            <li key={i} aria-current={i === lines.length - 1 ? 'page' : undefined}>
              {line}
            </li>
          ))}
        </ol>
      ) : (
        <p className="alog__empty">Not loaded yet.</p>
      )}
    </div>
  );
}

/** The frame's text size and spacing (#54), and whether any box now cuts its text off. */
function TextFitMeter({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'text-fit');
  return (
    <div className="alog">
      <p className="alog__h" id={`${id}-h`}>
        Text and clipping
      </p>
      {last ? (
        <ol aria-labelledby={`${id}-h`}>
          <li>
            Text at {last.scale}%, spacing {last.spacing ? 'on' : 'off'}
          </li>
          <li className={last.clipped ? 'zmeter--two' : undefined}>
            {last.clipped ? 'Text is cut off' : 'All the text fits'}
          </li>
        </ol>
      ) : (
        <p className="alog__empty">As designed: nothing changed yet.</p>
      )}
    </div>
  );
}

export const INSTRUMENTS: Readonly<Record<string, ComponentType<InstrumentProps>>> = {
  'announcement-log': LogInstrument,
  'voice-log': VoiceLogInstrument,
  'focus-tracker': FocusTracker,
  autofill: AutofillInstrument,
  'voice-control': VoiceInstrument,
  'zoom-meter': ZoomMeter,
  'text-fit': TextFitMeter,
  'key-log': KeyLog,
  'pointer-log': PointerInstrument,
  context: ContextInstrument,
};

/** The ids in `ids` that no registered instrument answers to. Empty when all resolve. */
export function unresolvedInstruments(ids: readonly string[]): string[] {
  return ids.filter((id) => !Object.hasOwn(INSTRUMENTS, id));
}
