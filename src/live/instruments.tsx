import type { ComponentType, ReactNode } from 'react';
import { AnnouncementLog } from '../labs/shared/AnnouncementLog';
import { spoken } from '../labs/shared/announce';
import { contextLog, keyLines, lastOf, logOf, pointerLog, type StageEvent } from './events';
import { trackOf } from './focusTrack';
import { gestureLines } from './gesture';
import { withVoices } from '../labs/language/language';
import { filterName } from './vision';
import { scrollLine } from '../labs/shared/zoom';
import { colourLine, sharpLine } from './readouts';
import { PlayerLog } from './PlayerWindow';
import { helpPlaceLines, menuOrderLines, searchNameLines, siteLines } from './mockSite';
import { clockLines, clockNowLine } from './clock';

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

/**
 * The skeleton most instruments share: a titled `.alog` panel, then a list named by that title,
 * or a short note while there is nothing to list. `before` and `after` sit around the list.
 */
function LogPanel({
  id,
  title,
  className,
  list = 'ol',
  items,
  empty,
  before,
  after,
}: {
  id: string;
  title: string;
  className?: string;
  list?: 'ol' | 'ul';
  /** The list's items, or `null` while there is nothing to list. */
  items: ReactNode[] | null;
  /** What shows instead of the list; `null` shows nothing. */
  empty: string | null;
  before?: ReactNode;
  after?: ReactNode;
}) {
  const List = list;
  return (
    <div className={className ? `alog ${className}` : 'alog'}>
      <p className="alog__h" id={`${id}-h`}>
        {title}
      </p>
      {before}
      {items ? (
        <List aria-labelledby={`${id}-h`}>{items}</List>
      ) : empty !== null ? (
        <p className="alog__empty">{empty}</p>
      ) : null}
      {after}
    </div>
  );
}

/** Items for a list of lines, `null` when there are none. */
const someOf = <T,>(lines: readonly T[], item: (line: T, i: number) => ReactNode) =>
  lines.length > 0 ? lines.map(item) : null;

/** A line that says nothing happened is drawn faint. */
const blankIf = (blank: boolean) => (blank ? 'alog__blank' : undefined);

/** A line that shows the failure is drawn in the failure colour. */
const twoIf = (two: boolean) => (two ? 'zmeter--two' : undefined);

/** What the last "Autofill" put in each field (#49). */
function AutofillInstrument({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'autofill');
  return (
    <LogPanel
      id={id}
      title="Autofill"
      items={
        last
          ? last.fields.map((f, i) => (
              <li key={i} className={blankIf(!f.value)}>
                {f.name}: {f.value || 'left empty'}
              </li>
            ))
          : null
      }
      empty="Not tried yet."
    />
  );
}

/** What the last voice command was, and what it clicked (#49). */
function VoiceInstrument({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'voice');
  return (
    <LogPanel
      id={id}
      title="Voice control"
      items={
        last
          ? [
              <li key="said">You said “{last.phrase}”</li>,
              <li key="did" className={blankIf(!last.clicked)}>
                {last.clicked ? `Clicked ${spoken(last.clicked)}` : 'Nothing matched'}
              </li>,
            ]
          : null
      }
      empty="Nothing said yet."
    />
  );
}

/** One judged line: a ✓ or ✕ glyph, hidden, then the words. */
const judged = (ok: boolean, text: string, key: number) => (
  <li key={key} className={ok ? 'vis-log__ok' : 'vis-log__lost'}>
    <span aria-hidden="true">{ok ? '✓ ' : '✕ '}</span>
    {text}
  </li>
);

/**
 * The vision filter (#56): which filter is on the example, and, for each cue whose colour carries
 * meaning, its ratio through that filter and whether it still stands out.
 */
function VisionInstrument({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'vision');
  return (
    <LogPanel
      id={id}
      title="Vision filter"
      className="vis-log"
      list="ul"
      before={<p className="vis-log__now">Seen in: {filterName(last?.filter ?? 'none')}</p>}
      items={last ? last.cues.map((c, i) => judged(c.found, c.line, i)) : null}
      empty="Press “Vision filter” to see the example without full colour."
    />
  );
}

