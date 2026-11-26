import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { LiveExample, SimKey } from '../criteria/types';
import { announce, focusLine, fromDom, liveRegionLines, spoken } from '../labs/announce';
import { autofillValue } from '../labs/inputPurpose';
import { voiceMatches } from '../labs/labelInName';
import { ZOOMS, viewportAt, type Scrolls } from '../labs/zoom';
import { ZoomFrame } from '../labs/ZoomFrame';
import { clippedIn } from './clip';
import { SCALES } from '../labs/textFit';
import { ReaderColours } from './ReaderColours';
import { onActions } from './actions';
import { between, gestureSaid, hitAt, tapPlan, type Point } from './gesture';
import { shakeWithin } from './motion';
import {
  autofillSaid,
  contextSaid,
  keysSaid,
  pointerSaid,
  voiceSaid,
  textFitSaid,
  zoomSaid,
  rotateSaid,
  lookSaid,
  type ContextCause,
  type StageEvent,
} from './events';
import { mapOf, nodeAt, pathTo, revealWithin, step, tabStops } from './focus';
import { INSTRUMENTS } from './instruments';
import { contextOf, hoverStep, movePointer, popupText } from './pointer';
import { listOf, tabSwitchLine } from './lists';
import { cuesIn } from './cues';
import { nextFilter, seeCue, visionSaid, type VisionFilter } from './vision';
import { VisionDefs, filterPrefix, visionStyle } from './VisionDefs';
import { playerSeenIn } from './PlayerWindow';
import { siteSeenIn } from './SiteWindow';
import { siteSaid } from './mockSite';
import {
  CLOCK_START,
  CLOCK_STEP,
  ClockNow,
  clockSaid,
  ticked,
  toggled,
  useTicker,
  waited,
  withClock,
  type Clock,
  type ClockEvent,
} from './clock';

/**
 * A live example on its stage (#43, ADR 0002): the example, the input bar, then the instruments.
 *
 *   fail stage  the example is inert and aria-hidden. The bar drives a model of focus over it
 *               and draws the ring; nothing in it can take real focus or real events.
 *   pass stage  the example is real. Real keys and pointer work, and the same bar moves real
 *               focus, so a touch reader can operate it too.
 *
 * Both stages turn what happens into `StageEvent`s, and every instrument reads those, so one
 * instrument sits under both. Rendered only after hydration; the page pre-renders the static
 * example in its place.
 */

/** What "Dictate" says (#45). Speech input reaches the page as key presses, one per letter. */
const DICTATION = 'send this';

const KEY_LABEL: Readonly<Record<SimKey, string>> = {
  tab: 'Press Tab',
  'shift-tab': 'Shift+Tab',
  enter: 'Enter',
  space: 'Space',
  read: 'Read it aloud',
  autofill: 'Autofill',
  voice: 'Say what you see',
  escape: 'Escape',
  dictate: `Dictate “${DICTATION}”`,
  hover: 'Hover',
  'switch-tab': 'Switch tab',
  links: 'List the links',
  headings: 'List the headings',
  vision: 'Vision filter',
  zoom: 'Zoom in',
  'text-size': 'Enlarge text',
  spacing: 'Toggle text spacing',
  rotate: 'Rotate',
  restyle: 'Use my colours',
  tap: 'Tap',
  pinch: 'Pinch',
  'slide-off': 'Press and slide off',
  drag: 'Drag the top row down',
  shake: 'Shake the phone',
  wait: `Wait ${CLOCK_STEP} seconds`,
  run: 'Run the clock',
};

/** Where a stage's clock stops when the record gives no end, in mock seconds. */
const CLOCK_END = 180;

/**
 * A pointer event from the bar (#58), at `p` relative to the example. Touch, and not primary, so
 * the stage's recorder of the reader's own pointer leaves it alone; the example's handlers see it.
 */
function sendPointer(root: Element, el: Element, type: string, p: Point, pointerId = 1): void {
  const r = root.getBoundingClientRect();
  el.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId,
      pointerType: 'touch',
      isPrimary: false,
      clientX: r.left + p.x,
      clientY: r.top + p.y,
    }),
  );
}

/** The innermost element of the example drawn at `p`: real layout, so it works inert too. */
function elementAt(root: Element, p: Point): Element {
  const r = root.getBoundingClientRect();
  const x = r.left + p.x;
  const y = r.top + p.y;
  const all = Array.from(root.querySelectorAll('*')).reverse();
  return (
    all.find((el) => {
      const b = el.getBoundingClientRect();
      return x >= b.left && x < b.right && y >= b.top && y < b.bottom;
    }) ?? root
  );
}

/** Which keys activate which elements: Enter buttons and links, Space buttons and checkboxes. */
function activates(key: 'enter' | 'space', el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  const type = (el.getAttribute('type') ?? '').toLowerCase();
  if (tag === 'button') return true;
  if (key === 'enter') return tag === 'a' && el.hasAttribute('href');
  return tag === 'input' && (type === 'checkbox' || type === 'radio');
}

