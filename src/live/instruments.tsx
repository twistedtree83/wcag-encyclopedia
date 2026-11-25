import type { ComponentType } from 'react';
import { AnnouncementLog } from '../labs/AnnouncementLog';
import { spoken } from '../labs/announce';
import { contextLog, keyLines, lastOf, logOf, pointerLog, type StageEvent } from './events';
import { trackOf } from './focusTrack';
import { gestureLines } from './gesture';
import { withVoices } from '../labs/language';
import { filterName } from './vision';
import { scrollLine } from '../labs/zoom';
import { menuOrderLines, siteLines } from './mockSite';

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

/**
 * The vision filter (#56): which filter is on the example, and, for each cue whose colour carries
 * meaning, its ratio through that filter and whether it still stands out.
 */
function VisionInstrument({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'vision');
  return (
    <div className="alog vis-log">
      <p className="alog__h" id={`${id}-h`}>
        Vision filter
      </p>
      <p className="vis-log__now">Seen in: {filterName(last?.filter ?? 'none')}</p>
      {last ? (
        <ul aria-labelledby={`${id}-h`}>
          {last.cues.map((c, i) => (
            <li key={i} className={c.found ? 'vis-log__ok' : 'vis-log__lost'}>
              <span aria-hidden="true">{c.found ? '✓ ' : '✕ '}</span>
              {c.line}
            </li>
          ))}
        </ul>
      ) : (
        <p className="alog__empty">Press “Vision filter” to see the example without full colour.</p>
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
 * The gesture pad under a stage (#57): a small map of the example's targets with the last
 * gesture drawn on it. A cross where a tap aimed, a dashed line to where it landed, a dot where
 * the pointer went down, a ring where it came up, the path between, and a tilted phone for a
 * tilt. The map is a picture (aria-hidden); the list beneath it says the same in text.
 */
function GesturePad({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'gesture');
  const map = last?.map;
  const downAt = last?.path[0];
  const upAt = last?.path[last.path.length - 1];
  return (
    <div className="gpad">
      <p className="alog__h" id={`${id}-h`}>
        Gesture pad
      </p>
      {last && map ? (
        <>
          <svg
            className="gpad__map"
            viewBox={`-8 -8 ${map.width + 16} ${map.height + 16}`}
            aria-hidden="true"
            focusable="false"
          >
            {map.stops.map((s, i) => (
              <rect
                key={i}
                className={i === last.downOn ? 'gpad__target is-hit' : 'gpad__target'}
                x={s.x}
                y={s.y}
                width={s.w}
                height={s.h}
                rx="2"
              />
            ))}
            {last.aim ? (
              <g className="gpad__aim">
                <line x1={last.aim.x - 4} y1={last.aim.y} x2={last.aim.x + 4} y2={last.aim.y} />
                <line x1={last.aim.x} y1={last.aim.y - 4} x2={last.aim.x} y2={last.aim.y + 4} />
                {downAt ? (
                  <line className="gpad__slip" x1={last.aim.x} y1={last.aim.y} x2={downAt.x} y2={downAt.y} />
                ) : null}
              </g>
            ) : null}
            {last.path.length > 1 ? (
              <polyline className="gpad__path" points={last.path.map((p) => `${p.x},${p.y}`).join(' ')} />
            ) : null}
            {downAt ? <circle className="gpad__down" cx={downAt.x} cy={downAt.y} r="2.5" /> : null}
            {upAt ? <circle className="gpad__up" cx={upAt.x} cy={upAt.y} r="5" /> : null}
            {last.tilt !== null ? (
              <rect
                className="gpad__tilt"
                x={map.width / 2 - 6}
                y={map.height / 2 - 10}
                width="12"
                height="20"
                rx="2"
                transform={`rotate(${last.tilt} ${map.width / 2} ${map.height / 2})`}
              />
            ) : null}
          </svg>
          <ol aria-labelledby={`${id}-h`}>
            {gestureLines(last).map((text, i) => (
              <li key={i} className={text === 'Nothing happened' ? 'alog__blank' : undefined}>
                {text}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="alog__empty">No gestures yet.</p>
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

/**
 * The mock site (#63): which page the visit is on and how many moves it took, the ways round the
 * site the page offers, and the pages passed on the way, with how each was reached.
 */
function MockSiteInstrument({ id, events }: InstrumentProps) {
  const lines = siteLines(events);
  return (
    <div className="alog msite-log">
      <p className="alog__h" id={`${id}-h`}>
        Mock site
      </p>
      {lines ? (
        <>
          <p className="msite-log__now">{lines.now}</p>
          <p className="msite-log__ways">{lines.ways}</p>
          <ol aria-labelledby={`${id}-h`}>
            {lines.trail.map((line, i) => (
              <li key={i} aria-current={i === lines.trail.length - 1 ? 'page' : undefined}>
                {line}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="alog__empty">Not loaded yet.</p>
      )}
    </div>
  );
}

/** The menu on each mock-site page visited (#63), judged against the first page's order. */
function MenuOrderInstrument({ id, events }: InstrumentProps) {
  const lines = menuOrderLines(events);
  return (
    <div className="alog vis-log morder">
      <p className="alog__h" id={`${id}-h`}>
        Menu order
      </p>
      {lines.length > 0 ? (
        <ul aria-labelledby={`${id}-h`}>
          {lines.map((l, i) => (
            <li key={i} className={l.kept ? 'vis-log__ok' : 'vis-log__lost'}>
              <span aria-hidden="true">{l.kept ? '✓ ' : '✕ '}</span>
              {l.text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="alog__empty">Not loaded yet.</p>
      )}
    </div>
  );
}

export const INSTRUMENTS: Readonly<Record<string, ComponentType<InstrumentProps>>> = {
  'gesture-pad': GesturePad,
  'announcement-log': LogInstrument,
  'voice-log': VoiceLogInstrument,
  'focus-tracker': FocusTracker,
  autofill: AutofillInstrument,
  'voice-control': VoiceInstrument,
  'vision-filter': VisionInstrument,
  'zoom-meter': ZoomMeter,
  'key-log': KeyLog,
  'pointer-log': PointerInstrument,
  context: ContextInstrument,
  'mock-site': MockSiteInstrument,
  'menu-order': MenuOrderInstrument,
};

/** The ids in `ids` that no registered instrument answers to. Empty when all resolve. */
export function unresolvedInstruments(ids: readonly string[]): string[] {
  return ids.filter((id) => !Object.hasOwn(INSTRUMENTS, id));
}