/** The zoom frame's zoom and window (#53), and what scrolls in it at that zoom. */
function ZoomMeter({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'zoom');
  return (
    <LogPanel
      id={id}
      title="Zoom and scrolling"
      items={
        last
          ? [
              <li key="zoom">
                Zoom {last.zoom}%: {last.width} by {last.height} CSS pixels
              </li>,
              <li key="scroll" className={twoIf(last.sideways)}>
                {scrollLine({ sideways: last.sideways, down: last.down })}
              </li>,
            ]
          : null
      }
      empty="At 100%: not zoomed yet."
    />
  );
}

/** The phone's way up and window (#55), and whether the page still shows its content. */
function OrientationMeter({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'rotate');
  return (
    <LogPanel
      id={id}
      title="Orientation"
      items={
        last
          ? [
              <li key="way">
                {last.turned ? 'Landscape' : 'Portrait'}: {last.width} by {last.height} CSS pixels
              </li>,
              <li key="shown" className={twoIf(last.hidden)}>
                {last.hidden ? 'Content hidden: the page asks to be turned back' : 'Content shown'}
              </li>,
            ]
          : null
      }
      empty="Upright: not turned yet."
    />
  );
}

/** How the 1.4.5 heading looks after a zoom or the reader's colours (#55). */
function TextLook({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'look');
  return (
    <LogPanel
      id={id}
      title="Zoom and your colours"
      items={
        last
          ? [
              <li key="sharp" className={twoIf(last.image && last.zoom > 100)}>
                {sharpLine(last.zoom, last.image)}
              </li>,
              <li key="colour" className={twoIf(last.image && last.restyled)}>
                {colourLine(last.restyled, last.image)}
              </li>,
            ]
          : null
      }
      empty="At 100%, in the page’s own colours."
    />
  );
}