/** How many events a stage keeps; instruments show fewer. */
const KEEP = 40;

type Ring = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };

export function LiveStage({ kind, live }: { kind: 'bad' | 'good'; live: LiveExample }) {
  const id = useId();
  const simulated = kind === 'bad';
  const frame = useRef<HTMLDivElement>(null);
  const example = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<readonly StageEvent[]>([]);
  /** Fail stage: the Tab stop the drawn focus is on, or -1. */
  const [simAt, setSimAtState] = useState(-1);
  /** The same stop, current between renders, so two presses before a re-render both move it. */
  const simAtNow = useRef(-1);
  const setSimAt = useCallback((at: number) => {
    simAtNow.current = at;
    setSimAtState(at);
  }, []);
  /** Pass stage: the last Tab stop that had real focus. */
  const realAt = useRef<HTMLElement | null>(null);
  /** True while the bar is sending keys, so the real-key listener leaves them to `press`. */
  const fromBar = useRef(false);
  const [ring, setRing] = useState<Ring | null>(null);
  const [said, setSaid] = useState('');
  /** "Tap" (#57): how many taps the bar has made, and where the last one landed in the frame. */
  const taps = useRef(0);
  const [tapMark, setTapMark] = useState<Point | null>(null);
  /** "Pinch" and "Shake the phone" (#58) alternate: spread then pinch, right then left. */
  const pinches = useRef(0);
  const shakes = useRef(0);
  /** True from a real pointer down until just after its click, so its actions are a gesture's. */
  const pointing = useRef(false);
  /** The vision filter on the example (#56). */
  const [vision, setVision] = useState<VisionFilter>('none');
  /** Fail stage: the element the drawn focus is on, so the next Tab can blur it (#47). */
  const simEl = useRef<HTMLElement | null>(null);
  /** Both stages: the hover target the pointer is on, or null for away (#47). */
  const hoverEl = useRef<HTMLElement | null>(null);
  /** The bar's drawn pointer, on either stage, or null when it is away (#47). */
  const [cursor, setCursor] = useState<Ring | null>(null);
  /** What the reader last did, so a change of page in the example can say what caused it. */
  const cause = useRef<ContextCause | null>(null);
  /** A stage with "Hover" (#47) says keys with the pointer and tooltip, not with `keysSaid`. */
  const pointerStage = live.keys.includes('hover');
  /** Zoom frame (#53): the index into ZOOMS, and whether a "Zoom in" waits to be measured. */
  const [zoomAt, setZoomAt] = useState(0);
  const zoomed = useRef(false);
  /** The mock clock (#61): never runs until the bar starts it. What moved it last, and what the example showed. */
  const [clock, setClock] = useState<Clock>(CLOCK_START);
  const clockEnd = live.clock?.end ?? CLOCK_END;
  const clockMoved = useRef<ClockEvent['cause'] | null>(null);
  const timerShown = useRef<string | null>(null);
  /** Text in the frame (#54): the index into SCALES, spacing on, and whether a change waits to be measured. */
  const [scaleAt, setScaleAt] = useState(0);
  const [spaced, setSpaced] = useState(false);
  const refitted = useRef(false);
  /** "Rotate" (#55): the zoom frame on its side, and whether a turn waits to be measured. */
  const [turned, setTurned] = useState(false);
  const rotated = useRef(false);
  /** "Use my colours" (#55): the reader's own colours on the example. */
  const [restyled, setRestyled] = useState(false);

  const push = useCallback((e: StageEvent) => {
    setEvents((es) => (e.kind === 'clock' ? withClock(es, e) : [...es, e]).slice(-KEEP));
    // Real focus is spoken by the reader's own screen reader; say only what it wouldn't.
    // An autofill or a voice command is the bar's own doing, on either stage: say its outcome.
    if (e.kind === 'autofill') setSaid(autofillSaid(e));
    else if (e.kind === 'voice') setSaid(voiceSaid(e));
    else if (e.kind === 'vision') setSaid(visionSaid(e));
    else if (e.kind === 'zoom') setSaid(zoomSaid(e));
    else if (e.kind === 'text-fit') setSaid(textFitSaid(e));
    else if (e.kind === 'rotate') setSaid(rotateSaid(e));
    else if (e.kind === 'look') setSaid(lookSaid(e));
    else if (e.kind === 'keys') {
      if (!pointerStage) setSaid(keysSaid(e));
    }
    // The bar's own taps are said on both stages; a real pointer is the reader's own doing.
    else if (e.kind === 'gesture') {
      if (e.gesture !== 'pointer') setSaid(gestureSaid(e));
    }
    // A change of page in a mock reaches no screen reader on its own: say it on both stages.
    else if (e.kind === 'context') {
      if (e.cause) setSaid(contextSaid(e));
    }
    // So does a move round a mock site (#63), on both stages; not where the visit starts.
    else if (e.kind === 'site') {
      if (e.page.via) setSaid(siteSaid(e));
    }
    // The clock is the bar's own doing on both stages: say its presses, and what changed (#61).
    else if (e.kind === 'clock') {
      const text = clockSaid(e);
      if (text) setSaid(text);
    } else if (
      e.kind === 'read' ||
      ((e.kind === 'focus' || e.kind === 'change' || e.kind === 'status') && e.simulated)
    ) {
      const lines = e.kind === 'read' ? e.lines : [e.line];
      setSaid(`Screen reader says: ${lines.map((l) => spoken(l) || 'blank').join('; ')}`);
    }
  }, [pointerStage]);

  // The pointer and its tooltip (#47) are said on both stages, the move or key with what the
  // tooltip did after it: a tooltip drawn for the eye reaches no screen reader on its own.
  useEffect(() => {
    if (!pointerStage) return;
    const text = pointerSaid(events);
    if (text) setSaid(text);
  }, [events, pointerStage]);

  /** A box relative to the frame, for the drawn ring and pointer. */
  const boxOf = (el: Element): Ring => {
    const a = el.getBoundingClientRect();
    const b = frame.current!.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
  };

  const lineFor = (el: Element) => {
    const root = example.current!;
    const ax = fromDom(root);
    return focusLine(nodeAt(ax, pathTo(root, el)), ax);
  };

  /** Where every Tab stop is now, for the focus tracker. */
  const mapFor = (stops: readonly Element[]) =>
    mapOf(example.current!, stops, (el) => spoken(lineFor(el)) || 'blank');

  const press = (key: SimKey) => {
    const root = example.current;
    if (!root) return;
    if (key === 'read') {
      push({ kind: 'read', simulated, lines: announce(fromDom(root)) });
      return;
    }
    // A screen reader's own lists (#50): the example's links or headings, out of context.
    if (key === 'links' || key === 'headings') {
      push({ kind: 'read', simulated, lines: listOf(announce(fromDom(root)), key) });
      return;
    }
    // A simulated switch to the next browser tab drawn in the example (`[data-sim-tab]`), on
    // either stage: the drawn cursor is `data-sim-on` on that tab, and its title is said.
    if (key === 'switch-tab') {
      const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-sim-tab]'));
      const next = step(tabs.length, tabs.findIndex((t) => t.hasAttribute('data-sim-on')), false);
      tabs.forEach((t, i) => t.toggleAttribute('data-sim-on', i === next));
      if (next >= 0) {
        push({ kind: 'read', simulated, lines: [tabSwitchLine(tabs[next]!.textContent ?? '', '')] });
      }
      return;
    }
    // The vision filter (#56), on either stage: the next filter goes on the example, and each
    // cue's rendered colours are measured through it.
    if (key === 'vision') {
      const filter = nextFilter(vision);
      setVision(filter);
      push({ kind: 'vision', simulated, filter, cues: cuesIn(root).map((c) => seeCue(c, filter)) });
      return;
    }
    // The mock clock (#61), on either stage: "Wait" jumps it, "Run" starts or pauses it. The
    // event is pushed once the example has rendered at the new time.
    if (key === 'wait') {
      clockMoved.current = 'wait';
      setClock((c) => waited(c, clockEnd));
      return;
    }
    if (key === 'run') {
      clockMoved.current = clock.running ? 'pause' : 'run';
      setClock((c) => toggled(c, clockEnd));
      return;
    }
    // "Zoom in" steps the zoom frame through 100%, 200% and 400%, then back to 100%. The event
    // is pushed once the frame has laid out at the new zoom and measured what scrolls.
    if (key === 'zoom') {
      zoomed.current = true;
      setZoomAt((i) => (i + 1) % ZOOMS.length);
      return;
    }
    // "Enlarge text" steps the frame's text through 100%, 150% and 200%; "Toggle text spacing"
    // turns 1.4.12's four overrides on or off. The event is pushed once the frame has laid out.
    if (key === 'text-size' || key === 'spacing') {
      refitted.current = true;
      if (key === 'text-size') setScaleAt((i) => (i + 1) % SCALES.length);
      else setSpaced((on) => !on);
      return;
    }
    // "Rotate" turns the zoom frame on its side and back (#55). The event is pushed once the
    // frame has laid out turned, so it can say whether the page hid its content.
    if (key === 'rotate') {
      rotated.current = true;
      setTurned((t) => !t);
      return;
    }
    // "Use my colours" puts the reader's own colours on the example and takes them off (#55).
    if (key === 'restyle') {
      setRestyled(!restyled);
      push({ kind: 'look', simulated, zoom: ZOOMS[zoomAt]!, restyled: !restyled, image: root.querySelector('img') !== null });
      return;
    }
    if (key === 'autofill') {
      // A browser fills each field whose autocomplete names a purpose it has saved (#49).
      const fields = Array.from(root.querySelectorAll<HTMLInputElement>('input, textarea')).map(
        (el) => {
          const value = autofillValue(el.getAttribute('autocomplete') ?? undefined);
          if (value) el.value = value;
          return { name: lineFor(el).name, value };
        },
      );
      push({ kind: 'autofill', simulated, fields });
      return;
    }
    if (key === 'tap') {
      // A fingertip tap from the bar (#57), on either stage: aimed at each target in turn, it
      // lands a little off and presses whatever is under it. No drag, no path (2.5.1, 2.5.7).
      // The finger goes down and comes up (#58: an example acting on pointer down acts then),
      // and a down and up on the same target is a click. With no target it lands mid-example.
      const targets = tabStops(root);
      const map = mapOf(root, targets, (el) => lineFor(el).name || 'blank');
      const plan = tapPlan(map, taps.current);
      if (plan) taps.current += 1;
      const mid = { x: map.width / 2, y: map.height / 2 };
      const at = plan?.at ?? mid;
      const hit = plan ? hitAt(map, at) : null;
      const under = hit !== null ? targets[hit]! : elementAt(root, at);
      const actions: string[] = [];
      const unhear = onActions(root, (text) => actions.push(text));
      fromBar.current = true;
      sendPointer(root, under, 'pointerdown', at);
      const early = actions.length;
      sendPointer(root, under, 'pointerup', at);
      if (hit !== null) targets[hit]!.click();
      fromBar.current = false;
      unhear();
      const r = root.getBoundingClientRect();
      const f = frame.current!.getBoundingClientRect();
      setTapMark({ x: at.x + r.left - f.left, y: at.y + r.top - f.top });
      push({
        kind: 'gesture',
        simulated,
        gesture: 'tap',
        map,
        aim: plan?.aim ?? mid,
        aimAt: plan?.aimAt ?? null,
        path: [at],
        downOn: hit,
        upOn: hit,
        tilt: null,
        actions,
        early,
      });
      return;
    }
    if (key === 'slide-off' || key === 'drag' || key === 'pinch' || key === 'shake') {
      // The other gestures (#58), each one press on the bar, on either stage. Slide off: press
      // the first target and slide off it before letting go (2.5.2). Drag: the top row's handle
      // down past the middle of the next row (2.5.7). Pinch: two fingers on the map (2.5.1).
      // Shake: the phone, as a simulated motion; no sensor is read (2.5.4).
      const targets = tabStops(root);
      const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-drop]'));
      const map =
        key === 'drag'
          ? mapOf(root, rows, (el) => (el as HTMLElement).dataset.drop || 'blank')
          : mapOf(root, targets, (el) => lineFor(el).name || 'blank');
      const actions: string[] = [];
      const base = { kind: 'gesture', simulated, map, tilt: null } as const;
      const r = root.getBoundingClientRect();
      const centre = (el: Element): Point => {
        const b = el.getBoundingClientRect();
        return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 };
      };
      const unhear = onActions(root, (text) => actions.push(text));
      fromBar.current = true;
      let event: StageEvent | null = null;
      if (key === 'slide-off' && targets[0] && map.stops[0]) {
        const s = map.stops[0];
        const down = centre(targets[0]);
        const path = between(down, { x: Math.min(s.x + s.w + 32, map.width - 2), y: down.y }, 4);
        const up = path[path.length - 1]!;
        sendPointer(root, targets[0], 'pointerdown', down);
        const early = actions.length;
        path.slice(1).forEach((p) => sendPointer(root, targets[0]!, 'pointermove', p));
        const upOn = hitAt(map, up);
        sendPointer(root, upOn === null ? elementAt(root, up) : targets[upOn]!, 'pointerup', up);
        if (upOn === 0) targets[0].click();
        event = { ...base, gesture: 'slide', aim: down, aimAt: 0, path, downOn: 0, upOn, actions, early };
      }
      if (key === 'drag' && rows.length > 1 && map.stops[1]) {
        const handle = rows[0]!.querySelector('[data-drag]') ?? rows[0]!;
        const down = centre(handle);
        const next = map.stops[1];
        const path = between(down, { x: down.x, y: next.y + next.h * 0.75 }, 5);
        sendPointer(root, handle, 'pointerdown', down);
        const early = actions.length;
        path.slice(1).forEach((p) => sendPointer(root, handle, 'pointermove', p));
        sendPointer(root, handle, 'pointerup', path[path.length - 1]!);
        const upOn = hitAt(map, path[path.length - 1]!);
        event = { ...base, gesture: 'drag', aim: down, aimAt: 0, path, downOn: 0, upOn, actions, early };
      }
      const surface = root.querySelector('[data-pinch]');
      if (key === 'pinch' && surface) {
        const c = centre(surface);
        const spread = pinches.current % 2 === 0;
        pinches.current += 1;
        const [from, to] = spread ? [8, 40] : [40, 8];
        const path = between({ x: c.x - from, y: c.y }, { x: c.x - to, y: c.y }, 4);
        const path2 = between({ x: c.x + from, y: c.y }, { x: c.x + to, y: c.y }, 4);
        sendPointer(root, surface, 'pointerdown', path[0]!, 1);
        sendPointer(root, surface, 'pointerdown', path2[0]!, 2);
        path.slice(1).forEach((p, i) => {
          sendPointer(root, surface, 'pointermove', p, 1);
          sendPointer(root, surface, 'pointermove', path2[i + 1]!, 2);
        });
        sendPointer(root, surface, 'pointerup', path[path.length - 1]!, 1);
        sendPointer(root, surface, 'pointerup', path2[path2.length - 1]!, 2);
        event = { ...base, gesture: 'pinch', aim: null, aimAt: null, path, path2, downOn: null, upOn: null, actions };
      }
      if (key === 'shake') {
        const tilt = shakes.current % 2 === 0 ? 20 : -20;
        shakes.current += 1;
        shakeWithin(root);
        event = { ...base, gesture: 'shake', aim: null, aimAt: null, path: [], downOn: null, upOn: null, tilt, actions };
      }
      fromBar.current = false;
      unhear();
      if (event) push(event);
      return;
    }
    if (key === 'hover') {
      // The pointer moves to the next hover target that is showing, or away (#47). On both
      // stages: a touch reader has no pointer to hover with.
      const from = hoverEl.current;
      const to = hoverStep(root, from);
      hoverEl.current = to;
      cause.current = 'pointer';
      setCursor(to ? boxOf(to) : null);
      push({ kind: 'pointer', simulated, on: to ? (to.dataset.hover ?? '') : null });
      movePointer(from, to);
      return;
    }
    const stops = tabStops(root);
    if (key === 'escape' || key === 'dictate') {
      // Keys sent to whatever has focus (#45): Escape, or a dictated phrase letter by letter.
      // With no control focused they go to what the pointer is on (#47), else to the example
      // itself, as keys go to the page body. A letter the example doesn't cancel is typed into
      // the field it lands on.
      const at = simulated ? stops[simAtNow.current] : realAt.current;
      const focused = at && at.isConnected && root.contains(at) ? at : null;
      const target = focused ?? hoverEl.current ?? root.firstElementChild ?? root;
      const where = focused ? lineFor(focused) : null;
      const actions: string[] = [];
      const unhear = onActions(root, (text) => actions.push(text));
      fromBar.current = true;
      for (const k of key === 'escape' ? ['Escape'] : [...DICTATION]) {
        const typed = target.dispatchEvent(
          new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
        );
        const field = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
        if (typed && field && k.length === 1) target.value += k;
      }
      fromBar.current = false;
      unhear();
      push({
        kind: 'keys',
        simulated,
        keys: key === 'escape' ? 'Escape' : DICTATION,
        dictated: key === 'dictate',
        target: where,
        actions,
      });
      return;
    }
    if (key === 'voice') {
      // The reader says "click" and the text they see on the first control (#49). Voice
      // control clicks the control whose accessible name contains those words.
      const first = stops[0];
      if (!first) return;
      const phrase = (first.textContent ?? '').replace(/\s+/g, ' ').trim();
      const target = stops.find((el) => voiceMatches(phrase, lineFor(el).name));
      if (target) target.click();
      const clicked = target ? lineFor(target) : null;
      push({ kind: 'voice', simulated, phrase: `click ${phrase}`, clicked });
      return;
    }
    if (key === 'tab' || key === 'shift-tab') {
      const back = key === 'shift-tab';
      cause.current = 'focus';
      if (simulated) {
        const next = step(stops.length, simAtNow.current, back);
        setSimAt(next);
        // Simulated focus scrolls a scrolling box in the example as real focus would (#46).
        if (next >= 0) revealWithin(root, stops[next]!);
        if (next >= 0) {
          const el = stops[next]!;
          push({
            kind: 'focus',
            simulated,
            line: lineFor(el),
            index: next,
            total: stops.length,
            map: mapFor(stops),
          });
          // The example's own focus handlers run as they would for real focus (#47): a broken
          // one that changes the page on focus does so here, inside the inert example.
          const prev = simEl.current;
          simEl.current = el;
          if (prev && prev !== el) {
            prev.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: el }));
          }
          if (prev !== el) {
            el.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: prev }));
          }
        }
      } else {
        const next = step(stops.length, realAt.current ? stops.indexOf(realAt.current) : -1, back);
        // Real focus: the focus handler below records the event.
        if (next >= 0) stops[next]!.focus({ focusVisible: true } as FocusOptions);
      }
      return;
    }
    const target = simulated ? stops[simAtNow.current] : realAt.current;
    if (!target || !activates(key, target)) return;
    cause.current = 'action';
    const before = spoken(lineFor(target));
    target.click();
    // A control whose name, role and states didn't change (a plain button) says nothing new.
    // One that went with its page (#47) says nothing either.
    if (!target.isConnected) return;
    const after = lineFor(target);
    if (simulated && spoken(after) !== before) push({ kind: 'change', simulated, line: after });
  };

  // The drawn ring follows the simulated focus, and the layout on resize.
  useLayoutEffect(() => {
    if (!simulated) return;
    const place = () => {
      const root = example.current;
      const box = frame.current;
      const el = root && simAt >= 0 ? tabStops(root)[simAt] : undefined;
      if (!el || !box) return setRing(null);
      const a = el.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      setRing({ x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [simulated, simAt, zoomAt]);

  // Real input on the pass stage.
  useEffect(() => {
    const root = example.current;
    if (simulated || !root) return;
    const onFocus = (e: FocusEvent) => {
      const stops = tabStops(root);
      const el = e.target as HTMLElement;
      const index = stops.indexOf(el);
      if (index < 0) return;
      realAt.current = el;
      push({
        kind: 'focus',
        simulated: false,
        line: lineFor(el),
        index,
        total: stops.length,
        map: mapFor(stops),
      });
    };
    const onChange = (e: Event) => {
      push({ kind: 'change', simulated: false, line: lineFor(e.target as Element) });
    };
    // A real key that made the example do something (#45): Escape closing a dialog, or a
    // focus-scoped shortcut. Keys that did nothing are the reader's own business, except Escape
    // on a stage with "Hover" (#47), whose pointer log shows it with what the tooltip did.
    // A Tab key also marks focus as the reader's doing, for a change of page (#47): focus the
    // example moves itself (after Go, say) is not.
    let lastKey = '';
    const onKey = (e: KeyboardEvent) => {
      if (fromBar.current) return;
      lastKey = e.key;
      if (!e.isTrusted) return;
      if (e.key === 'Tab') cause.current = 'focus';
      if (e.key === 'Escape' && pointerStage) {
        const el = document.activeElement;
        push({
          kind: 'keys',
          simulated: false,
          keys: 'Escape',
          dictated: false,
          target: el && el !== root && root.contains(el) ? lineFor(el) : null,
          actions: [],
        });
      }
    };
    const onAction = (text: string) => {
      if (fromBar.current || pointing.current) return;
      const el = document.activeElement;
      push({
        kind: 'keys',
        simulated: false,
        keys: lastKey,
        dictated: false,
        target: el && el !== root && root.contains(el) ? lineFor(el) : null,
        actions: [text],
      });
    };
    // A real pointer (#57): down, the path while it is down, up, and what its click set off.
    let down: { path: Point[]; downOn: number | null; actions: string[] } | null = null;
    const pointAt = (e: PointerEvent): Point => {
      const r = root.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const targetMap = () => mapOf(root, tabStops(root), (el) => lineFor(el).name || 'blank');
    const onDown = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      pointing.current = true;
      down = { path: [pointAt(e)], downOn: hitAt(targetMap(), pointAt(e)), actions: [] };
    };
    const onMove = (e: PointerEvent) => {
      if (down && e.isPrimary && down.path.length < 60) down.path.push(pointAt(e));
    };
    const onUp = (e: PointerEvent) => {
      if (!down || !e.isPrimary) return;
      const gesture = down;
      gesture.path.push(pointAt(e));
      const map = targetMap();
      const upOn = hitAt(map, pointAt(e));
      // What fired before the pointer came up acted on the way down (2.5.2, #58).
      const early = gesture.actions.length;
      // The click, and the example's response to it, follow the pointer up in the same task.
      window.setTimeout(() => {
        pointing.current = false;
        down = null;
        push({
          kind: 'gesture',
          simulated: false,
          gesture: 'pointer',
          map,
          aim: null,
          aimAt: null,
          path: gesture.path,
          downOn: gesture.downOn,
          upOn,
          tilt: null,
          actions: gesture.actions,
          early,
        });
      }, 0);
    };
    const onCancel = () => {
      pointing.current = false;
      down = null;
    };
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onCancel);
    const unhearPointer = onActions(root, (text) => down?.actions.push(text));
    const onClick = () => {
      cause.current = 'action';
    };
    // A real pointer: onto a hover target, between them, or out of the example (#47). The bar's
    // own moves are untrusted events and are pushed by `press`.
    const onOver = (e: MouseEvent) => {
      if (!e.isTrusted) return;
      const to = (e.target as Element).closest<HTMLElement>('[data-hover]');
      if (to === hoverEl.current || (to && !root.contains(to))) return;
      hoverEl.current = to;
      cause.current = 'pointer';
      setCursor(null);
      push({ kind: 'pointer', simulated: false, on: to ? (to.dataset.hover ?? '') : null });
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.isTrusted || hoverEl.current === null) return;
      hoverEl.current = null;
      push({ kind: 'pointer', simulated: false, on: null });
    };
    root.addEventListener('focusin', onFocus);
    root.addEventListener('change', onChange);
    root.addEventListener('keydown', onKey, true);
    const unhearKeys = onActions(root, onAction);
    root.addEventListener('click', onClick);
    root.addEventListener('mouseover', onOver);
    root.addEventListener('mouseleave', onLeave);
    return () => {
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onCancel);
      unhearPointer();
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('change', onChange);
      root.removeEventListener('keydown', onKey, true);
      unhearKeys();
      root.removeEventListener('click', onClick);
      root.removeEventListener('mouseover', onOver);
      root.removeEventListener('mouseleave', onLeave);
    };
  }, [simulated, push, pointerStage]);

  // What the example shows (#47), on both stages: its tooltips and its own page. Read after any
  // change in it, whatever caused the change, so instruments see the outcome, not the intent.
  const started = useRef(false);
  useEffect(() => {
    const root = example.current;
    if (!root) return;
    let address = contextOf(root);
    let popup = popupText(root);
    if (address !== null && !started.current) {
      push({ kind: 'context', simulated, address, cause: null });
    }
    started.current = true;
    const observer = new MutationObserver(() => {
      const nextAddress = contextOf(root);
      if (nextAddress !== null && nextAddress !== address) {
        address = nextAddress;
        push({ kind: 'context', simulated, address, cause: cause.current });
        // A new page restarts the focus tracker; where real focus is now goes back on it.
        const active = document.activeElement;
        const stops = tabStops(root);
        if (!simulated && active instanceof HTMLElement && stops.includes(active)) {
          push({
            kind: 'focus',
            simulated: false,
            line: lineFor(active),
            index: stops.indexOf(active),
            total: stops.length,
            map: mapFor(stops),
          });
        }
      }
      const nextPopup = popupText(root);
      if (nextPopup !== popup) {
        popup = nextPopup;
        push({ kind: 'popup', simulated, text: popup });
      }
      // Simulated focus on something that went away goes nowhere, as real focus would.
      const el = simEl.current;
      if (simulated && el && (!el.isConnected || el.closest('[hidden]'))) {
        simEl.current = null;
        setSimAt(-1);
      }
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['hidden'],
    });
    return () => observer.disconnect();
    // lineFor and mapFor read refs only.
  }, [simulated, push]);

  // A mock site (#63), on both stages: the page it shows, read after any change in it, so the
  // instruments see where the reader got to and how, whatever moved it there.
  // Kept across effect runs, so StrictMode's second run doesn't push the first page twice.
  const siteShown = useRef('');
  useEffect(() => {
    const root = example.current;
    if (!root) return;
    const read = () => {
      const page = siteSeenIn(root);
      const key = page ? JSON.stringify(page) : '';
      if (!page || key === siteShown.current) return;
      siteShown.current = key;
      push({ kind: 'site', simulated, page });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-site-page', 'data-site-address'],
    });
    return () => observer.disconnect();
  }, [simulated, push]);

  // Status messages (4.1.3), on both stages: when a live region's text changes, it is announced
  // wherever focus is. Read from attributes, so the inert fail stage is judged the same way.
  useEffect(() => {
    const root = example.current;
    if (!root) return;
    let heard = liveRegionLines(fromDom(root)).map(spoken);
    const observer = new MutationObserver(() => {
      const lines = liveRegionLines(fromDom(root));
      lines.forEach((line, i) => {
        if (line.name && spoken(line) !== heard[i]) push({ kind: 'status', simulated, line });
      });
      heard = lines.map(spoken);
    });
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, [simulated, push]);

  // The clock (#61): ticks only while the reader has it running.
  useTicker(clock.running, () => {
    clockMoved.current = 'tick';
    setClock((c) => ticked(c, clockEnd));
  });
  // What the example shows on the clock, before the reader first moves it, and any change it
  // makes itself between moves ("Give me more time"). A change the clock made is pushed by the
  // layout effect below before this observer runs, so it is never pushed twice.
  const clockAt = useRef(clock);
  clockAt.current = clock;
  useEffect(() => {
    const root = example.current;
    if (!root) return;
    const read = () => root.querySelector('[data-timer]')?.getAttribute('data-timer') ?? null;
    timerShown.current = read();
    const observer = new MutationObserver(() => {
      const shows = read();
      if (shows === timerShown.current) return;
      const from = timerShown.current;
      timerShown.current = shows;
      const { now, running } = clockAt.current;
      push({ kind: 'clock', simulated, cause: 'example', now, running, shows, from });
    });
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-timer'] });
    return () => observer.disconnect();
  }, [simulated, push]);
  // Once the example has rendered at the new mock time, say what it shows now.
  useLayoutEffect(() => {
    const moved = clockMoved.current;
    const root = example.current;
    if (moved === null || !root) return;
    clockMoved.current = null;
    const cause = (moved === 'tick' || moved === 'run') && !clock.running ? 'end' : moved;
    const shows = root.querySelector('[data-timer]')?.getAttribute('data-timer') ?? null;
    const from = timerShown.current;
    timerShown.current = shows;
    push({ kind: 'clock', simulated, cause, now: clock.now, running: clock.running, shows, from });
  }, [clock, simulated, push]);

  // The mock player (#65), on both stages: where the clip is, what is heard and the caption on
  // screen, read from its `[data-player]` whenever any of that changes, whatever changed it.
  useEffect(() => {
    const root = example.current;
    if (!root || !root.querySelector('[data-player]')) return;
    let last = '';
    const read = () => {
      const seen = playerSeenIn(root);
      const key = JSON.stringify(seen);
      if (!seen || key === last) return;
      last = key;
      push({ kind: 'player', simulated, seen });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, [simulated, push]);

  const onMeasure = (scrolls: Scrolls) => {
    if (refitted.current) {
      refitted.current = false;
      push({ kind: 'text-fit', simulated, scale: SCALES[scaleAt]!, spacing: spaced, clipped: clippedIn(example.current) });
    }
    // A turn (#55): whether the page now draws its rotate prompt, i.e. hid its content.
    if (rotated.current && live.zoomFrame) {
      rotated.current = false;
      const prompt = example.current?.querySelector('[data-rotate-prompt]');
      const hidden = !!prompt && prompt.getClientRects().length > 0;
      push({ kind: 'rotate', simulated, turned, ...viewportAt(ZOOMS[zoomAt]!, live.zoomFrame, turned), hidden });
    }
    if (!zoomed.current || !live.zoomFrame) return;
    zoomed.current = false;
    const zoom = ZOOMS[zoomAt]!;
    push({ kind: 'zoom', simulated, zoom, ...viewportAt(zoom, live.zoomFrame), ...scrolls });
    // A 1.4.5 stage (#55) also says how the heading looks at the new zoom.
    if (live.keys.includes('restyle')) {
      push({ kind: 'look', simulated, zoom, restyled, image: example.current?.querySelector('img') != null });
    }
  };

  const { Example } = live;
  const prefix = filterPrefix(id);
  const filtered = live.keys.includes('vision')
    ? { className: 'live__example vis-target', style: visionStyle(vision, prefix) }
    : { className: 'live__example' };
  // "Use my colours" (#55) wraps the example in the reader's colours; only stages with the key.
  const styled = live.keys.includes('restyle') ? (
    <ReaderColours on={restyled}>
      <Example />
    </ReaderColours>
  ) : (
    <Example />
  );
  const shown = (
    <ClockNow.Provider value={clock.now}>
      {live.zoomFrame ? (
        <ZoomFrame
          zoom={ZOOMS[zoomAt]!}
          base={live.zoomFrame}
          textScale={SCALES[scaleAt]! / 100}
          spacing={spaced}
          turned={turned}
          focusable={!simulated}
          onMeasure={onMeasure}
        >
          {styled}
        </ZoomFrame>
      ) : (
        <Example />
      )}
    </ClockNow.Provider>
  );
  return (
    <>
      <div className="stage__example live__frame" ref={frame}>
        {simulated ? (
          <div {...filtered} ref={example} aria-hidden="true" inert>
            {shown}
          </div>
        ) : (
          <div {...filtered} ref={example}>
            {shown}
          </div>
        )}
        {live.keys.includes('vision') ? <VisionDefs prefix={prefix} /> : null}
        {simulated && !live.hideRing ? (
          <span
            className="sim-ring"
            aria-hidden="true"
            data-on={ring ? 'true' : 'false'}
            style={
              ring
                ? {
                    width: `${ring.w}px`,
                    height: `${ring.h}px`,
                    transform: `translate(${ring.x}px, ${ring.y}px)`,
                  }
                : undefined
            }
          />
        ) : null}
        {live.keys.includes('tap') ? (
          <span
            className="sim-tap"
            aria-hidden="true"
            data-on={tapMark ? 'true' : 'false'}
            style={tapMark ? { transform: `translate(${tapMark.x}px, ${tapMark.y}px)` } : undefined}
          />
        ) : null}
        {live.keys.includes('hover') ? (
          // The bar's pointer, drawn on either stage (#47): it moves by transform only.
          <span
            className="sim-cursor"
            aria-hidden="true"
            data-on={cursor ? 'true' : 'false'}
            style={
              cursor
                ? {
                    transform: `translate(${cursor.x + Math.min(cursor.w / 2, 24)}px, ${cursor.y + cursor.h / 2}px)`,
                  }
                : undefined
            }
          >
            <svg viewBox="0 0 16 22" width="16" height="22" focusable="false">
              <path d="M1 1 L1 17 L5 13 L8 20 L11 19 L8 12 L14 12 Z" />
            </svg>
          </span>
        ) : null}
      </div>
      <div
        className="inbar"
        role="group"
        aria-label={simulated ? 'Simulated input for the broken example' : 'Input for the fixed example'}
      >
        {live.keys.map((key) => (
          <button key={key} type="button" className="btn o sm" onClick={() => press(key)}>
            {key === 'run' && clock.running ? 'Pause the clock' : KEY_LABEL[key]}
          </button>
        ))}
      </div>
      <div className="stage__instruments">
        {live.instruments.map((name) => {
          const Instrument = INSTRUMENTS[name]!;
          return <Instrument key={name} id={`${id}-${name}`} events={events} />;
        })}
        <p className="sr" aria-live="polite">
          {said}
        </p>
      </div>
    </>
  );
}