/** The last key or dictated phrase sent to the example, where focus was, and what it set off (#45). */
function KeyLog({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'keys');
  return (
    <LogPanel
      id={id}
      title="Keys"
      items={
        last
          ? keyLines(last).map((text, i) => (
              <li key={i} className={blankIf(text === 'Nothing happened')}>
                {text}
              </li>
            ))
          : null
      }
      empty="No keys sent yet."
    />
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
            {/* A pinch's second finger (#58). */}
            {last.path2 && last.path2.length > 1 ? (
              <>
                <polyline className="gpad__path" points={last.path2.map((p) => `${p.x},${p.y}`).join(' ')} />
                <circle className="gpad__down" cx={last.path2[0]!.x} cy={last.path2[0]!.y} r="2.5" />
                <circle className="gpad__up" cx={last.path2[last.path2.length - 1]!.x} cy={last.path2[last.path2.length - 1]!.y} r="5" />
              </>
            ) : null}
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
  const popup = lastOf(events, 'popup');
  return (
    <LogPanel
      id={id}
      title="Pointer and tooltip"
      className="plog"
      items={someOf(pointerLog(events), (line, i) => (
        <li key={i}>{line}</li>
      ))}
      empty="The pointer has not moved yet."
      after={
        <p className="plog__now">{popup?.text ? `Open now: “${popup.text}”` : 'No tooltip is open.'}</p>
      }
    />
  );
}

/** Items for a trail of lines, the last one marked current. */
const trailOf = (lines: readonly string[], current: 'page' | 'step') =>
  someOf(lines, (line, i) => (
    <li key={i} aria-current={i === lines.length - 1 ? current : undefined}>
      {line}
    </li>
  ));

/**
 * The example's own page (#47): every page it has shown, oldest first, and what moved it there.
 * A change on focus alone is the 3.2.1 failure; a change after an action is fine.
 */
function ContextInstrument({ id, events }: InstrumentProps) {
  return (
    <LogPanel
      id={id}
      title="Where the example is"
      className="clog"
      items={trailOf(contextLog(events), 'page')}
      empty="Not loaded yet."
    />
  );
}

/**
 * The mock site (#63): which page the visit is on and how many moves it took, the ways round the
 * site the page offers, and the pages passed on the way, with how each was reached.
 */
function MockSiteInstrument({ id, events }: InstrumentProps) {
  const lines = siteLines(events);
  return (
    <LogPanel
      id={id}
      title="Mock site"
      className="msite-log"
      before={
        lines ? (
          <>
            <p className="msite-log__now">{lines.now}</p>
            <p className="msite-log__ways">{lines.ways}</p>
          </>
        ) : null
      }
      items={lines ? (trailOf(lines.trail, 'page') ?? []) : null}
      empty="Not loaded yet."
    />
  );
}

/** A judged line per mock-site page (#63, #64): a ✓ or ✕ glyph, hidden, then the words. */
function JudgedLines({
  id,
  title,
  className,
  lines,
}: {
  id: string;
  title: string;
  className: string;
  lines: readonly { text: string; kept: boolean }[];
}) {
  return (
    <LogPanel
      id={id}
      title={title}
      className={`vis-log ${className}`}
      list="ul"
      items={someOf(lines, (l, i) => judged(l.kept, l.text, i))}
      empty="Not loaded yet."
    />
  );
}

/** The menu on each mock-site page visited (#63), judged against the first page's order. */
function MenuOrderInstrument({ id, events }: InstrumentProps) {
  return <JudgedLines id={id} title="Menu order" className="morder" lines={menuOrderLines(events)} />;
}

/**
 * The clock (#61): the stage's mock time, whether it is running, and each time the example
 * changed on it (a warning, an expiry), with when. It never starts on its own.
 */
function ClockInstrument({ id, events }: InstrumentProps) {
  return (
    <LogPanel
      id={id}
      title="Clock"
      className="clock-log"
      before={<p className="clock-log__now">{clockNowLine(events)}</p>}
      items={someOf(clockLines(events), (line, i) => (
        <li key={i}>{line}</li>
      ))}
      empty={null}
    />
  );
}

/** The search button's name on each mock-site page visited (#64), against the first. */
function SearchNameInstrument({ id, events }: InstrumentProps) {
  return <JudgedLines id={id} title="Search control" className="sname" lines={searchNameLines(events)} />;
}

/** Where each mock-site page visited keeps its help link (#64), against the first with one. */
function HelpPlaceInstrument({ id, events }: InstrumentProps) {
  return <JudgedLines id={id} title="Help link" className="hplace" lines={helpPlaceLines(events)} />;
}

/** The frame's text size and spacing (#54), and whether any box now cuts its text off. */
function TextFitMeter({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'text-fit');
  return (
    <LogPanel
      id={id}
      title="Text and clipping"
      items={
        last
          ? [
              <li key="size">
                Text at {last.scale}%, spacing {last.spacing ? 'on' : 'off'}
              </li>,
              <li key="clip" className={twoIf(last.clipped)}>
                {last.clipped ? 'Text is cut off' : 'All the text fits'}
              </li>,
            ]
          : null
      }
      empty="As designed: nothing changed yet."
    />
  );
}

export const INSTRUMENTS = {
  clock: ClockInstrument,
  'gesture-pad': GesturePad,
  'mock-player': PlayerLog,
  'announcement-log': LogInstrument,
  'voice-log': VoiceLogInstrument,
  'focus-tracker': FocusTracker,
  autofill: AutofillInstrument,
  'voice-control': VoiceInstrument,
  'vision-filter': VisionInstrument,
  'zoom-meter': ZoomMeter,
  'text-fit': TextFitMeter,
  'orientation-meter': OrientationMeter,
  'text-look': TextLook,
  'key-log': KeyLog,
  'pointer-log': PointerInstrument,
  context: ContextInstrument,
  'mock-site': MockSiteInstrument,
  'menu-order': MenuOrderInstrument,
  'search-name': SearchNameInstrument,
  'help-place': HelpPlaceInstrument,
} as const satisfies Readonly<Record<string, ComponentType<InstrumentProps>>>;

/** An instrument's id: one key of INSTRUMENTS. */
export type InstrumentId = keyof typeof INSTRUMENTS;

/** The ids in `ids` that no registered instrument answers to. Empty when all resolve. */
export function unresolvedInstruments(ids: readonly string[]): string[] {
  return ids.filter((id) => !Object.hasOwn(INSTRUMENTS, id));
}
